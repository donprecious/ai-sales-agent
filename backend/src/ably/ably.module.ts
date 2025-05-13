import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AblyService } from './ably.service';

@Global() // Make AblyService available globally
@Module({
  imports: [ConfigModule], // AblyService depends on ConfigService
  providers: [AblyService],
  exports: [AblyService],
})
export class AblyModule {}
