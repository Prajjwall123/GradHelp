const axios = require("axios");
const Transaction = require("../models/transaction");

// Initialize transaction with Khalti
exports.initiateTransaction = async (req, res) => {
    const { userId, amount, paymentGateway } = req.body;

    if (!userId || !amount) {
        return res.status(400).json({
            success: false,
            message: "User ID and amount are required.",
        });
    }

    try {
        // Ensure proper URL formatting
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const purchase_order_id = `order_${Date.now()}`;
        const purchase_order_name = "Scholarship Payment";

        const transaction = new Transaction({
            userId,
            amount,
            paymentGateway,
            transactionId: purchase_order_id,
            status: "pending",
        });

        await transaction.save();
        console.log("Transaction created:", transaction);

        // Ensure URLs end with /
        const returnUrl = `${frontendUrl}/payment-callback/`;
        const websiteUrl = `${frontendUrl}/`;

        const khaltiResponse = await axios.post(
            process.env.KHALTI_ENV === 'production'
                ? 'https://khalti.com/api/v2/epayment/initiate/'
                : 'https://dev.khalti.com/api/v2/epayment/initiate/',
            {
                return_url: returnUrl,
                website_url: websiteUrl,
                amount: amount * 100,  // Convert to paisa
                purchase_order_id,
                purchase_order_name,
            },
            {
                headers: {
                    Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("Khalti response (initiate):", khaltiResponse.data);

        const { pidx, payment_url } = khaltiResponse.data;

        res.status(201).json({
            success: true,
            message: "Transaction initiated successfully.",
            pidx,
            payment_url,
            transactionId: purchase_order_id,
        });

    } catch (err) {
        console.error("Error initiating transaction:", err.response?.data || err.message);

        // Handle Khalti validation errors specifically
        if (err.response?.data?.error_key === 'validation_error') {
            return res.status(400).json({
                success: false,
                message: "Invalid payment parameters",
                errors: err.response.data
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to initiate transaction.",
            error: err.response?.data || err.message,
        });
    }
};

// Verify transaction callback
exports.verifyTransaction = async (req, res) => {
    const { pidx, transaction_id } = req.body;

    if (!pidx || !transaction_id) {
        return res.status(400).json({
            success: false,
            message: "pidx and transaction_id are required.",
        });
    }

    try {
        console.log("Verifying transaction with pidx:", pidx);

        const khaltiResponse = await axios.post(
            process.env.KHALTI_ENV === 'production'
                ? 'https://khalti.com/api/v2/epayment/lookup/'
                : 'https://dev.khalti.com/api/v2/epayment/lookup/',
            { pidx },
            {
                headers: {
                    Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
                },
            }
        );

        const { status, total_amount } = khaltiResponse.data;
        console.log("Khalti response (verify):", khaltiResponse.data);

        const transaction = await Transaction.findOne({ transactionId: transaction_id });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found.",
            });
        }

        if (transaction.status === "success") {
            return res.status(400).json({
                success: false,
                message: "Transaction already verified and processed.",
            });
        }

        transaction.status = status.toLowerCase();
        await transaction.save();

        // You can add additional logic here for processing the payment
        // For example, updating scholarship status, sending notifications, etc.

        return res.status(200).json({
            success: true,
            message: `Transaction verified successfully. Status: ${status}`,
            transaction,
        });

    } catch (err) {
        console.error("Error verifying transaction:", err.response?.data || err.message);
        res.status(500).json({
            success: false,
            message: "Transaction verification failed.",
            error: err.response?.data || err.message,
        });
    }
};
