const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/refreshToken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const ACCESS_TOKEN_EXPIRY = 15 * 60; 
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; 

class TokenService {
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

    static async generateRefreshToken(user, ipAddress, userAgent) {
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000);
        const token = RefreshToken.generateToken();

        const refreshToken = new RefreshToken({
            user: user._id,
            token: token,
            expiresAt: expiresAt,
            createdByIp: ipAddress,
            userAgent: userAgent
        });

        await refreshToken.save();

        return {
            token: token,
            expiresAt: expiresAt
        };
    }

    static verifyAccessToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return null;
        }
    }

    static async verifyRefreshToken(token, ipAddress) {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const refreshToken = await RefreshToken.findOne({
            token: hashedToken,
            revoked: false,
            expiresAt: { $gt: new Date() }
        }).populate('user');

        if (!refreshToken || !refreshToken.isActive) {
            return null;
        }

        refreshToken.lastUsedAt = new Date();
        refreshToken.lastUsedByIp = ipAddress;
        await refreshToken.save();

        return refreshToken.user;
    }

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

    static async getRefreshTokens(userId) {
        return await RefreshToken.find({ user: userId })
            .sort('-createdAt')
            .select('-token'); 
    }
}

module.exports = TokenService;
