import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import MemberManege from "./Pages/MemberManege";
import Workoutplan from "./Pages/Workoutplan";
import Contact from "./Pages/Contact";
import Attendance from "./Pages/Attendence";
import Payment from "./Pages/Payment";
import Product from "./Pages/Product";
import Cart from "./Pages/Cart";
// import Dashboard from "./Pages/Dashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Order from "./Pages/Order";
import Profile from "./Pages/Profile";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Home page */}
        <Route path="/" element={<Home />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/membermanage" element={<MemberManege/>}/>
        {/* Protected Dashboard
        <Route path="/dashboard" element={<Dashboard />} /> */}
        <Route path="/workoutplan" element={<Workoutplan/>}/>
        <Route path="/contact" element={<Contact/>}/>
        <Route path="/attendence" element={<Attendance/>}/>
        <Route path="/payment" element={<Payment/>}/>
        <Route path="/product" element={<Product/>}/>
         <Route path="/cart" element={<Cart/>}/>
         <Route path="/orders" element={<Order/>}/>
         <Route path="profile" element={<Profile/>}/>
        {/* Catch all unmatched routes */}
        <Route path="*" element={<Navigate to="/" />} />
       

      </Routes>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </Router>
    
  );
      

}

export default App;
