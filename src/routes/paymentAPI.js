// src/routes/paymentAPI.js
const express = require('express');
const router = express.Router();
const { PaymentService } = require('../services/paymentService');

// Initialize payment service
const paymentService = new PaymentService();

// POST /api/payments/process - Process a payment
router.post('/process', async (req, res) => {
    try {
        const {
            amount,
            paymentMethod,
            cardDetails,
            billingAddress,
            saveCard = false
        } = req.body;

        // Validate required fields
        if (!amount || !paymentMethod || !cardDetails) {
            return res.status(400).json({
                success: false,
                error: 'Missing required payment information'
            });
        }

        // Validate amount
        if (amount <= 0 || amount > 10000) {
            return res.status(400).json({
                success: false,
                error: 'Invalid payment amount'
            });
        }

        // Process payment
        const paymentResult = await paymentService.processPayment({
            amount,
            paymentMethod,
            cardDetails,
            billingAddress,
            saveCard
        });

        res.json({
            success: true,
            transaction: paymentResult.transaction,
            confirmation: paymentResult.confirmation,
            savedCard: paymentResult.savedCard || null
        });

    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({
            success: false,
            error: 'Payment processing failed',
            details: error.message
        });
    }
});

// GET /api/payments/history - Get payment history
router.get('/history', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = '' } = req.query;
        
        const payments = await paymentService.getPaymentHistory({
            page: parseInt(page),
            limit: parseInt(limit),
            search,
            status
        });

        res.json({
            success: true,
            payments: payments.data,
            pagination: {
                page: payments.page,
                limit: payments.limit,
                total: payments.total,
                totalPages: payments.totalPages
            }
        });

    } catch (error) {
        console.error('Payment history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve payment history'
        });
    }
});

// GET /api/payments/:id - Get payment details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const payment = await paymentService.getPaymentById(id);
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                error: 'Payment not found'
            });
        }

        res.json({
            success: true,
            payment: payment
        });

    } catch (error) {
        console.error('Payment details error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve payment details'
        });
    }
});

// POST /api/payments/methods - Add payment method
router.post('/methods', async (req, res) => {
    try {
        const {
            cardDetails,
            billingAddress,
            isDefault = false
        } = req.body;

        if (!cardDetails || !cardDetails.number || !cardDetails.expiry) {
            return res.status(400).json({
                success: false,
                error: 'Invalid card details'
            });
        }

        const paymentMethod = await paymentService.addPaymentMethod({
            cardDetails,
            billingAddress,
            isDefault
        });

        res.json({
            success: true,
            paymentMethod: paymentMethod
        });

    } catch (error) {
        console.error('Add payment method error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add payment method'
        });
    }
});

// GET /api/payments/methods - Get saved payment methods
router.get('/methods', async (req, res) => {
    try {
        const paymentMethods = await paymentService.getPaymentMethods();

        res.json({
            success: true,
            paymentMethods: paymentMethods
        });

    } catch (error) {
        console.error('Get payment methods error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve payment methods'
        });
    }
});

// PUT /api/payments/methods/:id - Update payment method
router.put('/methods/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedMethod = await paymentService.updatePaymentMethod(id, updateData);

        if (!updatedMethod) {
            return res.status(404).json({
                success: false,
                error: 'Payment method not found'
            });
        }

        res.json({
            success: true,
            paymentMethod: updatedMethod
        });

    } catch (error) {
        console.error('Update payment method error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update payment method'
        });
    }
});

// DELETE /api/payments/methods/:id - Delete payment method
router.delete('/methods/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await paymentService.deletePaymentMethod(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Payment method not found'
            });
        }

        res.json({
            success: true,
            message: 'Payment method deleted successfully'
        });

    } catch (error) {
        console.error('Delete payment method error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete payment method'
        });
    }
});

// POST /api/payments/autopay/setup - Setup auto pay
router.post('/autopay/setup', async (req, res) => {
    try {
        const {
            paymentMethodId,
            daysBefore = 0,
            maxAmount = null,
            enabled = true
        } = req.body;

        if (!paymentMethodId) {
            return res.status(400).json({
                success: false,
                error: 'Payment method ID is required'
            });
        }

        const autopaySettings = await paymentService.setupAutoPay({
            paymentMethodId,
            daysBefore,
            maxAmount,
            enabled
        });

        res.json({
            success: true,
            autopaySettings: autopaySettings
        });

    } catch (error) {
        console.error('Auto pay setup error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to setup auto pay'
        });
    }
});

// GET /api/payments/autopay/settings - Get auto pay settings
router.get('/autopay/settings', async (req, res) => {
    try {
        const autopaySettings = await paymentService.getAutopaySettings();

        res.json({
            success: true,
            autopaySettings: autopaySettings
        });

    } catch (error) {
        console.error('Get autopay settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve autopay settings'
        });
    }
});

// PUT /api/payments/autopay/settings - Update auto pay settings
router.put('/autopay/settings', async (req, res) => {
    try {
        const settings = req.body;

        const updatedSettings = await paymentService.updateAutopaySettings(settings);

        res.json({
            success: true,
            autopaySettings: updatedSettings
        });

    } catch (error) {
        console.error('Update autopay settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update autopay settings'
        });
    }
});

// POST /api/payments/autopay/disable - Disable auto pay
router.post('/autopay/disable', async (req, res) => {
    try {
        const result = await paymentService.disableAutoPay();

        res.json({
            success: true,
            message: 'Auto pay disabled successfully',
            autopaySettings: result
        });

    } catch (error) {
        console.error('Disable autopay error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to disable auto pay'
        });
    }
});

// GET /api/payments/analytics - Get payment analytics
router.get('/analytics', async (req, res) => {
    try {
        const { period = '6months' } = req.query;
        
        const analytics = await paymentService.getPaymentAnalytics(period);

        res.json({
            success: true,
            analytics: analytics
        });

    } catch (error) {
        console.error('Payment analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve payment analytics'
        });
    }
});

// POST /api/payments/refund - Process refund
router.post('/refund', async (req, res) => {
    try {
        const { paymentId, amount, reason } = req.body;

        if (!paymentId || !amount || !reason) {
            return res.status(400).json({
                success: false,
                error: 'Payment ID, amount, and reason are required'
            });
        }

        const refund = await paymentService.processRefund({
            paymentId,
            amount,
            reason
        });

        res.json({
            success: true,
            refund: refund
        });

    } catch (error) {
        console.error('Refund processing error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process refund'
        });
    }
});

// GET /api/payments/notifications - Get payment notifications
router.get('/notifications', async (req, res) => {
    try {
        const notifications = await paymentService.getPaymentNotifications();

        res.json({
            success: true,
            notifications: notifications
        });

    } catch (error) {
        console.error('Payment notifications error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve notifications'
        });
    }
});

// POST /api/payments/notifications/preferences - Update notification preferences
router.post('/notifications/preferences', async (req, res) => {
    try {
        const preferences = req.body;

        const updatedPreferences = await paymentService.updateNotificationPreferences(preferences);

        res.json({
            success: true,
            preferences: updatedPreferences
        });

    } catch (error) {
        console.error('Update notification preferences error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update notification preferences'
        });
    }
});

module.exports = router;