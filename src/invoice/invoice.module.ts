import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceSchema } from './entities/invoice.entity';

@Module({
  imports : [ MongooseModule.forFeature([{ name: 'invoice', schema: InvoiceSchema }])],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}
