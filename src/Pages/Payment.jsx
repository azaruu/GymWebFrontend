import React, { useState } from "react";
import api from "../axiosConfig"; // Your axios instance

function RazorpayPayment() {
  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const payNow = async () => {
    if (!memberId || !amount) {
      setStatus("Please enter Member ID and Amount.");
      return;
    }

    try {
      // 1. Create order on backend
      const { data } = await api.post("/api/payments/create-order", {
        amount: parseFloat(amount) * 100, // Razorpay expects amount in paise
        memberId,
      });

      // 2. Setup Razorpay options
      const options = {
        key: "rzp_test_XXXXXX", // Replace with your test key
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "My Company",
        description: `Payment for Member ${memberId}`,
        handler: async function (response) {
          try {
            // 3. Verify payment on backend
            const verify = await api.post("/api/payments/verify", {
              orderId: data.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              memberId,
              amount,
            });
            setStatus(verify.data.statusMessage || "Payment successful!");
          } catch (err) {
            console.error(err);
            setStatus("Payment verification failed.");
          }
        },
        theme: {
          color: "#3399cc",
        },
      };

      // 4. Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setStatus("Failed to initiate payment.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          💳 Make a Payment
        </h2>

        <input
          type="number"
          placeholder="Enter Member ID"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          className="border border-gray-300 rounded-lg w-full p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="number"
          placeholder="Enter Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border border-gray-300 rounded-lg w-full p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={payNow}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg w-full"
        >
          Pay ₹{amount || 0}
        </button>

        {status && (
          <p className="mt-6 text-center text-sm font-semibold text-green-600">
            {status}
          </p>
        )}
      </div>
    </div>
  );
}

export default RazorpayPayment;
