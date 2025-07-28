const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/user');
const { generateBackupCodes } = require('../utils/helpers');

class MFAController {
    // Get MFA status for the current user
    static async getMfaStatus(req, res) {
        try {
            console.log('MFA Status - Request User:', req.user);
            
            // The user ID is in req.user._id as set by the auth middleware
            const userId = req.user._id;
            
            if (!userId) {
                console.error('MFA Status - No user ID in request:', req.user);
                return res.status(401).json({ 
                    success: false, 
                    message: 'Authentication required',
                    code: 'AUTH_REQUIRED'
                });
            }
            
            console.log('MFA Status - Looking up user with ID:', userId);
            const user = await User.findById(userId);
            
            if (!user) {
                console.error('MFA Status - User not found in database. ID:', userId);
                return res.status(404).json({ 
                    success: false, 
                    message: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            res.json({
                success: true,
                mfaEnabled: user.mfaEnabled || false,
                hasBackupCodes: user.backupCodes && user.backupCodes.length > 0
            });
        } catch (error) {
            console.error('Error getting MFA status:', error);
            res.status(500).json({ success: false, message: 'Failed to get MFA status' });
        }
    }

    // Generate MFA secret and QR code
    static async setupMFA(req, res) {
        try {
            console.log('MFA Setup - Request User:', req.user);
            
            if (!req.user || !req.user._id) {
                console.error('MFA Setup - No user ID in request');
                return res.status(401).json({ 
                    success: false, 
                    message: 'Authentication required',
                    code: 'AUTH_REQUIRED'
                });
            }

            const user = await User.findById(req.user._id);
            if (!user) {
                console.error('MFA Setup - User not found in database. ID:', req.user._id);
                return res.status(404).json({ 
                    success: false, 
                    message: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            console.log('MFA Setup - Generating secret for user:', user.email);
            
            // Generate a new secret
            const secret = speakeasy.generateSecret({
                name: 'GradHelp',
                issuer: 'GradHelp',
                length: 20
            });

            // Create a properly formatted OTP Auth URL
            const otpauthUrl = `otpauth://totp/GradHelp:${encodeURIComponent(user.email)}?secret=${secret.base32}&issuer=GradHelp&algorithm=SHA1&digits=6&period=30`;
            
            // Return the OTP URL and let the frontend generate the QR code
            console.log('MFA Setup - OTP Auth URL:', otpauthUrl);
            
            // Generate backup codes (these will be saved after verification)
            const backupCodes = generateBackupCodes();
            console.log('MFA Setup - Generated backup codes');

            res.json({
                success: true,
                secret: secret.base32,
                otpUrl: otpauthUrl,
                backupCodes: process.env.NODE_ENV === 'development' ? backupCodes : undefined
            });
        } catch (error) {
            console.error('MFA Setup - Unexpected error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to set up MFA',
                code: 'MFA_SETUP_FAILED',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Verify MFA setup
    static async verifyMFA(req, res) {
        try {
            console.log('MFA Verify - Request User:', req.user);
            
            if (!req.user || !req.user._id) {
                console.error('MFA Verify - No user ID in request');
                return res.status(401).json({ 
                    success: false, 
                    message: 'Authentication required',
                    code: 'AUTH_REQUIRED'
                });
            }

            const { token, secret, backupCodes } = req.body;
            
            if (!token || !secret) {
                console.error('MFA Verify - Missing token or secret');
                return res.status(400).json({ 
                    success: false, 
                    message: 'Token and secret are required',
                    code: 'MISSING_REQUIRED_FIELDS'
                });
            }

            console.log('MFA Verify - Looking up user with ID:', req.user._id);
            const user = await User.findById(req.user._id);
            
            if (!user) {
                console.error('MFA Verify - User not found in database. ID:', req.user._id);
                return res.status(404).json({ 
                    success: false, 
                    message: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            // Get the secret from the request and verify the token
            const tempSecret = secret;
            
            console.log('MFA Verify - Verifying token with secret (first 5 chars):', 
                tempSecret ? tempSecret.substring(0, 5) + '...' : 'undefined');
            
            const verified = speakeasy.totp.verify({
                secret: tempSecret,
                encoding: 'base32',
                token: token.toString().trim(),
                window: 2, // Allow 2 steps (1 minute) for clock drift
                step: 30  // 30-second step
            });
            
            console.log('MFA Verify - Token verification result:', verified);
            
            if (verified) {
                try {
                    // Generate backup codes if not provided
                    const codesToSave = backupCodes || generateBackupCodes();
                    
                    // Save the secret and backup codes
                    user.mfaEnabled = true;
                    user.mfaSecret = tempSecret;
                    user.backupCodes = codesToSave.map(code => ({
                        code: code.hash || code, // Handle case where code might be a string
                        used: false
                    }));
                    
                    await user.save();
                    
                    console.log('MFA Verify - Successfully enabled MFA for user:', user.email);
                    
                    return res.json({ 
                        success: true,
                        backupCodes: process.env.NODE_ENV === 'development' ? 
                            codesToSave.map(bc => bc.plain || bc) : undefined
                    });
                } catch (saveError) {
                    console.error('MFA Verify - Error saving user:', saveError);
                    throw saveError;
                }
            }
            
            // If we get here, the token was not valid
            console.error('MFA Verify - Invalid token provided');
            
            // Generate what the current valid token should be for debugging
            const currentToken = speakeasy.totp({
                secret: tempSecret,
                encoding: 'base32',
                step: 30
            });
            
            console.log('MFA Verify - Current expected token:', currentToken);
            
            res.status(400).json({ 
                success: false, 
                message: 'Invalid token',
                code: 'INVALID_TOKEN',
                debug: process.env.NODE_ENV === 'development' ? {
                    expectedToken: currentToken,
                    receivedToken: token,
                    timestamp: new Date().toISOString()
                } : undefined
            });
        } catch (error) {
            console.error('MFA verification error:', error);
            res.status(500).json({ success: false, message: 'Failed to verify MFA' });
        }
    }

    // Verify MFA login
    static async verifyLogin(req, res, next) {
        try {
            const { email, token } = req.body;
            const user = await User.findOne({ email }).select('+mfaSecret');
            
            // If user doesn't have MFA enabled, continue
            if (!user?.mfaEnabled) {
                return next();
            }

            // If no token provided, indicate MFA is required
            if (!token) {
                return res.status(200).json({ 
                    success: false, 
                    requiresMFA: true,
                    message: 'MFA token required'
                });
            }

            // Verify the token
            const verified = speakeasy.totp.verify({
                secret: user.mfaSecret,
                encoding: 'base32',
                token,
                window: 1
            });
            
            if (!verified) {
                return res.status(401).json({ 
                    success: false, 
                    requiresMFA: true,
                    message: 'Invalid MFA token' 
                });
            }
            
            // Token is valid, continue with login
            next();
        } catch (error) {
            console.error('MFA login error:', error);
            res.status(500).json({ success: false, message: 'MFA verification failed' });
        }
    }
}

module.exports = MFAController;
