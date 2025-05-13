import {
  Controller,
  Post,
  Body,
  Logger,
  HttpException,
  // HttpStatus, // Removed unused import
  InternalServerErrorException,
} from '@nestjs/common';
// Removed Response from 'express'
import { ConversationService } from './conversation.service';
import { ConversationRequestDto } from './dto/conversation.dto';
// Removed Observable, map, catchError, throwError from 'rxjs'
// Removed Sse, MessageEvent

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
}
