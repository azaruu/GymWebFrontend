// Navbar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Dumbbell, User, LogOut, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";

function Navbar() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Decode JWT and set token & role
  useEffect(() => {
    const storedToken = Cookies.get("auth");
    if (storedToken) {
      setToken(storedToken);
      try {
        const decoded = jwtDecode(storedToken);
        const userRole =
          decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
          decoded.role;
        setRole(userRole?.toLowerCase());
      } catch (err) {
        console.error("JWT Decode Error:", err);
      }
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("auth");
    setToken(null);
    navigate("/login");
    setIsMenuOpen(false);
  };

  const getRoleFromToken = () => {
    const storedToken = Cookies.get("auth");
    if (!storedToken) return null;
    try {
      const decoded = jwtDecode(storedToken);
      return (
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        decoded.role
      )?.toLowerCase();
    } catch {
      return null;
    }
  };

  const handleProtectedClick = (path, pageName) => {
    const currentRole = getRoleFromToken();
    if (!currentRole || (currentRole !== "admin" && currentRole !== "trainer"&& currentRole !== "member" )) {
      alert(`Access denied. ${currentRole || "Guest"} cannot access ${pageName}.`);
      return;
    }
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-[#0F172A] text-white shadow-lg fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Dumbbell className="text-yellow-400" size={28} />
            <span className="text-xl font-bold">FITNESS HUB</span>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="hover:text-yellow-400 transition-colors">Home</a>

            {(role === "admin" || role === "trainer" ) && (
              
                <button
                  onClick={() => handleProtectedClick("/payment", "Payment")}
                  className="hover:text-yellow-400 transition-colors"
                >
                  Payment
                </button>
                )}

                {(role === "admin" || role === "trainer"||role==="member" ) && (
                <button
                   onClick={() => handleProtectedClick("/workoutplan", "Classes")}
                  className="hover:text-yellow-400 transition-colors"
                >
                  Classes
                </button>
              )}
               

            <button
              onClick={() => navigate("/product")}
              className="hover:text-yellow-400 transition-colors"
            >
              Product
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="hover:text-yellow-400 transition-colors"
            >
              Cart
            </button>


            <a href="#trainers" className="hover:text-yellow-400 transition-colors">Trainers</a>
            <button
              onClick={() => navigate("/contact")}
              className="hover:text-yellow-400 transition-colors"
            >
              Contact
            </button>

            {token ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-lg transition-colors"
                >
                  <User size={18} className="mr-2" />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
                >
                  <LogOut size={18} className="mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate("/login")}
                  className="bg-transparent border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-[#0F172A] px-4 py-2 rounded-lg transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-lg transition-colors"
                >
                  Join Now
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4"
          >
            <div className="flex flex-col space-y-4">
              <a
                href="#home"
                onClick={() => setIsMenuOpen(false)}
                className="hover:text-yellow-400 transition-colors py-2"
              >
                Home
              </a>

              {(role === "admin" || role === "trainer") && (
                <>
                  <button
                    onClick={() => handleProtectedClick("/payment", "Payment")}
                    className="hover:text-yellow-400 transition-colors py-2"
                  >
                    Payment
                  </button>
                  <button
                    onClick={() => handleProtectedClick("/workoutplan", "Classes")}
                    className="hover:text-yellow-400 transition-colors py-2"
                  >
                    Classes
                  </button>
                </>
              )}

              <button
                onClick={() => { navigate("/product"); setIsMenuOpen(false); }}
                className="hover:text-yellow-400 transition-colors py-2"
              >
                Product
              </button>
              <button
                onClick={() => { navigate("/cart"); setIsMenuOpen(false); }}
                className="hover:text-yellow-400 transition-colors py-2"
              >
                Cart
              </button>
              <a
                href="#trainers"
                onClick={() => setIsMenuOpen(false)}
                className="hover:text-yellow-400 transition-colors py-2"
              >
                Trainers
              </a>
              <button
                onClick={() => { navigate("/contact"); setIsMenuOpen(false); }}
                className="hover:text-yellow-400 transition-colors py-2"
              >
                Contact
              </button>

              {token ? (
                <div className="flex flex-col space-y-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => { navigate("/profile"); setIsMenuOpen(false); }}
                    className="flex items-center bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-lg w-full"
                  >
                    <User size={18} className="mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg w-full"
                  >
                    <LogOut size={18} className="mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => { navigate("/login"); setIsMenuOpen(false); }}
                    className="bg-transparent border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-[#0F172A] px-4 py-2 rounded-lg w-full"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { navigate("/register"); setIsMenuOpen(false); }}
                    className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-lg w-full"
                  >
                    Join Now
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
