
import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from './dto/customer.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class CustomerService {
  constructor(@InjectModel('Customer') private customerModel: Model<UserDocument>) {}
  
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

async validateLeadIdAndFind(leadId: string): Promise<UserDocument> {

  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    throw new BadRequestException('Invalid Lead ID format');
  }

  const existingLead = await this.customerModel.findById(leadId).exec();

  if (!existingLead) {
    throw new NotFoundException(`Lead with id ${leadId} not found`);
  }

  return existingLead;
}

  async create(newLead: User): Promise<{ message: string }> {
    try {
      const customer = new this.customerModel({
        ...newLead,
        createdDate: new Date().toISOString(),
        updatedAt: new Date(),
      });
      await customer.save();
       return {
        message : "successfully updated customer Data!!!"
       }
     } catch (e) {
       throw new BadRequestException(`Invalid Data format: ${e.message}`);
     }
  }

  async getAllUsers() {
    try {
      const allLeads = await this.customerModel.find().exec();
      return allLeads.map(customer => this.replaceId(customer.toObject())); 
    } catch (e) {
      throw new BadRequestException(`Could not find itineraries: ${e.message}`);
    }
  }

  async getUserById(id: string): Promise<UserDocument> {
    try {
      const existingUser = await this.validateLeadIdAndFind(id);
      return this.replaceId(existingUser.toObject()); 
    } catch (e) {
      throw new BadRequestException(`Could not find user: ${e.message}`);
    }
  }
  
  async updateCustomer(id: string, customerDto: User): Promise<{ message: string, customer: UserDocument }> {
    try{
      const existingCustomer = await this.validateLeadIdAndFind(id);
    
      Object.assign(existingCustomer, customerDto); 
    
      await existingCustomer.save();
      
      return {
        message: `customer with ID ${id} was successfully updated.`,
        customer: this.replaceId(existingCustomer.toObject())
      };
    }catch(e){
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to update lead/user data',
        error: e.message,
      },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  
 async deleteLead(id: string) {
    try{
      const result = await this.customerModel.deleteOne({ _id: id }).exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException(`Itinerary Lead with id ${id} not found`);
      }
      return {
        message : `Customer has been deleted with id ${id}`
      }
    }catch(e){
      throw new BadRequestException(`Invalid Lead ID ${e.message} not found`);
    } 
  }
}
