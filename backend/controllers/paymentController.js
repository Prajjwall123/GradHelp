const axios = require('axios');
const User = require('../models/user');

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_BASE_URL = 'https://dev.khalti.com/api/v2';

console.log('Khalti Configuration:', {
    environment: 'test',
    baseUrl: KHALTI_BASE_URL,
    keyLength: KHALTI_SECRET_KEY.length
});

const khaltiClient = axios.create({
    baseURL: KHALTI_BASE_URL,
    headers: {
        'Authorization': `Key ${KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
    },
});

khaltiClient.interceptors.request.use(
    config => {
        console.log('Khalti API Request:', {
            url: config.url,
            method: config.method,
            headers: {
                ...config.headers,
                Authorization: 'Key ' + (config.headers.Authorization ? '***' + KHALTI_SECRET_KEY.slice(-4) : 'Not set')
            },
            data: config.data
        });
        return config;
    },
    error => {
        console.error('Khalti API Request Error:', error);
        return Promise.reject(error);
    }
);

khaltiClient.interceptors.response.use(
    response => {
        console.log('Khalti API Response:', {
            status: response.status,
            statusText: response.statusText,
            data: response.data
        });
        return response;
    },
    error => {
        if (error.response) {
            console.error('Khalti API Error Response:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                headers: error.response.headers,
            });
        } else if (error.request) {
            console.error('Khalti API No Response:', error.request);
        } else {
            console.error('Khalti API Error:', error.message);
        }
        return Promise.reject(error);
    }
);


const initiatePayment = async (req, res) => {
    console.log('=== Payment Initiation Started ===');
    console.log('Request body:', req.body);
    console.log('Authenticated user:', req.user);

    const { amount } = req.body;
    const userId = req.user?._id;

    if (!userId || !amount) {
        console.error('Validation failed - Missing user ID or amount');
        return res.status(400).json({
            success: false,
            message: 'User ID and amount are required.',
        });
    }

    try {
        console.log('Looking up user in database...');
        const user = await User.findById(userId);
        if (!user) {
            console.error('User not found in database');
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        console.log('User found:', { id: user._id, email: user.email });

        const purchase_order_id = `premium_${Date.now()}`;
        const purchase_order_name = 'Premium Membership Upgrade';
        const amountInPaisa = amount * 100; 

        const paymentData = {
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-plan`,
            website_url: process.env.FRONTEND_URL || 'http://localhost:5173',
            amount: amountInPaisa,
            purchase_order_id,
            purchase_order_name,
            customer_info: {
                name: user.full_name || 'Customer',
                email: user.email,
            }
        };

        console.log('Initiating Khalti payment with data:', {
            ...paymentData,
            amount: `${amountInPaisa} paisa (${amount} NPR)`
        });

        const khaltiResponse = await khaltiClient.post('/epayment/initiate/', paymentData);

        user.payment = {
            purchase_order_id,
            amount: amountInPaisa,
            status: 'initiated',
            khalti_data: khaltiResponse.data,
            initiatedAt: new Date(),
        };

        await user.save();

        console.log('Payment initiation successful');

        res.status(200).json({
            success: true,
            message: 'Payment initiated successfully',
            data: khaltiResponse.data,
        });
    } catch (error) {
        console.error('Error in initiatePayment:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            stack: error.stack,
        });

        const errorMessage = error.response?.data?.detail ||
            error.response?.data?.error?.message ||
            'Failed to initiate payment with Khalti';

        res.status(error.response?.status || 500).json({
            success: false,
            message: errorMessage,
            error: {
                detail: errorMessage,
                status_code: error.response?.status || 500,
            },
        });
    }
};


const verifyPayment = async (req, res) => {
    console.log('=== Payment Verification Started ===');
    console.log('Request body:', req.body);
    console.log('Authenticated user:', req.user);

    const { pidx } = req.body;
    const userId = req.user?._id;

    if (!pidx) {
        console.error('Validation failed - Missing pidx');
        return res.status(400).json({
            success: false,
            message: 'Payment ID (pidx) is required.',
        });
    }

    try {
        console.log('Looking up user in database...');
        const user = await User.findById(userId);
        if (!user) {
            console.error('User not found in database');
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        console.log('Verifying payment with Khalti...');
        const verificationResponse = await khaltiClient.post('/epayment/lookup/', { pidx });

        if (verificationResponse.data.status === 'Completed') {
            user.premium = true;
            user.premiumSince = new Date();
            user.payment = {
                ...user.payment,
                status: 'completed',
                khalti_data: verificationResponse.data,
                completedAt: new Date(),
            };

            await user.save({ validateBeforeSave: false });

            console.log('Payment verification successful - User upgraded to premium', {
                userId: user._id,
                premium: user.premium,
                premiumSince: user.premiumSince
            });

            return res.status(200).json({
                success: true,
                message: 'Payment verified and user upgraded to premium.',
                data: {
                    premium: true,
                    premiumSince: user.premiumSince,
                },
            });
        } else {
            console.error('Payment verification failed - Status not completed:', verificationResponse.data.status);
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed - ' + (verificationResponse.data.state || 'Payment not completed'),
                data: verificationResponse.data,
            });
        }
    } catch (error) {
        console.error('Error in verifyPayment:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            stack: error.stack,
        });

        const errorMessage = error.response?.data?.detail ||
            error.response?.data?.error?.message ||
            'Failed to verify payment with Khalti';

        res.status(error.response?.status || 500).json({
            success: false,
            message: errorMessage,
            error: {
                detail: errorMessage,
                status_code: error.response?.status || 500,
            },
        });
    }
};

module.exports = {
    initiatePayment,
    verifyPayment,
};
