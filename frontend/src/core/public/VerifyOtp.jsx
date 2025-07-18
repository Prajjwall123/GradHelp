import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { verifyOTP } from "../../utils/authHelper";
import logo from "../../assets/logo.png";

const VerifyOtp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || "";
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);

    const handleChange = (e, idx) => {
        const val = e.target.value.replace(/[^0-9]/g, "");
        if (val.length <= 1) {
            const newOtp = [...otp];
            newOtp[idx] = val;
            setOtp(newOtp);
            if (val && idx < 5) {
                inputRefs.current[idx + 1].focus();
            }
        }
    };

    const handleKeyDown = (e, idx) => {
        if (e.key === "Backspace" && !otp[idx] && idx > 0) {
            inputRefs.current[idx - 1].focus();
        }
    };

    const handlePaste = (e) => {
        const val = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6).split("");
        if (val.length === 6) setOtp(val);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            toast.error("Please enter the 6-digit OTP.");
            return;
        }
        setLoading(true);
        try {
            await verifyOTP({ email, otp: otpCode });
            toast.success("Account verified successfully! Please log in.");
            navigate("/login", {
                state: {
                    email: email,
                    fromVerify: true
                }
            });
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to verify OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <img src={logo} alt="Logo" className="w-32 h-16 mb-2" />
            <h1 className="text-3xl font-bold mb-2 text-center">Verify OTP</h1>
            <p className="mb-8 text-center text-gray-400 max-w-lg">
                We have sent you an OTP (One Time Password) to your email address{email ? ` (${email})` : ""}. Please enter it here.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-lg">
                <div className="flex gap-4 mb-8">
                    {otp.map((digit, idx) => (
                        <input
                            key={idx}
                            ref={el => inputRefs.current[idx] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleChange(e, idx)}
                            onKeyDown={e => handleKeyDown(e, idx)}
                            onPaste={handlePaste}
                            className={`w-16 h-16 text-2xl border-2 rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-black ${digit ? "bg-white" : "bg-gray-100"}`}
                        />
                    ))}
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full max-w-xs bg-black text-white py-3 rounded font-semibold text-lg hover:bg-gray-900 transition mb-6"
                >
                    {loading ? "Verifying..." : "Verify OTP"}
                </button>
            </form>
            <div className="text-center mt-4 text-gray-500">
                Did not receive email? <button className="font-semibold underline" type="button">Send Again</button>
            </div>
        </div>
    );
};

export default VerifyOtp;