/* eslint-disable @typescript-eslint/no-floating-promises */
import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LeadService } from '../database/lead.service';
import { AIService } from '../ai/ai.service';
import {
  ChatMessage,
  LeadDocument,
  RelevanceTag,
} from '../database/schemas/lead.schema';
import { ConversationRequestDto } from './dto/conversation.dto';
import { Types } from 'mongoose';
import { AblyService } from '../ably/ably.service'; // Import AblyService
import { ConfigService } from '@nestjs/config'; // Import ConfigService

// StreamingResponse interface removed as it's no longer returned directly

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    private leadService: LeadService,
    private aiService: AIService,
    private ablyService: AblyService, // Inject AblyService
    private configService: ConfigService, // Inject ConfigService
  ) {}

  async handleConversationTurn(
    dto: ConversationRequestDto,
  ): Promise<{ leadId: string }> {
    let lead: LeadDocument; // Changed to LeadDocument as it will always be assigned or throw
    const {
      leadId: dtoLeadId,
      email,
      message: userMessageContent,
      ablyChannelName,
    } = dto; // Renamed message to userMessageContent and applied formatting

    // 1. Get or Create Lead
    if (dtoLeadId) {
      if (!Types.ObjectId.isValid(dtoLeadId)) {
        this.logger.warn(`Invalid leadId format received: ${dtoLeadId}`);
        throw new BadRequestException('Invalid leadId format.');
      }
      const foundLead = await this.leadService.getLeadById(dtoLeadId);
      if (!foundLead) {
        this.logger.error(
          `Invalid leadId received: ${dtoLeadId}. Lead not found.`,
        );
        throw new NotFoundException(
          `Conversation with ID ${dtoLeadId} not found. Please start a new conversation.`,
        );
      }
      lead = foundLead;
    } else {
      if (!email) {
        this.logger.warn(
          'Attempted to start a new conversation without an email.',
        );
        throw new BadRequestException(
          'Email is required to start a new conversation.',
        );
      }
      this.logger.log(`Creating new lead for email: ${email}`);
      lead = await this.leadService.createLead({
        email,
        companyName: '',
        phoneNumber: '',
        chatHistory: [],
      });
      // Ensure _id is treated as ObjectId for toString()
      this.logger.log(
        `New lead created with ID: ${(lead._id as Types.ObjectId).toString()}`,
      );
    }

    // lead is now guaranteed to be non-null here
    const leadId = (lead._id as Types.ObjectId).toString();

    // 2. Add user message to history
    const userChatMessage: ChatMessage = {
      // Renamed to avoid conflict if 'userMessage' is used elsewhere
      sender: 'user',
      message: userMessageContent,
      timestamp: new Date(),
    };

    const updatedLead = await this.leadService.addMessageToHistory(
      leadId,
      userChatMessage,
    );
    if (!updatedLead) {
      this.logger.error(`Failed to add user message for lead ${leadId}`);
      throw new InternalServerErrorException(
        'Could not update conversation history after adding user message.',
      );
    }
    lead = updatedLead; // Assign the updated lead back

    const currentHistory = lead.chatHistory;
    let fullAiResponse = ''; // Accumulate the full response

    // 3. Start AI Stream and broadcast via Ably
    // The stream processing will run asynchronously
    this.aiService.streamChatResponse(currentHistory).subscribe({
      next: (data: {
        chunk: string;
        done: boolean;
        qualificationStatus?: string | null;
      }) => {
        // Use a self-invoking async function to handle the promise
        void (async () => {
          if (!data.done) {
            fullAiResponse += data.chunk; // Accumulate response

            // Publish chunk to Ably
            this.ablyService.publishMessage(
              ablyChannelName,
              'ai_response_chunk',
              {
                chunk: data.chunk,
                done: false,
              },
            );
          } else {
            // Stream is done, process final response and qualification status
            this.logger.debug(
              `AI stream done for lead ${leadId}. Full response: "${fullAiResponse.trim()}". Qualification: ${data.qualificationStatus || 'N/A'}`,
            );

            let leadNeedsSave = false;
            let saveErrorOccurred = false;
            let saveErrorMessage = '';

            // 1. Add AI response to chat history if it's not empty
            if (fullAiResponse.trim()) {
              lead.chatHistory.push({
                sender: 'ai',
                message: fullAiResponse.trim(),
                timestamp: new Date(),
              });
              leadNeedsSave = true;
            }

            // 2. Update relevanceTag based on qualificationStatus
            if (data.qualificationStatus === 'STRONG') {
              lead.relevanceTag = RelevanceTag.HOT_LEAD;
              lead.status = 'completed'; // Updated to 'Completed'
              leadNeedsSave = true;
              this.logger.log(
                `Lead ${leadId} qualified as STRONG. Setting tag to: ${RelevanceTag.HOT_LEAD}, Status: ${lead.status}`,
              );
            } else if (data.qualificationStatus === 'WEAK') {
              lead.relevanceTag = RelevanceTag.WEAK_LEAD;
              lead.status = 'completed'; // Updated to 'Completed'
              leadNeedsSave = true;
              this.logger.log(
                `Lead ${leadId} qualified as WEAK. Setting tag to: ${RelevanceTag.WEAK_LEAD}, Status: ${lead.status}`,
              );
            }

            // 3. Save the lead document if changes were made
            if (leadNeedsSave) {
              try {
                await lead.save(); // lead is the LeadDocument from the outer scope
                this.logger.log(
                  `Lead ${leadId} updated and saved successfully. Qualification: ${data.qualificationStatus || 'N/A'}, Status: ${lead.status}, History updated: ${fullAiResponse.trim() !== ''}`,
                );
              } catch (saveError) {
                saveErrorOccurred = true;
                saveErrorMessage =
                  saveError instanceof Error
                    ? saveError.message
                    : 'Unknown error during lead save';
                this.logger.error(
                  `Failed to save lead ${leadId} after AI turn: ${saveErrorMessage}`,
                  saveError instanceof Error ? saveError.stack : undefined,
                );
              }
            } else {
              this.logger.log(
                `AI turn processed for lead ${leadId}. No updates to save. Qualification: ${data.qualificationStatus || 'N/A'}`,
              );
            }

            // 4. Publish completion signal to Ably
            const ablyPayload: {
              chunk: string;
              done: boolean;
              qualificationStatus?: string | null;
              error?: string;
            } = {
              chunk: '',
              done: true,
              qualificationStatus: data.qualificationStatus,
            };

            if (saveErrorOccurred) {
              ablyPayload.error = `Failed to save lead updates: ${saveErrorMessage}`;
            }

            this.ablyService.publishMessage(
              ablyChannelName,
              'ai_response_chunk', // Event name remains consistent
              ablyPayload,
            );

            if (saveErrorOccurred) {
              this.logger.warn(
                `Published AI completion to Ably for lead ${leadId} with save error.`,
              );
            } else {
              this.logger.log(
                `Published AI completion to Ably for lead ${leadId}. Qualification: ${data.qualificationStatus || 'N/A'}`,
              );
            }
          }
        })();
      },
      error: (streamError: unknown) => {
        const message =
          streamError instanceof Error
            ? streamError.message
            : 'Unknown streaming error';
        const stack =
          streamError instanceof Error ? streamError.stack : undefined;
        this.logger.error(
          `Error streaming AI response for lead ${leadId}: ${message}`,
          stack,
        );
        // Publish stream error to Ably
        this.ablyService.publishMessage(ablyChannelName, 'ai_response_error', {
          message: 'AI streaming failed.',
          detail: message,
        });
      },
    });

    // 4. Return leadId immediately
    return {
      leadId: leadId,
    };
  }

  // Helper to store the complete AI response
  // Formatted parameters
  private async storeAiResponse(
    leadId: string,
    message: string,
  ): Promise<void> {
    if (!message.trim()) {
      // Formatted log
      this.logger.warn(
        `Skipping storage of empty AI response for lead ${leadId}`,
      );
      return;
    }
    const aiMessage: ChatMessage = {
      sender: 'ai',
      message: message.trim(),
      timestamp: new Date(),
    };
    // Formatted call
    const updatedLead = await this.leadService.addMessageToHistory(
      leadId,
      aiMessage,
    );
    if (!updatedLead) {
      // Throw error to be caught in the stream handler
      // Formatted error
      throw new InternalServerErrorException(
        `Failed to store final AI message for lead: ${leadId}`,
      );
    }
    this.logger.log(`Stored full AI response for lead ${leadId}`);
  }
} // End of ConversationService class
