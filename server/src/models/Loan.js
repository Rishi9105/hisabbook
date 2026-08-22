import mongoose from 'mongoose'

const loanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    loanTitle: {
      type: String,
      required: [true, 'Loan title is required'],
      trim: true,
    },
    loanType: {
      type: String,
      required: [true, 'Loan type is required'],
      enum: {
        values: ['borrowed', 'lent'],
        message: '{VALUE} is not a valid loan type (borrowed or lent)',
      },
    },
    borrowerName: {
      type: String,
      required: [true, 'Borrower name is required'],
      trim: true,
    },
    lenderName: {
      type: String,
      required: [true, 'Lender name is required'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },
    loanAmount: {
      type: Number,
      required: [true, 'Loan amount is required'],
      min: [0, 'Loan amount cannot be negative'],
    },
    interestType: {
      type: String,
      required: [true, 'Interest type is required'],
      enum: {
        values: ['monthlyPercentage', 'perHundred'],
        message: '{VALUE} is not a valid interest type',
      },
    },
    interestRate: {
      type: Number,
      required: [true, 'Interest rate is required'],
      min: [0, 'Interest rate cannot be negative'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['active', 'closed'],
        message: '{VALUE} is not a valid loan status',
      },
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for user query performance
loanSchema.index({ userId: 1, status: 1 })

const Loan = mongoose.models.Loan || mongoose.model('Loan', loanSchema)

export default Loan
