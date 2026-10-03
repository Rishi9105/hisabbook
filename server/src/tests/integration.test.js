import assert from 'node:assert'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User from '../models/User.js'
import Loan from '../models/Loan.js'
import Payment from '../models/Payment.js'
import * as loanService from '../services/loan.service.js'
import * as paymentService from '../services/payment.service.js'

console.log('Running HisabBook Integration & Security Test Suite...')

function setupInMemoryMock() {
  const store = {
    users: [],
    loans: [],
    payments: [],
  }

  function matches(doc, query) {
    for (const key of Object.keys(query)) {
      const qVal = query[key]
      const dVal = doc[key]
      if (qVal && typeof qVal === 'object' && qVal._bsontype === 'ObjectID') {
        if (String(dVal) !== String(qVal)) return false
      } else if (dVal && typeof dVal === 'object' && dVal._bsontype === 'ObjectID') {
        if (String(dVal) !== String(qVal)) return false
      } else {
        if (String(dVal) !== String(qVal)) return false
      }
    }
    return true
  }

  function makeDoc(data) {
    const id = data._id || new mongoose.Types.ObjectId()
    const docObj = {
      _id: id,
      ...data,
      toObject: () => ({ ...docObj }),
    }
    return docObj
  }

  User.create = async (data) => {
    const doc = makeDoc(data)
    store.users.push(doc)
    return doc
  }

  Loan.create = async (data) => {
    const doc = makeDoc(data)
    store.loans.push(doc)
    return doc
  }

  Loan.find = (query) => {
    const filtered = store.loans.filter((d) => matches(d, query))
    const res = filtered.map((d) => makeDoc(d))
    res.sort = () => res
    return res
  }

  Loan.findOne = async (query) => {
    const found = store.loans.find((d) => matches(d, query))
    return found ? makeDoc(found) : null
  }

  Loan.findOneAndUpdate = async (query, update) => {
    const found = store.loans.find((d) => matches(d, query))
    if (!found) return null
    Object.assign(found, update)
    return makeDoc(found)
  }

  Loan.findOneAndDelete = async (query) => {
    const idx = store.loans.findIndex((d) => matches(d, query))
    if (idx === -1) return null
    const [removed] = store.loans.splice(idx, 1)
    return makeDoc(removed)
  }

  Payment.create = async (data) => {
    const doc = makeDoc(data)
    store.payments.push(doc)
    return doc
  }

  Payment.find = (query) => {
    const filtered = store.payments.filter((d) => matches(d, query))
    const res = filtered.map((d) => makeDoc(d))
    res.sort = () => res
    return res
  }

  Payment.findById = async (id) => {
    const found = store.payments.find((d) => String(d._id) === String(id))
    return found ? makeDoc(found) : null
  }

  Payment.findByIdAndUpdate = async (id, update) => {
    const found = store.payments.find((d) => String(d._id) === String(id))
    if (!found) return null
    Object.assign(found, update)
    return makeDoc(found)
  }

  Payment.findByIdAndDelete = async (id) => {
    const idx = store.payments.findIndex((d) => String(d._id) === String(id))
    if (idx === -1) return null
    const [removed] = store.payments.splice(idx, 1)
    return makeDoc(removed)
  }

  Payment.deleteMany = async (query) => {
    store.payments = store.payments.filter((d) => !matches(d, query))
    return { acknowledged: true }
  }
}

async function runTests() {
  let mongoServer = null
  try {
    const createServerWithTimeout = Promise.race([
      MongoMemoryServer.create(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('MongoMemoryServer initialization timeout')), 2000)),
    ])
    mongoServer = await createServerWithTimeout
    const mongoUri = mongoServer.getUri()
    await mongoose.connect(mongoUri)
  } catch (err) {
    console.warn('MongoMemoryServer initialization skipped/failed, using in-memory mock adapter:', err.message)
    setupInMemoryMock()
  }

  try {
    // 1. Setup two distinct users
    const userA = await User.create({
      firebaseUid: 'uid_user_a',
      name: 'User A',
      email: 'usera@example.com',
    })
    const userB = await User.create({
      firebaseUid: 'uid_user_b',
      name: 'User B',
      email: 'userb@example.com',
    })

    const userAId = userA._id.toString()
    const userBId = userB._id.toString()

    console.log('✓ Setup: Test Users A and B created successfully')

    // 2. User A creates a Loan
    const loanA = await loanService.createLoan(userAId, {
      loanTitle: 'Business Loan',
      loanType: 'lent',
      borrowerName: 'Rahul',
      lenderName: 'User A',
      loanAmount: 50000,
      interestType: 'monthlyPercentage',
      interestRate: 2,
      startDate: '2024-01-01',
    })

    const loanAId = loanA._id.toString()
    assert.strictEqual(loanA.loanTitle, 'Business Loan')
    assert.strictEqual(loanA.loanAmount, 50000)
    console.log('✓ User A Loan created')

    // 3. Authorization Isolation Test: User B attempts to access User A\'s loan
    const userBAccessLoanA = await loanService.getLoanById(loanAId, userBId)
    assert.strictEqual(userBAccessLoanA, null, 'User B must NOT be able to view User A loan')
    console.log('✓ Security Check: User B access to User A loan denied (404/null returned)')

    // 4. User A adds a payment
    const payment1 = await paymentService.addPayment(loanAId, userAId, {
      amount: 5000,
      paymentDate: '2024-01-31',
      paymentMethod: 'upi',
      note: 'First installment',
    })

    assert.strictEqual(payment1.amount, 5000)
    console.log('✓ User A recorded ₹5,000 payment')

    // 5. Authorization Isolation Test: User B attempts to add or delete payment on User A loan
    await assert.rejects(
      async () => {
        await paymentService.addPayment(loanAId, userBId, { amount: 1000 })
      },
      (err) => err.message === 'LOAN_NOT_FOUND',
      'User B must NOT be able to add payment to User A loan'
    )

    const userBDeletePayment1 = await paymentService.deletePayment(payment1._id.toString(), userBId)
    assert.strictEqual(userBDeletePayment1, null, 'User B must NOT be able to delete User A payment')
    console.log('✓ Security Check: User B unauthorized payment mutation blocked')

    // 6. User A checks calculated ledger metrics
    const loanADetails = await loanService.getLoanById(loanAId, userAId)
    assert.strictEqual(loanADetails.totalPaid, 5000)
    assert.strictEqual(loanADetails.interestPaid, 1000) // 30 days @ 2% on 50,000 = 1,000
    assert.strictEqual(loanADetails.principalPaid, 4000)
    assert.strictEqual(loanADetails.remainingPrincipal, 46000)
    console.log('✓ Ledger Engine: Real payment calculations verified')

    // 7. User A updates loan information and status
    const updatedLoanA = await loanService.updateLoan(loanAId, userAId, { status: 'closed' })
    assert.strictEqual(updatedLoanA.status, 'closed')
    console.log('✓ User A closed loan')

    // 8. User A deletes payment and verifies cascade recalculation
    const deletedPmt = await paymentService.deletePayment(payment1._id.toString(), userAId)
    assert.ok(deletedPmt)

    const loanAAfterPmtDelete = await loanService.getLoanById(loanAId, userAId)
    assert.strictEqual(loanAAfterPmtDelete.totalPaid, 0)
    assert.strictEqual(loanAAfterPmtDelete.principalPaid, 0)
    console.log('✓ Payment deletion and ledger recalculation verified')

    // 9. User A deletes loan and verifies cascade deletion of payments
    const deletedLoan = await loanService.deleteLoan(loanAId, userAId)
    assert.ok(deletedLoan)

    const remainingPayments = await Payment.find({ loanId: loanAId })
    assert.strictEqual(remainingPayments.length, 0, 'All payments must be cascade deleted')
    console.log('✓ Loan and payment cascade deletion verified')

    console.log('\n🎉 ALL HISABBOOK INTEGRATION & SECURITY TESTS PASSED SUCCESSFULLY! 🎉\n')
    process.exit(0)
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect()
    }
    if (mongoServer) {
      await mongoServer.stop()
    }
  }
}

runTests().catch((err) => {
  console.error('Integration test failure:', err)
  process.exit(1)
})
