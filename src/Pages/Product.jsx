import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from "../axiosConfig";
import { Dumbbell, Pencil, Trash2, X, Plus, Search, Filter, ShoppingCart, ChevronDown, Star, Upload } from "lucide-react";
import Navbar from "./Navbar";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";



function Product() {
  const [products, setProducts] = useState([]);
  const [addingToCart, setAddingToCart] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [form, setForm] = useState({
    productID: null,
    productName: "",
    productPrice: "",
    brand: "",
    imageFile: null,
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("Newest");
   const navigate = useNavigate();
  // Decode JWT and get role
  useEffect(() => {
    const token = Cookies.get("auth");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("JWT decoded claims:", decoded);
        
        // Extract user ID and role properly
        const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        const userRole = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        
        console.log("User ID from token:", userId);
        console.log("User Role from token:", userRole);
        
        setRole(userRole?.toLowerCase() || "");
      } catch (err) {
        console.error("Failed to decode JWT:", err);
      }
    } else {
      console.log("No JWT token found in cookies");
    }
  }, []);

  const hasAccess = role === "trainer" || role === "admin";


  // Fetch products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/Product");
      const productsWithStock = res.data.data.map(product => ({
        ...product,
        inStock: true,
        rating: Math.floor(Math.random() * 2) + 4,
        reviews: Math.floor(Math.random() * 50) + 10
      }));
      setProducts(productsWithStock);
      setFilteredProducts(productsWithStock);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Enhanced search and filter
  useEffect(() => {
    let filtered = products.filter(
      (p) =>
        p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(p => 
        p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "Price: Low to High":
          return a.productPrice - b.productPrice;
        case "Price: High to Low":
          return b.productPrice - a.productPrice;
        case "Name: A-Z":
          return a.productName.localeCompare(b.productName);
        case "Newest":
        default:
          return b.productID - a.productID;
      }
    });

    setFilteredProducts(filtered);
  }, [searchQuery, products, selectedCategory, sortBy]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imageFile") {
      setForm({ ...form, imageFile: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasAccess) {
      alert("You do not have permission to add or edit products.");
      return;
    }

    const formData = new FormData();
    formData.append("ProductName", form.productName);
    formData.append("ProductPrice", form.productPrice);
    formData.append("Brand", form.brand);
    if (form.imageFile) formData.append("ImageFile", form.imageFile);

    try {
      if (form.productID) {
        await api.put(`/Product/${form.productID}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/Product", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setForm({ productID: null, productName: "", productPrice: "", brand: "", imageFile: null });
      setIsSidebarOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Error saving product. Please try again.");
    }
  };

  const handleEdit = (p) => {
    if (!hasAccess) {
      alert("You do not have permission to edit products.");
      return;
    }
    setForm({
      productID: p.productID,
      productName: p.productName,
      productPrice: p.productPrice,
      brand: p.brand,
      imageFile: null,
    });
    setIsSidebarOpen(true);
  };

  const handleDelete = async (id) => {
    if (!hasAccess) {
      alert("You do not have permission to delete products.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/Product/${id}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Error deleting product. Please try again.");
    }
  };

   const handleAddToCart = async (product) => {
    if (!product.inStock || addingToCart.includes(product.productID)) return;

    try {
      setAddingToCart((prev) => [...prev, product.productID]);

      const token = Cookies.get("auth");
      if (!token) {
        alert("You must be logged in to add to cart.");
        navigate("/login"); // ADD NAVIGATION
        return;
      }

      // Debug: Check token validity
      console.log("JWT Token:", token);
      
      const payload = {
        productId: product.productID,
        quantity: 1,
      };

      console.log("Sending add to cart payload:", payload);

      const response = await api.post("/Cart/Add", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Add to cart response:", response.data);
      showNotification(`Added "${product.productName}" to cart!`);
    } catch (err) {
      console.error("Add to cart failed:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        Cookies.remove("auth");
        navigate("/login"); // ADD NAVIGATION
      } else {
        alert("Failed to add to cart: " + (err.response?.data?.statusMessage || "Please try again."));
      }
    } finally {
      setAddingToCart((prev) => prev.filter((id) => id !== product.productID));
    }
  };



  const showNotification = (message) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 transform translate-x-0 opacity-100 transition-all duration-300';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  const openSidebar = () => {
    if (!hasAccess) {
      alert("You do not have permission to add products.");
      return;
    }
    setForm({ productID: null, productName: "", productPrice: "", brand: "", imageFile: null });
    setIsSidebarOpen(true);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSortBy('Newest');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      {/* Page content */}
      <div className="pt-24"> {/* adjust padding-top based on navbar height */}
        {/* Header & Stats */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                Gym Gear Inventory
              </h1>
              <p className="text-gray-600 text-sm md:text-base max-w-2xl">
                Manage your fitness equipment with real-time inventory tracking and smart analytics
              </p>
            </div>

            <div className="flex gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">{filteredProducts.length}</div>
                <div className="text-xs text-gray-500">Total Items</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-green-600">
                  {filteredProducts.filter(p => p.inStock).length}
                </div>
                <div className="text-xs text-gray-500">In Stock</div>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by product name, brand, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-0 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <div className="flex gap-3 flex-wrap">
                {/* <div className="relative">
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-4 pr-10 py-3 rounded-xl border-0 bg-gray-50 focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option>All Categories</option>
                    <option>Strength</option>
                    <option>Cardio</option>
                    <option>Accessories</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div> */}
                
                <div className="relative">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-4 pr-10 py-3 rounded-xl border-0 bg-gray-50 focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option>Sort by: Newest</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Name: A-Z</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>

                {hasAccess && (
                  <button
                    onClick={openSidebar}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg shadow-blue-500/25"
                  >
                    <Plus size={20} /> Add Product
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters */}
            <div className="flex gap-2 mt-4 flex-wrap">
              {searchQuery && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-blue-900">
                    <X size={14} />
                  </button>
                </span>
              )}
              {selectedCategory !== "All Categories" && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory("All Categories")} className="hover:text-green-900">
                    <X size={14} />
                  </button>
                </span>
              )}
              {sortBy !== "Newest" && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  Sort: {sortBy.replace("Sort by: ", "")}
                  <button onClick={() => setSortBy("Newest")} className="hover:text-purple-900">
                    <X size={14} />
                  </button>
                </span>
              )}
              {(searchQuery || selectedCategory !== "All Categories" || sortBy !== "Newest") && (
                <button 
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/50 rounded-2xl p-4 animate-pulse">
                <div className="bg-gray-200 rounded-xl h-48 mb-4"></div>
                <div className="bg-gray-200 rounded h-4 mb-2"></div>
                <div className="bg-gray-200 rounded h-3 w-2/3 mb-4"></div>
                <div className="bg-gray-200 rounded h-10"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
              <button 
                onClick={clearAllFilters}
                className="px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition"
              >
                Clear filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.productID}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {product.imageFile ? (
                    <img
                      src={`https://localhost:7128/${product.imageFile}`}
                      alt={product.productName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Dumbbell size={48} className="text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    ₹{product.productPrice}
                  </div>
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
                    product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </div>

                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                        title="Add to cart"
                      >
                        <ShoppingCart size={18} className="text-gray-700" />
                      </button>
                      {hasAccess && (
                        <>
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                            title="Edit product"
                          >
                            <Pencil size={18} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.productID)}
                            className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                            title="Delete product"
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate mb-1">{product.productName}</h3>
                  <p className="text-gray-600 text-sm truncate mb-3">{product.brand}</p>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          fill={i < (product.rating || 4) ? "currentColor" : "none"} 
                          strokeWidth={0}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">({product.reviews || 12})</span>
                  </div>

                 <button
  onClick={() => handleAddToCart(product)}
  disabled={!product.inStock || addingToCart.includes(product.productID)}
  className="w-full py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2"
>
  <ShoppingCart size={16} />
  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sidebar */}
        {hasAccess && (
          <>
            <div
              className={`fixed top-0 right-0 h-full w-full max-w-md bg-gradient-to-b from-white to-gray-50 p-6 transform transition-transform duration-300 shadow-2xl z-50 overflow-y-auto ${
                isSidebarOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {form.productID ? "Edit Product" : "Add New Product"}
                  </h2>
                  <p className="text-gray-600 text-sm">Fill in the product details below</p>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    name="productName"
                    value={form.productName}
                    onChange={handleChange}
                    placeholder="e.g., Professional Dumbbell Set"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={form.brand}
                      onChange={handleChange}
                      placeholder="Brand name"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                    <input
                      type="number"
                      name="productPrice"
                      value={form.productPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      name="imageFile"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                      id="imageUpload"
                    />
                    <label htmlFor="imageUpload" className="cursor-pointer">
                      <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-gray-600">Click to upload product image</p>
                      <p className="text-gray-400 text-sm">PNG, JPG up to 10MB</p>
                    </label>
                  </div>
                  {form.imageFile && (
                    <p className="text-sm text-green-600 mt-2">Selected: {form.imageFile.name}</p>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold"
                  >
                    {form.productID ? "Update Product" : "Add Product"}
                  </button>
                </div>
              </form>
            </div>

            {isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
                onClick={() => setIsSidebarOpen(false)}
              ></div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Product;
