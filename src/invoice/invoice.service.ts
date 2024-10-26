import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Invoice, NestedItem } from './dto/invoice.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, MongooseError } from 'mongoose';
import { ObjectId } from 'mongodb';

@Injectable()
export class InvoiceService {
  constructor(@InjectModel('invoice') private invoiceModel: Model<Invoice>) { }

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

  async validateLeadIdAndFind(leadId: string): Promise<Invoice> {
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      throw new BadRequestException('Invalid Lead ID format');
    }
    const existingLead = await this.invoiceModel.findById(leadId).exec();
    if (!existingLead) {
      throw new NotFoundException(`Lead with id ${leadId} not found`);
    }
    return existingLead;
  }

  private recursiveUpdate(
    obj: any,
    nestedObjectId: string | ObjectId,
    updateData: any,
    visited = new Set<any>()
  ): any {
    // Prevent circular references
    if (visited.has(obj)) {

      return null;
    }
    visited.add(obj);

    if (!obj || typeof obj !== 'object') {
      return null;
    }

    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        // Traverse arrays
        for (let i = 0; i < obj[key].length; i++) {
          const item = obj[key][i];

          // Ensure item._id and nestedObjectId are valid ObjectId strings
          if (item && item._id && ObjectId.isValid(item._id) && ObjectId.isValid(nestedObjectId)) {
            // Convert item._id and nestedObjectId to ObjectId before comparison
            if (new ObjectId(item._id).equals(new ObjectId(nestedObjectId))) {
              console.log(`Found invoice nested object with ID: ${nestedObjectId} at array index: ${i}, key: ${key}`);

              // Update only the properties in updateData without removing other properties
              Object.assign(item, updateData);

              return item;
            }
          }
          const updatedNestedItem = this.recursiveUpdate(item, nestedObjectId, updateData, visited);
          if (updatedNestedItem) return updatedNestedItem; // If found, return it
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Ensure obj[key]._id and nestedObjectId are valid ObjectId strings
        if (obj[key]._id && ObjectId.isValid(obj[key]._id) && ObjectId.isValid(nestedObjectId)) {
          // Convert obj[key]._id and nestedObjectId to ObjectId before comparison
          if (new ObjectId(obj[key]._id).equals(new ObjectId(nestedObjectId))) {
            console.log(`Found invoice nested object with ID: ${nestedObjectId} at key: ${key}`);

            // Update only the properties in updateData without removing other properties
            Object.assign(obj[key], updateData);

            return obj[key];
          }
        }
        // Recur into nested objects
        const updatedNestedItem = this.recursiveUpdate(obj[key], nestedObjectId, updateData, visited);
        if (updatedNestedItem) return updatedNestedItem;
      }
    }
    return null;
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
            console.log(`Deleting invoice nested object with ID: ${nestedObjectId} at array index: ${i}`);
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
          console.log(`Deleting invoice nested object with ID: ${nestedObjectId} at key: ${key}`);
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

// Post Req
  async create(invoiceData: Invoice): Promise<Invoice> {
    try {
      const invoice = new this.invoiceModel(invoiceData);
      return await invoice.save();
    } catch (e) {
      throw new BadRequestException(`Invalid Data format: ${e.message}`);
    }
  }

// Post Req
  async addNestedItem(invoiceId: string, nestedItem: string, newItemData: NestedItem): Promise<Invoice> { 
    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
      throw new BadRequestException('Invalid Invoice ID format');
    }
    const existingLead = await this.invoiceModel.findById(invoiceId).exec();
    if (!existingLead) {
      throw new NotFoundException(`Invoice with id ${invoiceId} not found`);
    }
    if (!existingLead[nestedItem]) {
      throw new BadRequestException(`Invalid nested item: ${nestedItem}`);
    }
    if (!Array.isArray(existingLead[nestedItem])) {
      throw new BadRequestException(`Invalid nested item: ${nestedItem} is not an array`);
    }

    if (nestedItem === 'invoiceParticulars') {
      existingLead.invoiceParticulars.push({
        id: newItemData._id ? newItemData._id.toString() : undefined,
        item: newItemData.item,
        amount: newItemData.amount,
      });
    } else {
      throw new BadRequestException(`Unknown nested item: ${nestedItem}`);
    }
    await existingLead.save();
    return existingLead;
  }

  // Get Req for all Leads
  async findAll() {
    try {
      const invoiceData = await this.invoiceModel.find().exec();
      return invoiceData.map(lead => this.replaceId(lead.toObject()));
    } catch (e) {
      throw new BadRequestException(`Could not find itineraries: ${e.message}`);
    }
  }
 // Get Req for single Lead
  async getInvoiceById(id: string): Promise<Invoice | null> {
    try {
      const existingInvoice = await this.validateLeadIdAndFind(id);
      return this.replaceId(existingInvoice.toObject());
    } catch (e) {
      throw new BadRequestException(`Could not find itinerary: ${e.message}`);
    }
  }

  // Put Req for update Top-level Properties
  async update(id: string, updateInvoice: Invoice) {
    try {
      const existingInvoice = await this.validateLeadIdAndFind(id);

      Object.assign(existingInvoice, updateInvoice);
      
      await existingInvoice.save();
      
      return {
        message: `Invoice Lead with ID: ${id} has been successfully updated`
      };
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to update lead/user data',
        error: error.message,
      },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  //PUT request update nested items with ID
  async updateNestedItem(
    invoiceId: string,
    nestedItemId: string,
    updateData: any
  ): Promise<{ message: string; updatedInvoice?: any }> {
    try {
      const invoice = await this.validateLeadIdAndFind(invoiceId); 
      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
      }
  
      const updatedInvoice = await this.recursiveUpdate(invoice, nestedItemId, updateData);
      if (!updatedInvoice) {
        throw new NotFoundException(`Invoice Nested object with ID ${nestedItemId} not found`);
      }
      await invoice.save(); 
      const successMessage = `Invoice Nested object with ID ${nestedItemId} was successfully updated.`;
      return {
        message: successMessage,
        // updatedInvoice: invoice, 
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
  async deleteLead(invoiceId: string): Promise<{ message: string }> {
    try {
      const result = await this.invoiceModel.deleteOne({ _id: invoiceId }).exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException(`invoice Lead with id ${invoiceId} not found`);
      }
      return {
        message: `Invoice has been deleted id ${invoiceId}`
      }
    } catch (e) {
      throw new BadRequestException(`Invalid Lead ID ${e.message} not found`);
    }
  }

  // DELETE request with ID delete Nested Items 
  async deleteNestedItem(invoiceId: string, nestedItemId: string) {
    try {
      const invoice = await this.invoiceModel.findById(invoiceId);
  
      if (!invoice) {
        throw new NotFoundException(`invoice with ID ${invoiceId} not found`);
      }
      const isDeleted = await this.recursiveDelete(invoice, nestedItemId);
  
      if (!isDeleted) {
        throw new NotFoundException(`invoice Nested object with ID ${nestedItemId} not found`);
      }
      await invoice.save();
    
      const successMessage = `invoice Nested object with ID ${nestedItemId} was successfully deleted.`;  
      return { 
        message: successMessage, 
        isDeleted 
      };
  
    } catch (error) {
      console.error(`Error in deleteNestedObject:`, error);
      throw error;
    }
  }

}
