const User = require('../models/user');
const TokenService = require('../services/tokenService');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

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

            // Generate tokens
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

            // Return access token in response
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
