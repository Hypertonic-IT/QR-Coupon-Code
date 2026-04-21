import mongoose, { Schema } from "mongoose";

const QRCouponSchema = new Schema(
  {
    uniqueCode: { type: String, required: true, unique: true },
    value: { type: Number, required: true },
    isUsed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const QRCoupon =
  mongoose.models.QRCoupon || mongoose.model("QRCoupon", QRCouponSchema);

export default QRCoupon;
