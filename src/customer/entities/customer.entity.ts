
import { Schema } from 'mongoose';

export const CustomerSchema = new Schema({
  customerFirstName: { type: String, required: true },
  customerLastName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerMobile: { type: Number, required: true },
  createdDate: { type: String, default: () => new Date().toISOString() },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  zipcode: { type: Number, required: true },
});