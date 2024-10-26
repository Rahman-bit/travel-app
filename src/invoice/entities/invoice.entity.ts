
import { Schema } from 'mongoose';

const NestedItemSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  item: { type: String, required: true },
  amount: { type: Number, required: true },
});

export const InvoiceSchema = new Schema({
  currencyType: { type: String, required: false },
  paymentMode: { type: String, required: false },
  global_id: { type: String, required: false },
  customerName: { type: String, required: false },
  invoieStatus: { type: String, required: false, default: 'Generated (Not sent to customer)' },
  invoiceParticulars: { type : [NestedItemSchema], default : []},
  grandTotalAmount: { type: String, required: false },
  gstNumber: { type: String, required: false },
  panNumber: { type: String, required: false },
  billingNote: { type: String, required: false },
  invoiceId: { type: String, required: false },
  createdDate: { type: String, default: () => new Date().toISOString() },
  invoiceType: { type: String, required: false }
},{ timestamps: true });

