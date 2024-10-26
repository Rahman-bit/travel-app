import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomerDto: User) {
    return this.customerService.update(+id, updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerService.remove(+id);
  }
}
