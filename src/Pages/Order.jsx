import { useEffect, useState } from "react";
import api from "../axiosConfig";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { RefreshCw, ShoppingBag, Calendar, Package } from "lucide-react";

function Order() {
  const [orders, setOrders] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = Cookies.get("auth");
    if (!token) {
      navigate("/login");
      throw new Error("No authentication token found");
    }
    return { Authorization: `Bearer ${token}` };
  };

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const res = await api.get("/Order/MyOrders", {
        headers: getAuthHeader(),
      });
      setOrders(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      if (err.response?.status === 401) {
        Cookies.remove("auth");
        navigate("/login");
        return;
      }
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOrderStatus = (order) => {
    // You can customize this based on your API response
    return order.status || "Completed";
  };

  const getStatusColor = (status) => {
    const statusColors = {
      "Pending": "bg-yellow-500 text-yellow-900",
      "Processing": "bg-blue-500 text-blue-900",
      "Shipped": "bg-purple-500 text-purple-900",
      "Delivered": "bg-green-500 text-green-900",
      "Completed": "bg-green-500 text-green-900",
      "Cancelled": "bg-red-500 text-red-900",
      "Refunded": "bg-gray-500 text-gray-900",
    };
    return statusColors[status] || "bg-gray-500 text-gray-900";
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      "Pending": "⏳",
      "Processing": "🔄",
      "Shipped": "🚚",
      "Delivered": "✅",
      "Completed": "✅",
      "Cancelled": "❌",
      "Refunded": "💸",
    };
    return statusIcons[status] || "📦";
  };

  const displayedOrders = showAll ? orders : orders.slice(0, 1);
  const hasMultipleOrders = orders.length > 1;

  // Sort orders by date (newest first)
  const sortedOrders = [...displayedOrders].sort((a, b) => 
    new Date(b.orderDate) - new Date(a.orderDate)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto mt-10 text-white px-4">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingBag className="w-8 h-8 text-blue-500" />
            <h2 className="text-3xl font-bold">My Orders</h2>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div><Navbar /></div>
        
        <div className="max-w-4xl mx-auto mt-10 text-white px-4">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingBag className="w-8 h-8 text-blue-500" />
            <h2 className="text-3xl font-bold">My Orders</h2>
          </div>
          <div className="bg-red-900/20 border border-red-500 p-6 rounded-xl">
            <div className="text-center">
              <p className="text-red-200 text-lg mb-4">{error}</p>
              <button
                onClick={() => fetchOrders()}
                className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
        <main className="flex-1 max-w-4xl mx-auto mt-20 px-4 pb-10">

      <div className="max-w-4xl mx-auto mt-10 text-white px-4 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-blue-500" />
            <h2 className="text-3xl font-bold">My Orders</h2>
            {orders.length > 0 && (
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </span>
            )}
          </div>
          
          {orders.length > 0 && (
            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
        </div>
               
        {sortedOrders.length === 0 ? (
          <div className="bg-gray-800 p-12 rounded-xl text-center border border-gray-700">
            <Package className="w-24 h-24 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl mb-2">No orders yet</p>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
            <button
              onClick={() => navigate("/product")}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg transition-colors font-semibold"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {sortedOrders.map((order) => (
                <div 
                  key={order.orderId} 
                  className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">
                          Order #{order.orderId}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(getOrderStatus(order))}`}>
                          <span>{getStatusIcon(getOrderStatus(order))}</span>
                          {getOrderStatus(order)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        {formatDate(order.orderDate)}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="font-semibold mb-3 text-lg">Order Items</h4>
                    <ul className="space-y-3">
                      {order.items.map((item, index) => (
                        <li 
                          key={`${item.productId}-${index}`}
                          className="flex justify-between items-center py-3 border-b border-gray-700 last:border-b-0"
                        >
                          <div className="flex-1">
                            <span className="font-medium text-white">{item.productName}</span>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                              <span>Qty: {item.quantity}</span>
                              <span>Price: {formatCurrency(item.unitPrice)}</span>
                            </div>
                          </div>
                          <span className="text-green-400 font-semibold text-lg">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {order.shippingAddress && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h4 className="font-semibold mb-2">Shipping Address:</h4>
                      <p className="text-gray-400 text-sm">
                        {order.shippingAddress}
                      </p>
                    </div>
                  )}

                  {order.paymentMethod && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h4 className="font-semibold mb-2">Payment Method:</h4>
                      <p className="text-gray-400 text-sm">
                        {order.paymentMethod}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {hasMultipleOrders && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg transition-colors font-semibold"
                >
                  {showAll ? "Show Recent Order Only" : `View All Orders (${orders.length})`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
       </main>
    </div>
  );
}

export default Order;