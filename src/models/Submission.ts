import mongoose, { Schema, Document, Model } from 'mongoose';

export enum AccountType {
    UPI_ID = 'UPI_ID',
    BANK_ACCOUNT = 'BANK_ACCOUNT',
    UPI_NUMBER = 'UPI_NUMBER',
}

export enum SubmissionStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PAID = 'PAID',
}

export interface ISubmission extends Document {
    qrCoupon: mongoose.Types.ObjectId;
    name: string;
    mobile: string;
    accountType: AccountType;
    accountValue: string;
    screenshotUrl: string;
    status: SubmissionStatus;
    createdAt: Date;
    updatedAt: Date;
}

const SubmissionSchema: Schema = new Schema(
    {
        qrCoupon: { type: Schema.Types.ObjectId, ref: 'QRCoupon', required: true },
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
    { timestamps: true }
);

const Submission: Model<ISubmission> =
    mongoose.models.Submission ||
    mongoose.model<ISubmission>('Submission', SubmissionSchema);

export default Submission;
