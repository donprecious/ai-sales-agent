import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose'; // Removed unused MongooseSchema import

// Define the structure for chat history entries
// Use 'timestamp' for creation time within chat history
@Schema({
  _id: false,
  timestamps: { createdAt: 'timestamp', updatedAt: false },
})
export class ChatMessage {
  @Prop({ type: String, required: true, enum: ['user', 'ai'] })
  sender: 'user' | 'ai';

  @Prop({ type: String, required: true })
  message: string;

  // Mongoose automatically adds 'timestamp' due to the options above
  timestamp: Date;
}
export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

// Define the main Lead schema
export type LeadDocument = Lead & Document;

export enum RelevanceTag {
  NOT_RELEVANT = 'Not relevant',
  WEAK_LEAD = 'Weak lead',
  HOT_LEAD = 'Hot lead',
  VERY_BIG_POTENTIAL = 'Very big potential customer',
}

@Schema({ timestamps: true }) // Enable automatic createdAt and updatedAt fields
export class Lead {
  @Prop({ type: String, required: true, index: true })
  email: string;

  @Prop({ type: String })
  companyName?: string; // Optional

  @Prop({
    type: String,
    required: true,
    enum: Object.values(RelevanceTag), // Use enum values
    default: RelevanceTag.WEAK_LEAD,
  })
  relevanceTag: RelevanceTag;

  @Prop({ type: [ChatMessageSchema], required: true, default: [] }) // Array of ChatMessage subdocuments
  chatHistory: ChatMessage[];

  @Prop({ type: Boolean, default: false })
  calendlyLinkClicked: boolean;

  @Prop({ type: String, default: 'pending' })
  status: string;

  @Prop({ type: Number, default: 0 }) // Track clarification attempts
  clarificationAttempts: number;

  // Mongoose automatically adds createdAt and updatedAt due to the @Schema({ timestamps: true }) option
  createdAt: Date;
  updatedAt: Date;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
