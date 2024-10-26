
export interface NestedItem {
    id?: string;
    _id?: string;
    item?: string;
    amount?: boolean;
  }
  
  export interface Invoice {
      save: any;
      toObject: any;
      id?: string;
      _id?: string;
      currencyType?: string;
      paymentMode?: string;
      global_id?: string;
      customerName?: string;
      invoieStatus?: string;
      invoiceParticulars?: NestedItem[]; 
      grandTotalAmount?: string;
      gstNumber?: string;
      panNumber?: string;
      billingNote?: string;
      invoiceId?: string;
      createdDate?: string;
      invoiceType?: string;
    }
    
  