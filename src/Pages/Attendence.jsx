import React, { useState, useEffect } from "react";
import api from "../axiosConfig";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ClipboardList, UserCheck, X } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

function Attendance() {
  const [formData, setFormData] = useState({
    memberId: "",
    date: "",
    status: "Present",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [attendanceList, setAttendanceList] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    memberId: "",
    date: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [role , setRole ] = useState();


    useEffect(() => {
    // Check user role on component mount
    const token = Cookies.get("auth");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userRole = 
          decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
          decoded.role;
        
        setRole(userRole?.toLowerCase());
      } catch (err) {
        console.error("JWT Decode Error:", err);
      }
    }
  }, []);
  // map numeric status to readable string
  const statusMap = {
    0: "Absent",
    1: "Present",
    2: "Excused",
    3: "Leave",
  };

  // Clear message after 3s
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // 📌 Mark Attendance
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/Attendace", {
        memberId: parseInt(formData.memberId),
        dateTime: formData.date,
        status: formData.status, // ✅ fixed key
      });
      setMessage({ text: "Attendance marked successfully!", type: "success" });
      setFormData({ memberId: "", date: "", status: "Present" });
      getAllAttendance();
    } catch (error) {
      console.error("Attendance error:", error);
      setMessage({
        text:
          error.response?.data?.message ||
          "Attendance already marked or error occurred.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 📌 Get All Attendance
  const getAllAttendance = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/Attendace");
      setAttendanceList(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage({
        text: "Failed to fetch attendance records",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 📌 Get Attendance by Member
const getMemberAttendance = async () => {
  if (!searchFilters.memberId && !searchFilters.date) {
    setMessage({ text: "Please enter Member ID or Date to search.", type: "warning" });
    return;
  }

  setIsLoading(true);
  try {
    // Fetch all attendance records first
    const res = await api.get("/Attendace");
    let filtered = res.data;

    // Filter by Member ID if provided
    if (searchFilters.memberId) {
      filtered = filtered.filter(
        (a) => a.memberId.toString() === searchFilters.memberId.toString()
      );
    }

    // Filter by Date if provided
    if (searchFilters.date) {
      filtered = filtered.filter(
        (a) =>
          a.dateTime &&
          new Date(a.dateTime).toLocaleDateString("en-CA") ===
            new Date(searchFilters.date).toLocaleDateString("en-CA")
      );
    }

    setAttendanceList(filtered);
    setMessage({ text: "", type: "" });
  } catch (error) {
    console.error("Search error:", error);
    setMessage({
      text: error.response?.data?.message || "Could not fetch attendance.",
      type: "error",
    });
  } finally {
    setIsLoading(false);
  }
};

  // Clear filters
  const clearSearch = () => {
    setSearchFilters({ memberId: "", date: "" });
    getAllAttendance();
  };

  // Load all on page load
  useEffect(() => {
    getAllAttendance();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-10">
      <motion.h1
        className="text-3xl md:text-4xl font-bold mb-8 md:mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Attendance Management
      </motion.h1>

      {/* Message */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-lg text-center ${
              message.type === "success"
                ? "bg-green-900/50 border border-green-600"
                : message.type === "error"
                ? "bg-red-900/50 border border-red-600"
                : "bg-yellow-900/50 border border-yellow-600"
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📌 Mark Attendance */}
      {(role === "admin" || role === "trainer" ) && (
      <motion.div
        className="bg-gray-800/80 rounded-2xl p-4 md:p-6 shadow-lg mb-8 md:mb-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl md:text-2xl font-semibold flex items-center mb-4">
          <UserCheck className="mr-2 text-green-400" /> Mark Attendance
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label className="block text-sm mb-1 text-gray-300">Member ID</label>
            <input
              name="memberId"
              type="number"
              placeholder="Member ID"
              value={formData.memberId}
              onChange={handleInputChange}
              required
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-300">Date</label>
            <input
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-300">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Present">Present</option>
              <option value="Excused">Excused</option>
              <option value="Leave">Leave</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-orange-500 to-pink-600 py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-orange-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Submit"}
          </button>
        </form>
      </motion.div>
      )}
      {/* 🔍 Search */}
      <motion.div
        className="bg-gray-800/80 rounded-2xl p-4 md:p-6 shadow-lg mb-8 md:mb-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl md:text-2xl font-semibold flex items-center mb-4">
          <Search className="mr-2 text-blue-400" /> Search Attendance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm mb-1 text-gray-300">Member ID</label>
            <input
              name="memberId"
              type="number"
              placeholder="Enter Member ID"
              value={searchFilters.memberId}
              onChange={handleFilterChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-300">Date (Optional)</label>
            <input
              name="date"
              type="date"
              value={searchFilters.date}
              onChange={handleFilterChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={getMemberAttendance}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 px-4 rounded-lg font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Searching..." : "Search"}
            </button>

            <button
              onClick={getAllAttendance}
              disabled={isLoading}
              className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 px-4 rounded-lg font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Show All
            </button>
            <button
              onClick={clearSearch}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg shadow"
              title="Clear filters"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </motion.div>
     
      {/* 📋 Records */}
      <motion.div
        className="bg-gray-800/80 rounded-2xl p-4 md:p-6 shadow-lg overflow-x-auto"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-semibold flex items-center mb-2 md:mb-0">
            <ClipboardList className="mr-2 text-purple-400" /> Attendance Records
          </h2>
          <div className="text-sm text-gray-400">
            {attendanceList.length} record
            {attendanceList.length !== 1 ? "s" : ""} found
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-700 text-left">
                  <th className="p-3">Member ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceList.length > 0 ? (
                  attendanceList.map((a, index) => {
                    const displayStatus = statusMap[a.status] || a.status;
                    return (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-700 transition border-b border-gray-700"
                      >
                        <td className="p-3">{a.memberId}</td>
                        <td className="p-3">{a.name}</td>
                        <td className="p-3">
                          {a.dateTime
                            ? new Date(a.dateTime).toLocaleDateString("en-GB")
                            : ""}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              displayStatus === "Present"
                                ? "bg-green-900/30 text-green-400"
                                : displayStatus === "Excused"
                                ? "bg-yellow-900/30 text-yellow-400"
                                : displayStatus === "Leave"
                                ? "bg-blue-900/30 text-blue-400"
                                : "bg-red-900/30 text-red-400"
                            }`}
                          >
                            {displayStatus}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-gray-400">
                      No attendance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Attendance;
