import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { NestedItem, NewLead, NewLeadDocument } from './dto/lead.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, MongooseError, Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { recursiveUpdate } from '../utils/leadUpdated';
import { validateLeadIdAndFind } from '../utils/leadValidation';

@Injectable()
export class LeadService {

  constructor(@InjectModel('lead') private newleadModel: Model<NewLeadDocument>) { }

  // The replaceId method can be declared inside the class like this:
  private replaceId(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.replaceId(item)); 
    } else if (typeof obj === 'object' && obj !== null) {
      const newObj: any = {};
      for (const key in obj) {
        if (key === '_id') {
          newObj['id'] = obj[key]; 
        } else if (typeof obj[key] === 'object') {
          newObj[key] = this.replaceId(obj[key]); 
        } else {
          newObj[key] = obj[key]; 
        }
      }
      return newObj;
    }
    return obj;
}

private async recursiveDelete(obj: any, nestedObjectId: string, visited = new Set()): Promise<boolean> {
  // Prevent circular references
  if (visited.has(obj)) {
    return false;
  }
  // Add the current object to the visited set
  visited.add(obj);

  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      // Traverse arrays
      for (let i = 0; i < obj[key].length; i++) {
        const item = obj[key][i];

        // Check if the current array item has the matching id
        if (item._id && item._id.toString() === nestedObjectId) {
          console.log(`Deleting Itinerary nested object with ID: ${nestedObjectId} at array index: ${i}`);
          obj[key].splice(i, 1); // Delete the found item
          return true; // Deletion successful
        }

        // Recur into each array item
        const nestedDeletion = await this.recursiveDelete(item, nestedObjectId, visited);
        if (nestedDeletion) return true;
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      // Traverse objects
      if (obj[key]._id && obj[key]._id.toString() === nestedObjectId) {
        console.log(`Deleting Itinerary nested object with ID: ${nestedObjectId} at key: ${key}`);
        delete obj[key]; // Delete the found object
        return true; // Deletion successful
      }

      // Recur into nested objects
      const nestedDeletion = await this.recursiveDelete(obj[key], nestedObjectId, visited);
      if (nestedDeletion) return true;
    }
  }
  return false; 
}

  // POST request
  async create(leadDto: NewLeadDocument): Promise<NewLeadDocument> {
    try {
      const newLead = new this.newleadModel(leadDto);
      return await newLead.save();
    } catch (e) {
      throw new BadRequestException(`Invalid Data format: ${e.message}`);
    }
  }
  // POST request for add new nested Objects in 
async addNestedItem(leadId: string, nestedItem: string, newItemData: NestedItem) {

    const existingLead = await validateLeadIdAndFind(leadId, this.newleadModel);

    if (!existingLead[nestedItem]) {
      throw new BadRequestException(`Invalid nested item: ${nestedItem}`);
    }
    if (nestedItem === 'serviceList') {
      existingLead.serviceList.push(newItemData);
    } else if (nestedItem === 'invoice') {
      existingLead.invoice.push(newItemData);
    } else if (nestedItem === 'itinerary') {
      existingLead.itinerary.push(newItemData);
    } else {
      throw new BadRequestException(`Unknown nested item: ${nestedItem}`);
    }
    return existingLead.save();
  }

// GET request Find All Leads 
async findAll(): Promise<any[]> {
  try {
    const allLeads = await this.newleadModel.find().exec();
    return allLeads.map(lead => this.replaceId(lead.toObject())); 
  } catch (e) {
    throw new BadRequestException(`Could not find itineraries: ${e.message}`);
  }
}

// GET request with ID find single Leads 
  async findOne(id: string) {
      try {
        const lead = await validateLeadIdAndFind(id, this.newleadModel);
        if (!lead) throw new NotFoundException(' Could not found product');
        return this.replaceId(lead.toObject());
      } catch (error) {
        throw new BadRequestException(' Could not found lead', error)
      }
  }

// PUT request with ID
  async update(id: string, updateNewlead: NewLead): Promise<{ message: string, updatedItinerary: NewLead }> {
  
    const existingLead = await validateLeadIdAndFind(id, this.newleadModel);
     // Update top-level fields
     Object.assign(existingLead, updateNewlead); 
     await existingLead.save();
    
    return {
      message: `Lead with ID ${id} was successfully updated.`,
      updatedItinerary: this.replaceId(existingLead.toObject())
    };
  }

  //PUT request update nested items with ID
  async updateNestedItem(leadId: string, nestedObjectId: string, updateData: any) {
    try {
        const existingLead = await validateLeadIdAndFind(leadId, this.newleadModel);
        
        const result = recursiveUpdate(existingLead, nestedObjectId, updateData);
        
        if (!result) {
            throw new NotFoundException(`Lead Nested object with ID ${nestedObjectId} not found`);
        }

        const { updatedItem } = result;

        // Save the parent document to persist changes in nested objects
        await existingLead.save();

        const successMessage = `Lead Nested object with ID ${nestedObjectId} was successfully updated.`;
        return {
            message: successMessage,
            updatedItem
        };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else if (error instanceof MongooseError) {
        throw new BadRequestException(`Mongoose error: ${error.message}`);
      } else {
        throw new InternalServerErrorException(`Unexpected error: ${error.message}`);
      }
    }
}
  
  //DELETE request delete entire lead 
  async deleteLead(leadId: string): Promise<{ message: string }> {
    try{
      const result = await this.newleadModel.deleteOne({ _id: leadId }).exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException(`Lead with id ${leadId} not found`);
      }
      return {
        message : `Lead has been deleted id ${leadId}`
      }
    }catch(e){
      throw new BadRequestException(`Invalid Lead ID ${e.message} not found`);
    }
  }

  // DELETE request with ID delete Nested Items 
  async deleteNestedItem(leadId: string,  nestedItemId: string) {

    try{
        const existingLead = await validateLeadIdAndFind(leadId, this.newleadModel);

        const isDeleted = await this.recursiveDelete(existingLead, nestedItemId);

      if (!isDeleted) {
        throw new NotFoundException(`Lead Nested object with ID ${nestedItemId} not found`);
      }
      await existingLead.save();

    const successMessage = `Lead Nested object with ID ${nestedItemId} was successfully deleted.`;
   
    return { 
      message: successMessage, 
      // existingLead 
    };

      } catch (error) {
        throw new InternalServerErrorException('An error occurred while deleting the nested item.');
      }
  }
}
