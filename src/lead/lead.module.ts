import { Module } from '@nestjs/common';
import { LeadService } from './lead.service';
import { LeadController } from './lead.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { NewLeadSchema } from './entities/lead.entity';

@Module({
  imports : [ MongooseModule.forFeature([{ name: 'lead', schema: NewLeadSchema }])],
  controllers: [LeadController],
  providers: [LeadService],
})
export class LeadModule {}
