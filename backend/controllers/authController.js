const User = require('../models/user');
const TokenService = require('../services/tokenService');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');

class AuthController {
    
    static async login(req, res) {
        try {
            
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

            
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            
            if (user.mfaEnabled) {
                
                const tempToken = jwt.sign(
                    {
                        userId: user._id,
                        email: user.email,
                        purpose: 'mfa_verification'
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: '5m' } 
                );

                
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

            
            const { accessToken, refreshToken } = await this.generateAndSendTokens(user, res, ipAddress, userAgent);

            
            const { generateCSRFToken } = require('../middleware/csrfProtection');
            const csrfToken = generateCSRFToken(user._id);
            res.setHeader('X-CSRF-Token', csrfToken);

            
            res.status(200).json({
                success: true,
                accessToken,
                refreshToken: refreshToken.token,
                expiresIn: 15 * 60, 
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

            
            const user = await TokenService.verifyRefreshToken(token, ipAddress);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid refresh token'
                });
            }

            
            const accessToken = TokenService.generateAccessToken(user);

            
            const refreshToken = await TokenService.generateRefreshToken(user, ipAddress, req.get('user-agent'));

            
            res.cookie('refreshToken', refreshToken.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, 
                path: '/api/auth/refresh-token'
            });

            
            res.status(200).json({
                success: true,
                accessToken,
                refreshToken: refreshToken.token,
                expiresIn: 15 * 60, 
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

    
    static async generateAndSendTokens(user, res, ipAddress, userAgent) {
        const accessToken = TokenService.generateAccessToken(user);
        const refreshToken = await TokenService.generateRefreshToken(user, ipAddress, userAgent);

        
        res.cookie('refreshToken', refreshToken.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, 
            path: '/api/auth/refresh-token'
        });

        return { accessToken, refreshToken };
    }

    
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

            
            const currentToken = speakeasy.totp({
                secret: user.mfaSecret,
                encoding: 'base32',
                step: 30
            });

            const previousToken = speakeasy.totp({
                secret: user.mfaSecret,
                encoding: 'base32',
                step: 30,
                time: Date.now() - 30000 
            });

            const nextToken = speakeasy.totp({
                secret: user.mfaSecret,
                encoding: 'base32',
                step: 30,
                time: Date.now() + 30000 
            });

            console.log('MFA Verification - Current token window:', {
                previous: previousToken,
                current: currentToken,
                next: nextToken
            });

            
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

            
            const ipAddress = req.ip;
            const userAgent = req.get('user-agent');
            const { accessToken, refreshToken } = await this.generateAndSendTokens(user, res, ipAddress, userAgent);

            
            const { generateCSRFToken } = require('../middleware/csrfProtection');
            const csrfToken = generateCSRFToken(user._id);
            res.setHeader('X-CSRF-Token', csrfToken);

            
            res.status(200).json({
                success: true,
                accessToken,
                refreshToken: refreshToken.token,
                expiresIn: 15 * 60, 
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

    
    static async logout(req, res) {
        try {
            const token = req.cookies.refreshToken || req.body.refreshToken;
            const ipAddress = req.ip;

            if (token) {
                await TokenService.revokeToken(token, ipAddress);
            }

            
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
