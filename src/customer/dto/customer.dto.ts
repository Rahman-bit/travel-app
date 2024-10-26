import { Schema, Document, model } from 'mongoose';

// User Interface
export interface User {
  customerFirstName?: string;
  customerLastName?: string;
  customerEmail?: string;
  customerMobile?: number;
  createdDate?: Date;
  country?: string;
  state?: string;
  city?: string;
  zipcode?: number;
}

// Mongoose Document Interface
export interface UserDocument extends Document, User {}

