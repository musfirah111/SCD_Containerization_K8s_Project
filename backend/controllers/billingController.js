const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


const Invoice = require('../models/Billing');
const Patient = require('../models/Patient');
const User = require('../models/User');

// Test card details for development
const TEST_CARDS = {
    visa: {
        number: '4242424242424242',
        exp_month: 12,
        exp_year: 2024,
        cvc: '123'
    },
    mastercard: {
        number: '5555555555554444',
        exp_month: 12,
        exp_year: 2024,
        cvc: '123'
    },
    declined: {
        number: '4000000000000002',
        exp_month: 12,
        exp_year: 2024,
        cvc: '123'
    }
};

// Generate Invoice - Admin Only
const payment_and_generateInvoice = async (req, res) => {
    try {
        const { patientId, totalAmount, dueDate, appointmentId } = req.body;

        // Check if the patient exists and populate user data
        const patient = await Patient.findById(patientId).populate('user_id');
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Create or get customer in Stripe
        let customer;
        if (patient.stripe_customer_id) {
            customer = await stripe.customers.retrieve(patient.stripe_customer_id);
        } else {
            customer = await stripe.customers.create({
                email: patient.user_id.email,
                name: patient.user_id.name,
                metadata: {
                    patientId: patient._id.toString()
                }
            });
            patient.stripe_customer_id = customer.id;
            await patient.save();
        }

        // Create invoice in Stripe
        const stripeInvoice = await stripe.invoices.create({
            customer: customer.id,
            currency: 'pkr',
            collection_method: 'send_invoice',
            days_until_due: 30
        });

        // Add total amount as a single line item
        await stripe.invoiceItems.create({
            customer: customer.id,
            invoice: stripeInvoice.id,
            currency: 'pkr',
            unit_amount: totalAmount * 100, // Convert to paisa
            quantity: 1,
            description: 'Medical Appointment Charges'
        });

        // Finalize the invoice
        const finalizedInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id);

        // Create invoice in our database
        const invoice = await Invoice.create({
            patient_id: patientId,
            appointment_id: appointmentId,
            total_amount: totalAmount,
            due_date: dueDate,
            stripe_invoice_id: finalizedInvoice.id,
            payment_status: 'Unpaid'
        });

        // Send the invoice
        await stripe.invoices.sendInvoice(finalizedInvoice.id);

        res.status(201).json({
            success: true,
            message: 'Invoice generated successfully',
            data: {
                invoice,
                stripeInvoiceId: finalizedInvoice.id,
                hostedInvoiceUrl: finalizedInvoice.hosted_invoice_url
            }
        });

    } catch (error) {
        console.error('Generate Invoice Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating invoice',
            error: error.message
        });
    }
};

// Payment Accept - Admin
const approvePayment = async (req, res) => {
    try {
        const { invoiceId } = req.body;

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        // Retrieve the invoice from Stripe
        const stripeInvoice = await stripe.invoices.retrieve(invoice.stripe_invoice_id);

        // Check if the invoice is open
        if (stripeInvoice.status !== 'open') {
            return res.status(400).json({
                success: false,
                message: 'Invoice is not open and cannot be approved'
            });
        }

        // Mark the invoice as paid in Stripe
        await stripe.invoices.pay(invoice.stripe_invoice_id);

        // Update invoice status in our database
        invoice.status = 'paid';
        await invoice.save();

        // TODO: Send notification to patient about payment approval

        res.status(200).json({
            success: true,
            message: 'Payment approved successfully',
            data: invoice
        });
    } catch (error) {
        console.error('Approve Payment Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving payment',
            error: error.message
        });
    }
};

// Pay Bill - Patient
const payBill = async (req, res) => {
    try {
        const { invoiceId } = req.body;

        // Find and validate invoice
        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        // Check if invoice is already paid
        if (invoice.payment_status === 'Paid') {
            return res.status(400).json({
                success: false,
                message: 'Invoice is already paid'
            });
        }

        try {
            // Create payment intent using test token
            const paymentIntent = await stripe.paymentIntents.create({
                amount: invoice.total_amount * 100,
                currency: 'pkr',
                payment_method_types: ['card'],
                payment_method: 'pm_card_visa', // Using Stripe's test payment method token
                confirm: true,
                description: `Payment for invoice ${invoice._id}`,
                metadata: {
                    invoice_id: invoice._id.toString(),
                    test_mode: 'true'
                }
            });

            // If payment is successful, update invoice status
            if (paymentIntent.status === 'succeeded') {
                // Update invoice in Stripe
                await stripe.invoices.pay(invoice.stripe_invoice_id, {
                    paid_out_of_band: true
                });

                // Update invoice in database
                invoice.payment_status = 'Paid';
                invoice.amount_paid = invoice.total_amount;
                invoice.payment_intent_id = paymentIntent.id;
                invoice.payment_method = 'Test Card (Visa)';
                invoice.date_of_payment = new Date();
                await invoice.save();

                // Return success response with payment details
                return res.status(200).json({
                    success: true,
                    message: 'Payment processed successfully',
                    data: {
                        invoice,
                        paymentIntent: {
                            id: paymentIntent.id,
                            status: paymentIntent.status,
                            amount: paymentIntent.amount / 100
                        },
                        testMode: true
                    }
                });
            } else {
                // Payment intent created but not succeeded
                return res.status(400).json({
                    success: false,
                    message: 'Payment processing failed',
                    error: `Payment status: ${paymentIntent.status}`
                });
            }
        } catch (stripeError) {
            // Handle Stripe-specific errors
            console.error('Stripe Error:', stripeError);
            return res.status(400).json({
                success: false,
                message: 'Payment processing failed',
                error: stripeError.message
            });
        }

    } catch (error) {
        console.error('Pay Bill Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing payment',
            error: error.message
        });
    }
};

// Download Invoice - Patient
const downloadInvoice = async (req, res) => {
    try {
        const { invoiceId } = req.params;

        // Find the invoice in our database
        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        // Get the invoice from Stripe
        const stripeInvoice = await stripe.invoices.retrieve(invoice.stripe_invoice_id);

        // Check if the hosted invoice URL is available
        if (!stripeInvoice.hosted_invoice_url) {
            return res.status(404).json({
                success: false,
                message: 'Invoice URL not available yet. Please try again in a few moments.'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                invoiceUrl: stripeInvoice.hosted_invoice_url,
                invoiceNumber: stripeInvoice.number,
                amount: stripeInvoice.amount_due,
                status: stripeInvoice.status
            }
        });
    } catch (error) {
        console.error('Download Invoice Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error downloading invoice',
            error: error.message
        });
    }
};

// Add this new function for refunds
const refundPayment = async (req, res) => {
    try {
        const { invoiceId } = req.body;

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        if (invoice.payment_status !== 'Paid') {
            return res.status(400).json({
                success: false,
                message: 'Cannot refund unpaid invoice'
            });
        }

        if (invoice.refunded) {
            return res.status(400).json({
                success: false,
                message: 'Invoice has already been refunded'
            });
        }

        try {
            // First retrieve the Stripe invoice to get the latest payment intent
            const stripeInvoice = await stripe.invoices.retrieve(invoice.stripe_invoice_id);
            
            if (!stripeInvoice.payment_intent) {
                throw new Error('No payment intent found for this invoice');
            }

            // Create refund through Stripe using the latest payment intent
            const refund = await stripe.refunds.create({
                payment_intent: stripeInvoice.payment_intent,
            });

            // Update invoice in our database
            const updatedInvoice = await Invoice.findByIdAndUpdate(
                invoiceId,
                {
                    payment_status: 'Refunded',
                    refunded: true,
                    refund_id: refund.id,
                    refund_date: new Date(),
                    amount_paid: 0 // Reset amount paid since it's refunded
                },
                { new: true }
            );

            // Also void the Stripe invoice
            await stripe.invoices.voidInvoice(invoice.stripe_invoice_id);

            res.status(200).json({
                success: true,
                message: 'Payment refunded successfully',
                data: {
                    invoice: updatedInvoice,
                    refund,
                    refundDate: new Date(),
                    refundAmount: invoice.total_amount
                }
            });
        } catch (stripeError) {
            console.error('Stripe Refund Error:', stripeError);
            throw new Error(`Stripe refund failed: ${stripeError.message}`);
        }
    } catch (error) {
        console.error('Refund Payment Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing refund',
            error: error.message
        });
    }
};

module.exports = {
    payment_and_generateInvoice,
    approvePayment,
    payBill,
    downloadInvoice,
    refundPayment
};