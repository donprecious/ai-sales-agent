import { Injectable } from '@nestjs/common'; // Removed NotFoundException
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Lead,
  LeadDocument,
  RelevanceTag,
  ChatMessage,
} from './schemas/lead.schema'; // Formatted imports

@Injectable()
export class LeadService {
  constructor(@InjectModel(Lead.name) private leadModel: Model<LeadDocument>) {} // Fixed constructor formatting

  // Find a lead by email or create a new one if not found
  async findOrCreateLead(email: string): Promise<LeadDocument> {
    let lead = await this.leadModel.findOne({ email }).exec();
    if (!lead) {
      // Basic lead creation, relevance will be updated later
      lead = new this.leadModel({ email, chatHistory: [] });
      await lead.save();
    }
    return lead;
  }

  // Create a new lead with initial data
  async createLead(data: {
    email: string;
    companyName?: string;
    phoneNumber?: string;
    chatHistory?: ChatMessage[];
  }): Promise<LeadDocument> {
    const newLead = new this.leadModel({
      ...data,
      companyName: data.companyName || '',
      phoneNumber: data.phoneNumber || '',
      chatHistory: data.chatHistory || [],
      // relevanceTag will use schema default
    });
    return newLead.save();
  }

  // Add a message to the lead's chat history
  async addMessageToHistory(
    leadId: string,
    message: ChatMessage,
  ): Promise<LeadDocument | null> {
    return this.leadModel
      .findByIdAndUpdate(
        leadId,
        { $push: { chatHistory: message } },
        { new: true, runValidators: true }, // Return updated doc, run schema validators
      )
      .exec();
  }

  // Update the relevance tag for a lead
  async updateRelevanceTag(
    leadId: string,
    relevanceTag: RelevanceTag,
  ): Promise<LeadDocument | null> {
    return this.leadModel
      .findByIdAndUpdate(leadId, { relevanceTag }, { new: true })
      .exec();
  }

  // Update company name
  async updateCompanyName(
    leadId: string,
    companyName: string,
  ): Promise<LeadDocument | null> {
    return this.leadModel
      .findByIdAndUpdate(leadId, { companyName }, { new: true })
      .exec();
  }

  // Update calendly link clicked status
  // Fixed indentation
  async updateCalendlyClicked(
    leadId: string,
    clicked: boolean,
  ): Promise<LeadDocument | null> {
    return (
      this.leadModel
        // Formatted arguments
        .findByIdAndUpdate(
          leadId,
          { calendlyLinkClicked: clicked },
          { new: true },
        )
        .exec()
    );
  }

  // Get a lead by ID (useful for retrieving history)
  async getLeadById(leadId: string): Promise<LeadDocument | null> {
    return this.leadModel.findById(leadId).exec();
  }

  // Increment clarification attempts
  async incrementClarificationAttempts(
    leadId: string,
  ): Promise<LeadDocument | null> {
    return this.leadModel
      .findByIdAndUpdate(
        leadId,
        { $inc: { clarificationAttempts: 1 } },
        { new: true },
      )
      .exec();
  }
}
