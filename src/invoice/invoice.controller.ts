import { Controller, Get, Post, Body, Patch, Param, Delete, Put, HttpException, HttpStatus } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Invoice, NestedItem } from './dto/invoice.dto';
// import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Controller('api')
export class InvoiceController {

  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('invoice')
  async create(@Body() invoiceData: Invoice) {
    const data = await this.invoiceService.create(invoiceData);
    return data;
  }

  @Post('invoice/:leadId/:nestedItem')
    async addNestedItem(
      @Param('leadId') leadId: string,
      @Param('nestedItem') nestedItem: string,
      @Body() newItemData: NestedItem
    ):Promise<Invoice>{
      return await this.invoiceService.addNestedItem(leadId, nestedItem, newItemData);
  }

  @Get('invoice')
  async findAll() {
    const allData = await this.invoiceService.findAll();
    return allData;
  }

  @Get('invoice/:id')
  findOne(@Param('id') id: string) {
    return this.invoiceService.getInvoiceById(id);
  }

  @Put('invoice/:id')
  async update(@Param('id') id: string, @Body() updateInvoiceDto: Invoice) {
      return await this.invoiceService.update(id, updateInvoiceDto);
  }

  // URL for PUT request to update nested array of objects
  @Put('invoice/:leadId/:nestedItemId')
  async updateNestedItem(
    @Param('leadId') leadId: string,
    @Param('nestedItemId') nestedItemId: string,
    @Body() updateData: Invoice
  ) {
    return this.invoiceService.updateNestedItem(leadId, nestedItemId, updateData);
  }

  @Delete('invoice/:id')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.invoiceService.deleteLead(id);
  }

  @Delete('invoice/:invoiceId/:nestedItemId')
  deleteNestedItem(
    @Param('invoiceId') invoiceId: string,
    @Param('nestedItemId') nestedItemId: string,
  ) {

    return this.invoiceService.deleteNestedItem(invoiceId, nestedItemId);
  }
}
