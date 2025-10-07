import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, User, Phone, Lock } from "lucide-react";
import api from "../axiosConfig";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    number: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value.trimStart() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setMessage("⚠️ Passwords do not match.");
      return;
    }
    try {
      await api.post("/Authentication/Register", form);
      setMessage("✅ Registration successful! Redirecting...");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "❌ Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      {/* Slow Floating Background Blobs */}
      <motion.div
        className="absolute top-20 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60"
        animate={{ y: [0, -50, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60"
        animate={{ y: [0, 50, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* Glassmorphic Card */}
      <motion.div
        className="relative z-10 w-[420px] bg-white/20 backdrop-blur-2xl border border-white/30 shadow-2xl rounded-2xl p-8"
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        {/* Title */}
        <motion.h2
          className="text-3xl font-bold text-center text-white mb-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1.2, ease: "easeInOut" }}
        >
          Create Account
        </motion.h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 1.2, ease: "easeInOut" }}
          >
            <User className="absolute left-3 top-3 text-gray-200" size={20} />
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full pl-10 p-3 rounded-xl bg-white/10 border border-white/40 placeholder-gray-200 text-white focus:ring-2 focus:ring-pink-400 outline-none"
            />
          </motion.div>

          {/* Email */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 1.2, ease: "easeInOut" }}
          >
            <Mail className="absolute left-3 top-3 text-gray-200" size={20} />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full pl-10 p-3 rounded-xl bg-white/10 border border-white/40 placeholder-gray-200 text-white focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          </motion.div>

          {/* Phone */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 1.2, ease: "easeInOut" }}
          >
            <Phone className="absolute left-3 top-3 text-gray-200" size={20} />
            <input
              type="tel"
              name="number"
              placeholder="Phone Number"
              pattern="[0-9]{10}"
              maxLength="10"
              value={form.number}
              onChange={handleChange}
              required
              className="w-full pl-10 p-3 rounded-xl bg-white/10 border border-white/40 placeholder-gray-200 text-white focus:ring-2 focus:ring-purple-400 outline-none"
            />
          </motion.div>

          {/* Password */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0, duration: 1.2, ease: "easeInOut" }}
          >
            <Lock className="absolute left-3 top-3 text-gray-200" size={20} />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full pl-10 p-3 rounded-xl bg-white/10 border border-white/40 placeholder-gray-200 text-white focus:ring-2 focus:ring-green-400 outline-none"
            />
          </motion.div>

          {/* Confirm Password */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 1.2, ease: "easeInOut" }}
          >
            <Lock className="absolute left-3 top-3 text-gray-200" size={20} />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full pl-10 p-3 rounded-xl bg-white/10 border border-white/40 placeholder-gray-200 text-white focus:ring-2 focus:ring-red-400 outline-none"
            />
          </motion.div>

          {/* Button */}
          <motion.button
            type="submit"
            className="relative w-full py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-xl font-semibold text-white shadow-lg overflow-hidden"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.5 }}
          >
            <span className="relative z-10">Register</span>
            <span className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition duration-700"></span>
          </motion.button>
        </form>

        {/* Message */}
        {message && (
          <motion.p
            className="mt-4 text-center text-sm font-medium text-yellow-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          >
            {message}
          </motion.p>
        )}

        {/* Login Redirect */}
        <p className="mt-6 text-center text-sm text-gray-200">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="cursor-pointer font-semibold text-pink-300 hover:text-pink-400"
          >
            Login
          </span>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;
