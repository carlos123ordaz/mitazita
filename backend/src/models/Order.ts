import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  code: string;
  orderType: 'custom' | 'product';
  status: 'pending' | 'confirmed' | 'cancelled';
  customer: {
    name: string;
    surname: string;
    phone: string;
    email: string;
    address: string;
    reference: string;
  };
  // Custom mug (orderType === 'custom')
  mug?: {
    modelId: string;
    modelName: string;
    photoUrl?: string;
    text: { name: string; dedication: string };
    extras: { caja: boolean; tarjeta: boolean; magica: boolean; delivery: boolean };
  };
  // Pre-designed product (orderType === 'product')
  product?: {
    productId: mongoose.Types.ObjectId;
    productName: string;
    imageUrl?: string;
    price: number;
  };
  basePrice: number;
  total: number;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    code: { type: String, required: true, unique: true, index: true },
    orderType: { type: String, enum: ['custom', 'product'], default: 'custom' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    customer: {
      name: { type: String, required: true, trim: true },
      surname: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      address: { type: String, required: true, trim: true },
      reference: { type: String, default: '', trim: true },
    },
    mug: {
      modelId: { type: String },
      modelName: { type: String },
      photoUrl: { type: String },
      text: {
        name: { type: String, default: '' },
        dedication: { type: String, default: '' },
      },
      extras: {
        caja: { type: Boolean, default: false },
        tarjeta: { type: Boolean, default: false },
        magica: { type: Boolean, default: false },
        delivery: { type: Boolean, default: false },
      },
    },
    product: {
      productId: { type: Schema.Types.ObjectId, ref: 'Product' },
      productName: { type: String },
      imageUrl: { type: String },
      price: { type: Number },
    },
    basePrice: { type: Number, required: true },
    total: { type: Number, required: true },
    confirmedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
