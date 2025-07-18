const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        transactionId: {
            type: String,
            required: true,
            unique: true
        },
        amount: {
            type: Number,
            required: true
        },
        paymentGateway: {
            type: String,
            enum: ["Khalti"],
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "success", "failed", "completed"],
            default: "pending"
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
