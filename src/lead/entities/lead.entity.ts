import { Schema } from 'mongoose';

const NestedItemSchema = new Schema({
  serviceName: { type: String, required: false }, 
  isChecked: { type: Boolean, required: false }, 
  _id: { type: Schema.Types.ObjectId, auto: true }, // auto generates if not provided
});

export const NewLeadSchema = new Schema({
  uniqueNumber: { type: String },
  createdDate: { type: String },
  leadTitle: { type: String }, // no need to specify required: false if it's optional
  paymentmode: { type: String },
  customerName: { type: String },
  getRequirement: { type: String },
  noOfInfants: { type: String },
  typeOfHoliday: { type: String },
  dateANDtime: { type: String },
  pickUpPoint: { type: String },
  dropPoint: { type: String },
  noOfAdults: { type: String },
  noOfKids: { type: String },
  groupTourPackageList: { type: String },
  vehicleType: { type: String },
  noOfRooms: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  checkIN: { type: String },
  checkOUT: { type: String },
  destination: { type: String },
  country: { type: String },
  noOfDays: { type: String },
  typeOfVisa: { type: String },
  coupleList: { type: String },
  currencyType: { type: String },
  budgetForTrip: { type: String },
  requiredDocuments: { type: String },
  shortNote: { type: String },
  hotelPreferences: { type: String },
  leadstatus: { type: String, default: 'All' },
  serviceList: { type: [NestedItemSchema], default: [] }, // array of nested items
  invoice: { type: [NestedItemSchema], default: [] }, // array of nested items
  itinerary: { type: [NestedItemSchema], default: [] }, // array of nested items
}, { timestamps: true });
