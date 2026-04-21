import mongoose, { Schema } from "mongoose";

export let AccountType = /*#__PURE__*/ (function (AccountType) {
  AccountType["UPI_ID"] = "UPI_ID";
  AccountType["BANK_ACCOUNT"] = "BANK_ACCOUNT";
  AccountType["UPI_NUMBER"] = "UPI_NUMBER";
  return AccountType;
})({});

export let SubmissionStatus = /*#__PURE__*/ (function (SubmissionStatus) {
  SubmissionStatus["PENDING"] = "PENDING";
  SubmissionStatus["APPROVED"] = "APPROVED";
  SubmissionStatus["REJECTED"] = "REJECTED";
  SubmissionStatus["PAID"] = "PAID";
  return SubmissionStatus;
})({});

const SubmissionSchema = new Schema(
  {
    qrCoupon: { type: Schema.Types.ObjectId, ref: "QRCoupon", required: true },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    accountType: {
      type: String,
      enum: Object.values(AccountType),
      required: true,
    },
    accountValue: { type: String, required: true },
    screenshotUrl: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(SubmissionStatus),
      default: SubmissionStatus.PENDING,
    },
  },
  { timestamps: true },
);

const Submission =
  mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);

export default Submission;
