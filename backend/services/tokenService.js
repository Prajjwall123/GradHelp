const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/refreshToken');
const User = require('../models/user');

// Load environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret';

// Token expiration times (in seconds)
const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days

class TokenService {
    // Generate access token
    static generateAccessToken(user) {
        const payload = {
            sub: user._id,
            email: user.email,
            role: user.role
        };

        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: ACCESS_TOKEN_EXPIRY
        });
    }

    // Generate refresh token and save to database
    static async generateRefreshToken(user, ipAddress, userAgent) {
        // Create a refresh token that expires in 7 days
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000);
        const token = RefreshToken.generateToken();

        // Save the refresh token to database
        const refreshToken = new RefreshToken({
            user: user._id,
            token: token,
            expiresAt: expiresAt,
            createdByIp: ipAddress,
            userAgent: userAgent
        });

        await refreshToken.save();

        // Return the plaintext token (only time it's available)
        return {
            token: token,
            expiresAt: expiresAt
        };
    }

    // Verify access token
    static verifyAccessToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return null;
        }
    }

    // Verify refresh token and return user if valid
    static async verifyRefreshToken(token, ipAddress) {
        // Hash the token to compare with database
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const refreshToken = await RefreshToken.findOne({
            token: hashedToken,
            revoked: false,
            expiresAt: { $gt: new Date() }
        }).populate('user');

        if (!refreshToken || !refreshToken.isActive) {
            return null;
        }

        // Update the refresh token's last used timestamp
        refreshToken.lastUsedAt = new Date();
        refreshToken.lastUsedByIp = ipAddress;
        await refreshToken.save();

        return refreshToken.user;
    }

    // Revoke a refresh token
    static async revokeToken(token, ipAddress) {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const refreshToken = await RefreshToken.findOneAndUpdate(
            { token: hashedToken },
            {
                revoked: true,
                revokedAt: new Date(),
                revokedByIp: ipAddress
            },
            { new: true }
        );

        return refreshToken;
    }

    // Revoke all refresh tokens for a user
    static async revokeAllTokensForUser(userId, ipAddress) {
        await RefreshToken.updateMany(
            { user: userId, revoked: false },
            {
                revoked: true,
                revokedAt: new Date(),
                revokedByIp: ipAddress,
                reason: 'User requested all tokens to be revoked'
            }
        );
    }

    // Get all refresh tokens for a user
    static async getRefreshTokens(userId) {
        return await RefreshToken.find({ user: userId })
            .sort('-createdAt')
            .select('-token'); // Don't return the actual tokens
    }
}

module.exports = TokenService;
