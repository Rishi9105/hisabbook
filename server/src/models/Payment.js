import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loan',
      required: [true, 'Loan ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Payment amount must be greater than zero'],
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: {
        values: ['cash', 'upi', 'bank', 'other'],
        message: '{VALUE} is not a valid payment method',
      },
      default: 'cash',
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema)

export default Payment
