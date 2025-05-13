import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core'; // Import APP_PIPE
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { LeadModule } from './lead/lead.module';
import { AIModule } from './ai/ai.module';
import { ConversationModule } from './conversation/conversation.module'; // Import ConversationModule
import { AblyModule } from './ably/ably.module'; // Import AblyModule

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    LeadModule,
    AIModule,
    ConversationModule, // Add ConversationModule here
    AblyModule, // Add AblyModule here
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Globally enable ValidationPipe for DTO validation
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true, // Automatically transform payloads to DTO instances
      }),
    },
  ],
})
export class AppModule {}
