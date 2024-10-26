import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItineraryModule } from './itinerary/itinerary.module';
import { CustomerModule } from './customer/customer.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ItineraryModule,
    CustomerModule,
    MongooseModule.forRoot('mongodb+srv://syed456abdul:Kjie5z1ewYFdbxpr@cluster0.7hm7h.mongodb.net/travel-app?retryWrites=true&w=majority&appName=Cluster0')
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
