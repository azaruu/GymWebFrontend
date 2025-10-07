import { useEffect, useState } from "react";
import api from "../axiosConfig";
import Cookies from "js-cookie";
import { Trash2, Plus, Minus, ShoppingCart, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [recentOrder, setRecentOrder] = useState(null);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [clearingCart, setClearingCart] = useState(false);

  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = Cookies.get("auth");
    if (!token) {
      navigate("/login");
      throw new Error("No authentication token found");
    }
    return { Authorization: `Bearer ${token}` };
  };

  // 🛒 Fetch cart
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get("/Cart", { headers: getAuthHeader() });
      setCartItems(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      if (err.response?.status === 401) {
        Cookies.remove("auth");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 🗑️ Remove single item
  const removeItem = async (productId) => {
    try {
      setUpdatingItems(prev => new Set(prev).add(productId));
      await api.delete(`/Cart/${productId}`, { headers: getAuthHeader() });
      setCartItems(prev => prev.filter(item => item.productId !== productId));
    } catch (err) {
      console.error("Failed to remove item:", err);
      alert("Failed to remove item. Please try again.");
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // ❌ Clear all
  const clearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;
    
    try {
      setClearingCart(true);
      await api.delete("/Cart/Clear", { headers: getAuthHeader() });
      setCartItems([]);
    } catch (err) {
      console.error("Failed to clear cart:", err);
      alert("Failed to clear cart. Please try again.");
    } finally {
      setClearingCart(false);
    }
  };

  // 🔄 Update quantity
  const updateQuantity = async (productId, delta) => {
    const item = cartItems.find((i) => i.productId === productId);
    if (!item) return;
    
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      removeItem(productId);
      return;
    }

    // Optimistic update
    setCartItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: newQty } : i
      )
    );

    try {
      setUpdatingItems(prev => new Set(prev).add(productId));
      await api.post(
        "/Cart/Add",
        { productId, quantity: delta },
        { headers: getAuthHeader() }
      );
    } catch (err) {
      console.error("Failed to update quantity:", err);
      // Revert optimistic update
      setCartItems((prev) =>
        prev.map((i) =>
          i.productId === productId ? { ...i, quantity: item.quantity } : i
        )
      );
      alert("Failed to update quantity. Please try again.");
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Razorpay loader
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ✅ Checkout
  const handleCheckout = async () => {
    const token = Cookies.get("auth");
    if (!token) {
      alert("Please login to continue");
      navigate("/login");
      return;
    }

    if (!cartItems.length) {
      alert("Your cart is empty");
      return;
    }

    try {
      setCheckingOut(true);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Razorpay SDK failed to load. Please try again.");
        return;
      }

      const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.productPrice * item.quantity,
        0
      );

      // Get user email from token or API
      const userEmail = "user@example.com"; // Replace with actual user email

      // FIX: Use direct Razorpay key instead of process.env
      const razorpayKey = "rzp_test_RLmEJcORL1IDDu"; // Your Razorpay test key

      const options = {
        key: razorpayKey, // Use the direct key
        amount: Math.round(totalPrice * 100), // Ensure integer
        currency: "INR",
        name: "GymApp Store",
        description: `Order for ${cartItems.length} item(s)`,
        handler: async function (response) {
          try {
            // 📦 Place order after payment success
            const orderResponse = await api.post(
              "/Order/PlaceOrder",
              {
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                signature: response.razorpay_signature
              },
              { headers: getAuthHeader() }
            );

            const orderData = orderResponse.data.data;
            setRecentOrder(orderData);
            setCartItems([]);

            alert(
              `✅ Payment Successful!\nOrder ID: ${orderData.orderId}\nAmount: ₹${orderData.totalAmount}`
            );
          } catch (err) {
            console.error("Order placement failed:", err);
            alert("Payment succeeded but order could not be saved. Please contact support.");
          }
        },
        prefill: {
          email: userEmail,
        },
        theme: { color: "#dc2626" },
        modal: {
          ondismiss: () => {
            console.log("Checkout cancelled by user");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        alert(`❌ Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Checkout failed: " + (err.response?.data?.message || err.message));
    } finally {
      setCheckingOut(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.productPrice,
    0
  );

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-10 p-6 bg-gray-900 rounded-xl text-white text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-gray-900 rounded-xl text-white">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="w-8 h-8 text-red-500" />
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        {cartItems.length > 0 && (
          <span className="bg-red-600 text-white px-2 py-1 rounded-full text-sm">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      {/* CART ITEMS */}
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-24 h-24 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-6">Your cart is empty</p>
          <button
            onClick={() => navigate("/product")}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => {
              const isUpdating = updatingItems.has(item.productId);
              return (
                <div
                  key={item.cartId}
                  className="flex justify-between items-center bg-gray-800 p-4 rounded-lg border border-gray-700"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{item.productName}</h3>
                    <p className="text-red-400 font-semibold">
                      {formatCurrency(item.productPrice)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-1">
                      <button 
                        onClick={() => updateQuantity(item.productId, -1)}
                        disabled={isUpdating}
                        className="p-1 hover:bg-gray-600 rounded disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <span className="min-w-8 text-center font-medium">
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : item.quantity}
                      </span>
                      
                      <button 
                        onClick={() => updateQuantity(item.productId, 1)}
                        disabled={isUpdating}
                        className="p-1 hover:bg-gray-600 rounded disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <p className="font-bold min-w-24 text-right">
                      {formatCurrency(item.quantity * item.productPrice)}
                    </p>

                    {/* Remove Button */}
                    <button 
                      onClick={() => removeItem(item.productId)}
                      disabled={isUpdating}
                      className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CART SUMMARY */}
          <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl">Total:</span>
              <span className="text-3xl font-bold text-green-400">
                {formatCurrency(totalPrice)}
              </span>
            </div>
            
            <div className="flex gap-4 justify-end">
              <button
                onClick={clearCart}
                disabled={clearingCart || checkingOut}
                className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
              >
                {clearingCart ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Clear Cart"
                )}
              </button>
              <button
                onClick={handleCheckout}
                disabled={checkingOut || cartItems.length === 0}
                className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg font-bold disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {checkingOut ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Checkout ${formatCurrency(totalPrice)}`
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* RECENT ORDER */}
      {recentOrder && (
        <div className="mt-10 bg-green-900/20 border border-green-700 p-6 rounded-xl">
          <h3 className="text-xl font-bold mb-4 text-green-400">
            ✅ Order Placed Successfully!
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p><strong>Order ID:</strong> #{recentOrder.orderId}</p>
              <p><strong>Date:</strong> {new Date(recentOrder.orderDate).toLocaleString()}</p>
              <p><strong>Total:</strong> {formatCurrency(recentOrder.totalAmount)}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Items:</h4>
              <ul className="space-y-1">
                {recentOrder.items.map((item) => (
                  <li key={item.productId} className="text-sm">
                    {item.productName} × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button
            onClick={() => navigate("/orders")}
            className="mt-4 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition-colors"
          >
            View All Orders
          </button>
        </div>
      )}
    </div>
  );
}

export default Cart;