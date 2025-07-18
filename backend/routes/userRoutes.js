const express = require("express");
const router = express.Router();

const {
    register,
    verifyOTP,
    login,
    updateUser,
    deleteUser
} = require("../controllers/userController");

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
