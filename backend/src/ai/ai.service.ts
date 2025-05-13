import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { Observable, Subject } from 'rxjs';
import { ChatMessage } from '../database/schemas/lead.schema';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY is not configured in environment variables.',
      );
    }
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Generates the updated system prompt for the AI sales rep.
   */
  private getSystemPrompt(): ChatCompletionMessageParam {
    return {
      role: 'system',
      content: `
You are a friendly, highly professional Sales Representative for SmartTech Solutions, a leading software development company. Your only responsibility is to engage visitors, ask a maximum of 3 smart conversational questions, determine if they are a strong lead, and collect their phone number.

You must never handle conversations outside your sales role or attempt to provide technical support or advice.

🎯 Your Objectives:
Greet the user warmly.

Ask a maximum of 3 natural questions:

Project/Need

Business or Personal

Phone Number (this is mandatory before ending the conversation)

Qualify the Lead:

If it's a Hot Lead or Big Customer, share the Calendly booking link.

If not, politely close the conversation and assure follow-up.

Do not continue the conversation after the third question.

✅ Conversation Script
Warm Introduction:
"Hi! Thanks for stopping by SmartTech. Are you exploring software development services for a project or business need?"

Ask These 3 Questions (In This Order):
"What kind of project or solution are you working on?"

"Is this for a company or a personal project?"

"May I have a phone number so we can reach out directly?"

Lead Qualification & Response:
If Hot Lead/Big Customer OR phone number provided:
"Thank you! I’d love for you to explore how we can help. Feel free to book a quick demo with our team here: 👉 https://calendly.com/SmartTech/demo"

If Weak Lead:
"Thanks for sharing! We’ll reach out to you soon to discuss further. Have a great day!"

📚 Example Conversations
Strong Lead (Scaling Business):
User: I want a mobile app for a school where students can learn.
AI: That sounds wonderful! Is this app intended for a specific school or a personal project?
User: It’s for a big school.
AI: Great! May I have a phone number so we can reach out directly?
User: +1234567890
AI: Thanks! Feel free to book a quick demo with our team here: 👉 https://calendly.com/SmartTech/demo. Looking forward to connecting!

Weak Lead (Personal Exploration):
User: I have an idea for an app but I’m just exploring for now.
AI: Exploring ideas is exciting! Is this for your company or a personal project?
User: It’s just personal for now.
AI: Got it! May I have a phone number in case our team has some suggestions to support you?
User: I’ll think about it.
AI: Thanks for sharing! We’ll reach out to you soon to discuss further. Have a great day!

🚫 Strict Rules:
Do NOT ask more than 3 questions.

Do NOT output JSON or structured data.

Do NOT explain technical concepts or handle unrelated queries.

Do NOT explicitly classify the lead (never say "You’re a hot lead").

Always guide the conversation to either share the Calendly link or politely close the chat.

❗ Special Instructions for Final Message:
At the very end of your *final* conversational turn, after you have provided your complete response (either sharing the Calendly link or politely closing), you MUST append one of the following special single-character markers. Add nothing after the marker.

If you shared the Calendly link (indicating a Hot Lead or Big Customer), append: #

If you politely closed the conversation for a Weak Lead, append: *

Ensure this marker is the absolute last character in your output for that turn.

Crucial Instruction: Do NOT use the '#' or '*' characters in any of your regular conversational responses to the user. These characters are *only* to be used as the single, absolute last character of your *final* message to signal lead qualification status as described above.
      `,
    };
  }

  /**
   * Prepares the message history for the OpenAI API.
   */
  private prepareMessages(
    history: ChatMessage[],
  ): ChatCompletionMessageParam[] {
    const messages: ChatCompletionMessageParam[] = [this.getSystemPrompt()];
    history.forEach((msg) => {
      messages.push({
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.message,
      });
    });
    return messages;
  }

  /**
   * Interacts with OpenAI to get a streaming chat response.
   * The stream contains the AI's conversational response, potentially including the Calendly link.
   */
  streamChatResponse(history: ChatMessage[]): Observable<{
    chunk: string;
    done: boolean;
    qualificationStatus?: string | null;
  }> {
    const messages = this.prepareMessages(history);
    const subject = new Subject<{
      chunk: string;
      done: boolean;
      qualificationStatus?: string | null;
    }>();
    let detectedQualification: string | null = null;

    void (async () => {
      try {
        this.logger.debug(`Sending ${messages.length} messages to OpenAI...`);
        const stream = await this.openai.chat.completions.create({
          model:
            this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4.1-mini', // Or your preferred model
          messages: messages,
          stream: true,
        });

        for await (const part of stream) {
          let content = part.choices[0]?.delta?.content || '';
          if (content) {
            // let originalContent = content; // Keep original for logging if needed
            let sendContent = true;

            if (content.endsWith('#')) {
              content = content.slice(0, -1); // Remove the '#'
              detectedQualification = 'STRONG';
              // If content becomes empty after stripping, don't send this specific chunk via subject.next for text
              if (!content.trim()) sendContent = false;
            } else if (content.endsWith('*')) {
              content = content.slice(0, -1); // Remove the '*'
              detectedQualification = 'WEAK';
              if (!content.trim()) sendContent = false;
            }

            // Simulate slight delay for streaming effect if needed for testing
            // await new Promise((resolve) => setTimeout(resolve, 50));

            // Only send if there's actual text left after marker removal and sendContent is true
            if (sendContent && content.trim()) {
              subject.next({ chunk: content, done: false });
            }
          }
        }
        // Signal completion of the stream
        this.logger.debug(
          `OpenAI stream finished. Detected qualification: ${detectedQualification}`,
        );
        subject.next({
          chunk: '',
          done: true,
          qualificationStatus: detectedQualification,
        });
        subject.complete();
      } catch (error) {
        this.logger.error('Error streaming OpenAI response:', error);
        subject.error(error);
      }
    })();

    return subject.asObservable();
  }

  // Removed analyzeConversation method as per the new approach.
  // Final analysis/tagging will happen in a background process.
} // End of AIService class
