import { BadRequestException, Injectable } from '@nestjs/common';
import { User, UserDocument } from './dto/customer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// import { UpdateCustomerDto } from './dto/update-customer.dto';

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

  findOne(id: number) {
    return `This action returns a #${id} customer`;
  }

  update(id: number, updateCustomerDto: User) {
    return `This action updates a #${id} customer`;
  }

  remove(id: number) {
    return `This action removes a #${id} customer`;
  }
}
