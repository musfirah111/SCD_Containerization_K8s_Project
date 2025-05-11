const express = require('express');
const router = express.Router();
const {
    payment_and_generateInvoice,
    payBill,
    downloadInvoice,
    refundPayment
} = require('../controllers/billingController');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly, patientOnly } = require('../middlewares/roleMiddleware');


router.post('/invoice/generate', protect, payment_and_generateInvoice);

// Patient routes
router.post('/pay', protect, patientOnly, payBill);
router.get('/download/:invoiceId', protect, downloadInvoice);

// Add this new route
router.post('/refund', protect, adminOnly, refundPayment);

module.exports = router;