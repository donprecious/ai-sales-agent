/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsMongoId,
} from 'class-validator';

export class ConversationRequestDto {
  @IsOptional() // Optional for new conversations
  @IsMongoId() // Validate if it's a MongoDB ObjectId string
  @IsString()
  leadId?: string; // Use leadId instead of conversationId for clarity

  @IsOptional() // Email is optional if leadId is provided
  @IsEmail()
  email?: string; // Required if leadId is not provided

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  ablyChannelName: string; // Channel name provided by the frontend for Ably publishing
}

// We might need response DTOs later, but let's start with the request.
