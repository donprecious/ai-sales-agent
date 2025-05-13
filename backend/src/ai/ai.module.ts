import { Module } from '@nestjs/common';
import { AIService } from './ai.service';

@Module({
  providers: [AIService],
  exports: [AIService], // Export AIService so other modules can use it
})
export class AIModule {}
