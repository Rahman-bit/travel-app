import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { User } from './dto/customer.dto';
// import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('api')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('customer')
  async create(@Body() customerDto: User) {
     return await this.customerService.create(customerDto);
  }

  @Get('customer')
  async findAll() {
    return await this.customerService.getAllUsers();
  }
  @Get('customer/:id')
  findOne(@Param('id') id: string) {
    return this.customerService.getUserById(id);
  }

  @Put('customer/:id')
  async updateLead(@Param('id') id: string, @Body() updateLeadDto: User) {
   return await this.customerService.updateCustomer(id, updateLeadDto);
  }

  @Delete('customer/:id')
  async remove(@Param('id') id: string) {
      return await this.customerService.deleteLead(id);
    }
}
