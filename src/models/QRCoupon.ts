import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQRCoupon extends Document {
    uniqueCode: string;
    value: number;
    isUsed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const QRCouponSchema: Schema = new Schema(
    {
        uniqueCode: { type: String, required: true, unique: true },
        value: { type: Number, required: true },
        isUsed: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const QRCoupon: Model<IQRCoupon> =
    mongoose.models.QRCoupon || mongoose.model<IQRCoupon>('QRCoupon', QRCouponSchema);

export default QRCoupon;
