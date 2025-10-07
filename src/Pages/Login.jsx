import React, { useState, useEffect } from "react";
import api from "../axiosConfig";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Activity, ArrowRight, ShieldCheck } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [step, setStep] = useState("login");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("auth");
    if (token) {
      setStep("loggedIn");
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

const handleLogin = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setMessage("");

  try {
    const res = await api.post("/Authentication/Login", form);

    // Set the cookie
    Cookies.set("auth", res.data.data.token, { expires: 1, path: "/" });

    // Read it back
    const tokenFromCookie = Cookies.get("auth");
    console.log("Cookie auth:", tokenFromCookie); // ✅ this works
     console.log("Cookie just set:", Cookies.get("auth")); 

    const otpCode = generateOtp();
    setGeneratedOtp(otpCode);

    alert(`📩 OTP sent to your  (Otp: ${otpCode})`);
    setStep("otp");
  } catch (err) {
    setMessage("❌ Invalid email or password");
  } finally {
    setIsLoading(false);
  }
};
  const resendOtp = () => {
    const newOtp = generateOtp();
    setGeneratedOtp(newOtp);
    alert(`📩 New OTP sent to your  (Otp: ${newOtp})`);
  };

  const handleLogout = () => {
    Cookies.remove("auth");
    setStep("login");
    setMessage("Logged out successfully");
  };


const handleOtpVerify = (e) => {
  e.preventDefault();
  setIsOtpLoading(true);
  setMessage("");

  setTimeout(() => {
    if (otp === generatedOtp) {
      setMessage("✅ OTP verified! Redirecting...");
      toast.success("Login Approved");
      setTimeout(() => navigate("/dashboard"), 1500);
    } else {
      setMessage("❌ Invalid OTP. Try again.");
    }
    setIsOtpLoading(false);
  }, 1000);
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full">
              <Activity className="text-white" size={30} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {step === "otp" ? "Verify OTP" : "Welcome Back"}
          </h1>
          <p className="text-white/70">
            {step === "otp"
              ? "Enter the OTP sent to your email"
              : "Sign in to access your account"}
          </p>
        </div>

        {/* LOGIN FORM */}
        {step === "login" && (
          <>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-white/70" size={20} />
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/60"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 text-white/70" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-white/70"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
              >
                {isLoading ? "Signing in..." : "Sign In"}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>

            {/* Register Link */}
            <p className="text-white/70 text-sm text-center mt-4">
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-purple-300 hover:text-white font-medium"
              >
                Register
              </button>
            </p>
          </>
        )}

        {/* OTP FORM */}
        {step === "otp" && (
          <>
            <form onSubmit={handleOtpVerify} className="space-y-6">
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-3 text-white/70" size={20} />
                <input
                  type="text"
                  maxLength="6"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/60 tracking-widest text-center text-xl"
                />
              </div>

              <button
                type="submit"
                disabled={isOtpLoading}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-semibold text-white"
              >
                {isOtpLoading ? "Verifying..." : "Verify OTP"}
              </button>

              <p className="text-white/60 text-sm text-center">
                Didn’t get the code?{" "}
                <button
                  type="button"
                  className="text-purple-300 hover:text-white font-medium"
                  onClick={resendOtp}
                >
                  Resend OTP
                </button>
              </p>
            </form>
{/* 
            Register Link */}
            <p className="text-white/70 text-sm text-center mt-4">
              {/* Don’t have an account?{" "} */}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-purple-300 hover:text-white font-medium"
              >
                {/* Register */}
              </button>
            </p>
          </>
        )}

        {/* Already logged in */}
        {step === "loggedIn" && (
          <div className="text-center space-y-6">
            <p className="text-white">You are already logged in.</p>
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl font-semibold text-white"
            >
              Logout
            </button>
          </div>
        )}

        {/* Messages */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-3 rounded-lg text-center text-sm ${
              message.includes("✅")
                ? "bg-green-500/20 text-green-200"
                : message.includes("🔒")
                ? "bg-blue-500/20 text-blue-200"
                : "bg-red-500/20 text-red-200"
            }`}
          >
            {message}
          </motion.div>
        )}
      </motion.div>

      <ToastContainer />
    </div>
  );
}

export default Login;


