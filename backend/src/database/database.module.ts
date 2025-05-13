import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Lead, LeadSchema } from './schemas/lead.schema';
import { LeadService } from './lead.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }]), // Register LeadSchema
  ],
  providers: [LeadService], // Provide LeadService
  exports: [LeadService, MongooseModule], // Export LeadService and MongooseModule for other modules
})
export class DatabaseModule {}
