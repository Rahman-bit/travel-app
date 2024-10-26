import { Document } from 'mongoose';

export interface NestedItem {
  _id?: string; 
  serviceName?: string; 
  isChecked?: boolean; 
}

export interface NewLead {
  uniqueNumber?: string; 
  createdDate?: string;
  leadTitle?: string;  
  paymentmode?: string; 
  customerName?: string; 
  getRequirement?: string; 
  noOfInfants?: string;
  typeOfHoliday?: string;
  dateANDtime?: string;
  pickUpPoint?: string;
  dropPoint?: string;
  noOfAdults?: string;
  noOfKids?: string;
  groupTourPackageList?: string;
  serviceList?: NestedItem[];
  vehicleType?: string;
  noOfRooms?: string;
  startDate?: string;
  endDate?: string;
  checkIN?: string;
  checkOUT?: string;
  destination?: string;
  country?: string;
  noOfDays?: string;
  typeOfVisa?: string;
  coupleList?: string;
  currencyType?: string; 
  budgetForTrip?: string; 
  requiredDocuments?: string;
  shortNote?: string;
  hotelPreferences?: string;
  leadstatus?: string; 
  invoice?: NestedItem[]; 
  itinerary?: NestedItem[]; 
  validateLeadIdAndFind?: () => void; 
}

// Mongoose Document with NewLead fields + MongoDB ID
export interface NewLeadDocument extends NewLead, Document {
  _id: string; 
}
