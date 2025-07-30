const User = require('../models/user');
const TokenService = require('../services/tokenService');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');

class AuthController {
    // Login user and return tokens
    static async login(req, res) {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: errors.array()
                });
            }

            const { email, password } = req.body;
            const ipAddress = req.ip;
            const userAgent = req.get('user-agent');

            // Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check if MFA is enabled for this user
            if (user.mfaEnabled) {
                // Generate a temporary token for MFA verification
                const tempToken = jwt.sign(
                    {
                        userId: user._id,
                        email: user.email,
                        purpose: 'mfa_verification'
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: '5m' } // Short-lived token for MFA verification
                );

                // Generate CSRF token for MFA step as well (optional)
                const { generateCSRFToken } = require('../middleware/csrfProtection');
                const csrfToken = generateCSRFToken(user._id);
                res.setHeader('X-CSRF-Token', csrfToken);

                return res.status(200).json({
                    success: true,
                    requiresMFA: true,
                    tempToken,
                    user: {
                        id: user._id,
                        email: user.email,
                        isNewUser: user.isNewUser
                    },
                    message: 'MFA verification required'
                });
            }

            // Generate tokens for non-MFA login
            const { accessToken, refreshToken } = await this.generateAndSendTokens(user, res, ipAddress, userAgent);

            // Generate CSRF token after successful login
            const { generateCSRFToken } = require('../middleware/csrfProtection');
            const csrfToken = generateCSRFToken(user._id);
            res.setHeader('X-CSRF-Token', csrfToken);

            // Return user data with tokens
            res.status(200).json({
                success: true,
                accessToken,
                refreshToken: refreshToken.token,
                expiresIn: 15 * 60, // 15 minutes in seconds
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    full_name: user.full_name,
                    isNewUser: user.isNewUser
                },
                redirectTo: user.isNewUser ? '/profile' : '/'
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred during login'
            });
        }
    }

    // Refresh access token
    static async refreshToken(req, res) {
        try {
            const token = req.cookies.refreshToken || req.body.refreshToken;
            const ipAddress = req.ip;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token is required'
                });
            }

            // Verify refresh token and get user
            const user = await TokenService.verifyRefreshToken(token, ipAddress);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid refresh token'
                });
            }

            // Generate new access token
            const accessToken = TokenService.generateAccessToken(user);

            // Optionally generate new refresh token (token rotation)
            const refreshToken = await TokenService.generateRefreshToken(user, ipAddress, req.get('user-agent'));

            // Set new refresh token in cookie
            res.cookie('refreshToken', refreshToken.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                path: '/api/auth/refresh-token'
            });

            // Return new tokens
            res.status(200).json({
                success: true,
                accessToken,
                refreshToken: refreshToken.token,
                expiresIn: 15 * 60, // 15 minutes in seconds
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    full_name: user.full_name
                }
            });

        } catch (error) {
            console.error('Refresh token error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while refreshing token'
            });
        }
    }

    // Generate tokens and set refresh token cookie
    static async generateAndSendTokens(user, res, ipAddress, userAgent) {
        const accessToken = TokenService.generateAccessToken(user);
        const refreshToken = await TokenService.generateRefreshToken(user, ipAddress, userAgent);

        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', refreshToken.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/api/auth/refresh-token'
        });

        return { accessToken, refreshToken };
    }

    // Verify MFA token and complete login
    static async verifyMfaLogin(req, res) {
        try {
            console.log('MFA Verification - Request Body:', JSON.stringify(req.body, null, 2));

            const { token, tempToken } = req.body;

            if (!token || !tempToken) {
                console.error('MFA Verification - Missing token or tempToken');
                return res.status(400).json({
                    success: false,
                    message: 'Token and tempToken are required',
                    code: 'MISSING_TOKENS'
                });
            }

            let decoded;
            try {
                // Verify temp token
                decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
                console.log('MFA Verification - Decoded token:', JSON.stringify(decoded, null, 2));

                if (decoded.purpose !== 'mfa_verification') {
                    console.error('MFA Verification - Invalid token purpose:', decoded.purpose);
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid token purpose',
                        code: 'INVALID_TOKEN_PURPOSE'
                    });
                }
            } catch (jwtError) {
                console.error('MFA Verification - JWT Error:', jwtError);
                return res.status(401).json({
                    success: false,
                    message: jwtError.name === 'TokenExpiredError' ? 'Verification token has expired' : 'Invalid verification token',
                    code: jwtError.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
                });
            }

            // Get user with mfaSecret
            console.log('MFA Verification - Looking up user with ID:', decoded.userId);
            const user = await User.findById(decoded.userId).select('+mfaSecret');
            console.log('MFA Verification - Retrieved user:', {
                _id: user?._id,
                email: user?.email,
                mfaEnabled: user?.mfaEnabled,
                hasMfaSecret: !!user?.mfaSecret,
                mfaSecretLength: user?.mfaSecret?.length
            });
            if (!user) {
                console.error('MFA Verification - User not found with ID:', decoded.userId);
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            // Verify MFA token with detailed logging
            console.log('MFA Verification - Verifying token for user:', user.email);
            console.log('MFA Verification - MFA Secret (first 5 chars):', user.mfaSecret ? user.mfaSecret.substring(0, 5) + '...' : 'undefined');
            console.log('MFA Verification - Token received:', token);

            if (!user.mfaSecret) {
                console.error('MFA Verification - No MFA secret found for user');
                return res.status(400).json({
                    success: false,
                    message: 'MFA not properly set up. Please set up MFA again.',
                    code: 'MFA_NOT_SET_UP'
                });
            }

            // Generate current and previous/next tokens to account for clock drift
            const currentToken = speakeasy.totp({
                secret: user.mfaSecret,
                encoding: 'base32',
                step: 30
            });

            const previousToken = speakeasy.totp({
                secret: user.mfaSecret,
                encoding: 'base32',
                step: 30,
                time: Date.now() - 30000 // Previous 30-second window
            });

            const nextToken = speakeasy.totp({
                secret: user.mfaSecret,
                encoding: 'base32',
                step: 30,
                time: Date.now() + 30000 // Next 30-second window
            });

            console.log('MFA Verification - Current token window:', {
                previous: previousToken,
                current: currentToken,
                next: nextToken
            });

            // Check if the provided token matches any of the valid tokens
            const tokenStr = token.toString().trim();
            const isValidToken = [previousToken, currentToken, nextToken].includes(tokenStr);

            console.log('MFA Verification - Token validation result:', {
                isValid: isValidToken,
                receivedToken: tokenStr,
                timestamp: new Date().toISOString()
            });

            if (!isValidToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid MFA token',
                    code: 'INVALID_MFA_TOKEN',
                    debug: process.env.NODE_ENV === 'development' ? {
                        validTokens: [previousToken, currentToken, nextToken],
                        receivedToken: tokenStr,
                        timestamp: new Date().toISOString()
                    } : undefined
                });
            }

            // Generate tokens and complete login
            const ipAddress = req.ip;
            const userAgent = req.get('user-agent');
            const { accessToken, refreshToken } = await this.generateAndSendTokens(user, res, ipAddress, userAgent);

            // Generate CSRF token after successful login
            const { generateCSRFToken } = require('../middleware/csrfProtection');
            const csrfToken = generateCSRFToken(user._id);
            res.setHeader('X-CSRF-Token', csrfToken);

            // Return success response
            res.status(200).json({
                success: true,
                accessToken,
                refreshToken: refreshToken.token,
                expiresIn: 15 * 60, // 15 minutes in seconds
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    full_name: user.full_name,
                    isNewUser: user.isNewUser
                },
                redirectTo: user.isNewUser ? '/profile' : '/'
            });

        } catch (error) {
            console.error('MFA verification error:', error);
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired verification token'
                });
            }
            res.status(500).json({
                success: false,
                message: 'An error occurred during MFA verification'
            });
        }
    }

    // Logout user by revoking refresh token
    static async logout(req, res) {
        try {
            const token = req.cookies.refreshToken || req.body.refreshToken;
            const ipAddress = req.ip;

            if (token) {
                await TokenService.revokeToken(token, ipAddress);
            }

            // Clear the refresh token cookie
            res.clearCookie('refreshToken', {
                path: '/api/auth/refresh-token'
            });

            res.status(200).json({
                success: true,
                message: 'Successfully logged out'
            });

        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred during logout'
            });
        }
    }

    // Get current user's refresh tokens
    static async getRefreshTokens(req, res) {
        try {
            const tokens = await TokenService.getRefreshTokens(req.user._id);
            res.status(200).json({
                success: true,
                data: tokens
            });
        } catch (error) {
            console.error('Get refresh tokens error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while fetching refresh tokens'
            });
        }
    }

    // Revoke a specific refresh token
    static async revokeToken(req, res) {
        try {
            const { token } = req.body;
            const ipAddress = req.ip;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Token is required'
                });
            }

            await TokenService.revokeToken(token, ipAddress);

            res.status(200).json({
                success: true,
                message: 'Token revoked successfully'
            });

        } catch (error) {
            console.error('Revoke token error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while revoking token'
            });
        }
    }
}

module.exports = AuthController;
