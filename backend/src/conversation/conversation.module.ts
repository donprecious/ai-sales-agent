import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { AIModule } from '../ai/ai.module'; // Import AIModule to use AIService
import { DatabaseModule } from '../database/database.module'; // Import DatabaseModule to use LeadService

@Module({
  imports: [AIModule, DatabaseModule], // Make services from these modules available
  controllers: [ConversationController],
  providers: [ConversationService],
})
export class ConversationModule {}
