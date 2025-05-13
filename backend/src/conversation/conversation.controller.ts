import {
  Controller,
  Post,
  Body,
  Logger,
  HttpException,
  InternalServerErrorException,
  Get, // Added Get decorator
  Query, // Added Query decorator
  Param, // Added Param decorator
  NotFoundException, // Added NotFoundException
} from '@nestjs/common';
// Removed Response from 'express'
import { ConversationService } from './conversation.service';
import { ConversationRequestDto, GetLeadsQueryDto } from './dto/conversation.dto'; // Added GetLeadsQueryDto
// Removed Observable, map, catchError, throwError from 'rxjs'
// Removed Sse, MessageEvent
// Import LeadDocument for return type hint if needed, though service handles it
// import { LeadDocument } from '../database/schemas/lead.schema';

// Define the expected response type for the controller method
interface ConversationStatusResponse {
  conversationId: string;
  status: string;
}

@Controller('conversation')
export class ConversationController {
  private readonly logger = new Logger(ConversationController.name);

  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  // Removed @Sse() decorator
  async handleConversation(
    @Body() conversationDto: ConversationRequestDto,
  ): Promise<ConversationStatusResponse> {
    this.logger.log(
      `Received conversation request for leadId: ${conversationDto.leadId ?? 'new'} (Email: ${conversationDto.email ?? 'N/A'})`,
    );

    try {
      // Service now returns an object with leadId, and handles streaming via WebSocket
      const result =
        await this.conversationService.handleConversationTurn(conversationDto);

      this.logger.log(
        `Conversation processing started for leadId: ${result.leadId}. WebSocket will handle streaming.`,
      );

      // Return immediate JSON response
      return {
        conversationId: result.leadId,
        status: 'processing',
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unknown error initiating conversation.';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error initiating conversation: ${errorMessage}`,
        errorStack,
      );

      // Let NestJS handle the error response appropriately
      if (error instanceof HttpException) {
        throw error; // Re-throw if it's already an HttpException
      }
      // For other errors, throw a standard NestJS exception
      throw new InternalServerErrorException(
        `Failed to initiate conversation: ${errorMessage}`,
      );
    }
  }

  @Get('leads') // New endpoint for fetching leads
  async getLeads(@Query() queryDto: GetLeadsQueryDto) {
    this.logger.log(
      `Received request to fetch leads with query: ${JSON.stringify(queryDto)}`,
    );
    try {
      // The service method already returns the desired structure
      return await this.conversationService.getLeads(queryDto);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unknown error fetching leads.';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error fetching leads: ${errorMessage}`,
        errorStack,
      );

      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to fetch leads: ${errorMessage}`,
      );
    }
  }

  @Get('leads/:id') // New endpoint for fetching a single lead by ID
  async getLeadById(@Param('id') id: string) {
    this.logger.log(`Received request to fetch lead with ID: ${id}`);
    try {
      const lead = await this.conversationService.getLeadById(id); // Assumes getLeadById exists in ConversationService
      if (!lead) {
        throw new NotFoundException(`Lead with ID ${id} not found`);
      }
      return lead;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unknown error fetching lead details.';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error fetching lead ${id}: ${errorMessage}`,
        errorStack,
      );

      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to fetch lead ${id}: ${errorMessage}`,
      );
    }
  }
}
