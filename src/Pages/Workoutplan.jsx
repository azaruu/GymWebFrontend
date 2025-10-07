import { useEffect, useState } from "react";
import api from "../axiosConfig";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  Activity,
  X,
  Save,
  AlertCircle,
  Dumbbell,
  Search,
  Filter,
  ChevronDown,
  Users,
  Info,
  
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";


function Workoutplan() {
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [formData, setFormData] = useState({
    planName: "",
    description: "",
    durationInDays: "",
    planeDetails: ""
  });
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [role,setRole] =useState();

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


  // ✅ Fetch all plans
  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/WorkOutPlan");
      setPlans(res.data);
      setFilteredPlans(res.data);
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError("Failed to load workout plans");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Filter and sort plans
  useEffect(() => {
    let result = plans;
    
    // Search filter
    if (searchTerm) {
      result = result.filter(plan => 
        plan.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sorting
    if (sortOption === "newest") {
      result = [...result].sort((a, b) => b.planId - a.planId);
    } else if (sortOption === "oldest") {
      result = [...result].sort((a, b) => a.planId - b.planId);
    } else if (sortOption === "name") {
      result = [...result].sort((a, b) => a.planName.localeCompare(b.planName));
    } else if (sortOption === "duration") {
      result = [...result].sort((a, b) => b.durationInDays - a.durationInDays);
    }
    
    setFilteredPlans(result);
  }, [plans, searchTerm, sortOption]);

  // ✅ Handle form input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Add or Update plan
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setIsLoading(true);
      if (editId) {
        await api.patch(`/WorkOutPlan?id=${editId}`, formData);
      } else {
        await api.post("/WorkOutPlan", formData);
      }
      setIsModalOpen(false);
      setFormData({ planName: "", description: "", durationInDays: "", planeDetails: "" });
      setEditId(null);
      fetchPlans();
    } catch (err) {
      console.error("Error saving plan:", err);
      setError("Failed to save workout plan");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Delete plan
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workout plan?")) return;
    
    try {
      await api.delete(`/WorkOutPlan?id=${id}`);
      fetchPlans();
    } catch (err) {
      console.error("Error deleting plan:", err);
      setError("Failed to delete workout plan");
    }
  };

  // ✅ Edit plan (load values into form)
  const handleEdit = (plan) => {
    setFormData({
      planName: plan.planName,
      description: plan.description,
      durationInDays: plan.durationInDays,
      planeDetails: plan.planeDetails,
    });
    setEditId(plan.planId);
    setIsModalOpen(true);
  };

  // ✅ Show plan details
  const handleShowDetails = (plan) => {
    setSelectedPlan(plan);
    setIsDetailsModalOpen(true);
  };

  // ✅ Reset form and close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ planName: "", description: "", durationInDays: "", planeDetails: "" });
    setEditId(null);
    setError("");
  };

  // ✅ Close details modal
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedPlan(null);
  };

  // Get random color for card accent
  const getRandomColor = () => {
    const colors = [
      'bg-gradient-to-r from-blue-500 to-cyan-500',
      'bg-gradient-to-r from-purple-500 to-pink-500',
      'bg-gradient-to-r from-orange-500 to-red-500',
      'bg-gradient-to-r from-green-500 to-emerald-500',
      'bg-gradient-to-r from-indigo-500 to-blue-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <Dumbbell className="text-white" size={28} />
              </div>
              Workout Plans
            </h1>
            <p className="text-gray-600 mt-2">Create and manage fitness programs for your members</p>
          </div>
          {(role === "admin" || role === "trainer" ) && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            New Plan
          </motion.button>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Plans</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{plans.length}</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Dumbbell className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Duration</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {plans.length ? Math.round(plans.reduce((acc, plan) => acc + parseInt(plan.durationInDays), 0) / plans.length) : 0} days
                </h3>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl">
                <Clock className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Members</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">142</h3>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <Users className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <select 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none bg-white pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">By Name</option>
                  <option value="duration">By Duration</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
              
              <button className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                <Filter size={18} />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}

        {/* Plans Grid */}
        {isLoading && !plans.length ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredPlans.map((plan) => (
                <motion.div
                  key={plan.planId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className={`h-2 ${getRandomColor()}`}></div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">{plan.planName}</h3>
                      <span className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                        {plan.durationInDays} days
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{plan.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Clock size={16} className="mr-2" />
                      <span>Duration: {plan.durationInDays} days</span>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Plan Details:</h4>
                      <p className="text-gray-600 text-sm line-clamp-2">{plan.planeDetails}</p>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleShowDetails(plan)}
                        className="text-gray-600 hover:text-blue-600 font-medium py-2 px-3 rounded-lg flex items-center gap-1 transition-colors hover:bg-gray-100"
                      >
                        <Info size={16} />
                        Details
                      </motion.button>
                    {(role === "admin" || role === "trainer" ) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(plan)}
                        className="text-gray-600 hover:text-gray-800 font-medium py-2 px-3 rounded-lg flex items-center gap-1 transition-colors hover:bg-gray-100"
                      >
                        <Edit size={16} />
                        Edit
                      </motion.button>
                    )}
                      {(role === "admin" || role === "trainer" ) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(plan.planId)}
                        className="text-gray-600 hover:text-red-600 font-medium py-2 px-3 rounded-lg flex items-center gap-1 transition-colors hover:bg-gray-100"
                      >
                        <Trash2 size={16} />
                        Delete
                      </motion.button>
                      )}                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100"
          >
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Activity className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workout plans found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "Try adjusting your search query" : "Get started by creating your first workout plan"}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-all"
            >
              <Plus size={20} />
              Create Plan
            </button>
          </motion.div>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => handleCloseModal()}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editId ? "Edit Workout Plan" : "Create New Plan"}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      name="planName"
                      value={formData.planName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="e.g., Beginner Strength Program"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Describe the purpose and goals of this plan"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (days)
                    </label>
                    <input
                      type="number"
                      name="durationInDays"
                      value={formData.durationInDays}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="e.g., 30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan Details
                    </label>
                    <textarea
                      name="planeDetails"
                      value={formData.planeDetails}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Include exercises, sets, reps, and schedule"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-2 px-5 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          {editId ? "Update Plan" : "Create Plan"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Details Modal */}
        <AnimatePresence>
          {isDetailsModalOpen && selectedPlan && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => handleCloseDetailsModal()}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Workout Plan Details
                  </h2>
                  <button
                    onClick={handleCloseDetailsModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{selectedPlan.planName}</h1>
                      <p className="text-gray-600 mt-1">{selectedPlan.description}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                      {selectedPlan.durationInDays} days
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Plan Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-700">
                          <Clock size={18} className="mr-2" />
                          <span>Duration: {selectedPlan.durationInDays} days</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Calendar size={18} className="mr-2" />
                          <span>Created: {new Date().toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Plan Summary</h3>
                      <p className="text-gray-700">
                        This {selectedPlan.durationInDays}-day program is designed to help you achieve your fitness goals with a structured approach.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Full Plan Details</h3>
                    <div className="bg-gray-50 p-4 rounded-xl whitespace-pre-line">
                      {selectedPlan.planeDetails}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleCloseDetailsModal}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-2 px-5 rounded-xl transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Workoutplan; 