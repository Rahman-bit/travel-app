import { BadRequestException, NotFoundException } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { NewLeadDocument } from '../lead/dto/lead.dto'; // Adjust the import path

export const validateLeadIdAndFind = async (leadId: string, leadModel: Model<NewLeadDocument>): Promise<NewLeadDocument> => {
  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    throw new BadRequestException('Invalid Lead ID format');
  }

  const existingLead = await leadModel.findById(leadId).exec();
//   console.log('existingLead from utils validation:', existingLead)
  if (!existingLead) {
    throw new NotFoundException(`Lead with id ${leadId} not found`);
  }
  return existingLead;
};
