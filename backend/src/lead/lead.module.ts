import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
// LeadService is already provided and exported by DatabaseModule,
// so it's available to any module that imports DatabaseModule.

@Module({
  imports: [DatabaseModule], // Import DatabaseModule to access LeadService
  providers: [], // No new providers specific to LeadModule for now
  exports: [], // No exports specific to LeadModule for now
})
export class LeadModule {}
