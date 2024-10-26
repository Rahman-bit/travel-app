import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { LeadService } from './lead.service';
import { NestedItem, NewLead, NewLeadDocument } from './dto/lead.dto';

@Controller('api')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post('lead')
  async create(@Body() leadDto: NewLeadDocument):Promise<NewLead> {
      return await this.leadService.create(leadDto);
    }

  @Post('lead/:leadId/:nestedItem')
    async addNestedItem(
      @Param('leadId') leadId: string,
      @Param('nestedItem') nestedItem: string,
      @Body() newItemData: NestedItem
    ){
      return await this.leadService.addNestedItem(leadId, nestedItem, newItemData);
  }
    
  @Get('lead')
  async findAll() {
    const result = await this.leadService.findAll();
    return result
  }

  @Get('lead/:id')
  findOne(@Param('id') id: string) {
    return this.leadService.findOne(id);
  }

  // URL for PUT request to update lead
  @Put('lead/:id')
  update(@Param('id') id: string, @Body() updateNewleadDto: NewLead) {
    return this.leadService.update(id, updateNewleadDto);
  }

  // URL for PUT request to update nested array of objects
  @Put('lead/:leadId/:nestedItemId')
  async updateNestedItem(
    @Param('leadId') leadId: string,
    @Param('nestedItemId') nestedObjectId: string,
    @Body() updateData: NewLead
  ) {
    return this.leadService.updateNestedItem(leadId, nestedObjectId, updateData);
  }

  // DELETE request to delete an entire lead by ID
  @Delete('lead/:leadId')
    async deleteLead(@Param('leadId') leadId: string): Promise<{ message: string}> {
      return this.leadService.deleteLead(leadId);
  }

  @Delete('lead/:leadId/:nestedItemId')
  deleteNestedItem(
    @Param('leadId') leadId: string,
    @Param('nestedItemId') nestedItemId: string,
  ) {

    return this.leadService.deleteNestedItem(leadId, nestedItemId);
  }
}
