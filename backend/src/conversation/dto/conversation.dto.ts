/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsMongoId,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RelevanceTag } from '../../database/schemas/lead.schema';

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

export class GetLeadsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // Max 100 items per page
  limit?: number = 10;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsEnum(RelevanceTag, { message: 'Invalid relevance tag' })
  relevanceTag?: RelevanceTag; // Filter by qualification/relevance
}
