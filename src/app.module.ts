import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItineraryModule } from './itinerary/itinerary.module';
import { CustomerModule } from './customer/customer.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { InvoiceModule } from './invoice/invoice.module';
import { LeadModule } from './lead/lead.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ItineraryModule,
    CustomerModule,
    MongooseModule.forRoot(process.env.MONGOOSE_URL),
    InvoiceModule,
    LeadModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
