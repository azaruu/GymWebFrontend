import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../axiosConfig';

function MemberManage() {
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    contact: '',
    planId: ''
  });
  const [editingMember, setEditingMember] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Fetch all members on component mount
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/MemberManege/GetAllMemberDetails');
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      // Debug: Check for duplicate IDs
      console.log('Fetched Members:', data);
      const memberIds = data.map(m => m.memberId);
      const uniqueMemberIds = new Set(memberIds);
      if (memberIds.length !== uniqueMemberIds.size) {
        console.warn('Duplicate memberId values detected:', memberIds);
        setError('Duplicate member IDs detected. Please contact support.');
      }
      // Check workoutPlans and payments
      data.forEach(member => {
        if (Array.isArray(member.workoutPlans)) {
          const planIds = member.workoutPlans.map(p => p.planId);
          const uniquePlanIds = new Set(planIds);
          if (planIds.length !== uniquePlanIds.size) {
            console.warn(`Duplicate planId values for member ${member.memberId}:`, planIds);
            setError(`Duplicate plan IDs detected for member ${member.memberId}.`);
          }
        }
        if (Array.isArray(member.payments)) {
          const paymentIds = member.payments.map(p => p.id);
          const uniquePaymentIds = new Set(paymentIds);
          if (paymentIds.length !== uniquePaymentIds.size) {
            console.warn(`Duplicate payment id values for member ${member.memberId}:`, paymentIds);
            setError(`Duplicate payment IDs detected for member ${member.memberId}.`);
          }
        }
      });
      const sanitizedData = data.map(member => ({
        ...member,
        workoutPlans: Array.isArray(member.workoutPlans) ? member.workoutPlans : [],
        payments: Array.isArray(member.payments) ? member.payments : []
      }));
      setMembers(sanitizedData);
      setError('');
    } catch (err) {
      setError(err.response?.data?.statusMessage || 'Failed to fetch members: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (newMember.age < 12 || newMember.age > 60) {
      setError('Age must be between 12 and 60.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(newMember.email)) {
      setError('Invalid email format.');
      return;
    }
    try {
      setLoading(true);
      const response = await api.post('/MemberManege', newMember);
      setMembers([...members, {
        ...response.data.data,
        workoutPlans: Array.isArray(response.data.data.workoutPlans) ? response.data.data.workoutPlans : [],
        payments: Array.isArray(response.data.data.payments) ? response.data.data.payments : []
      }]);
      setNewMember({ name: '', email: '', age: '', gender: '', contact: '', planId: '' });
      setError('');
      setSuccess('Member added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.statusMessage || 'Failed to add member: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    if (editingMember.age < 12 || editingMember.age > 60) {
      setError('Age must be between 12 and 60.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(editingMember.email)) {
      setError('Invalid email format.');
      return;
    }
    try {
      setLoading(true);
      const response = await api.put(`/MemberManege/${editingMember.memberId}`, editingMember);
      setMembers(members.map(m => m.memberId === editingMember.memberId ? {
        ...response.data.data,
        workoutPlans: Array.isArray(response.data.data.workoutPlans) ? response.data.data.workoutPlans : [],
        payments: Array.isArray(response.data.data.payments) ? response.data.data.payments : []
      } : m));
      setEditingMember(null);
      setError('');
      setSuccess('Member updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.statusMessage || 'Failed to update member: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    
    try {
      setLoading(true);
      await api.delete(`/MemberManege/${id}`);
      setMembers(members.filter(m => m.memberId !== id));
      setError('');
      setSuccess('Member deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.statusMessage || 'Failed to delete member: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, isEditing = false) => {
    const { name, value } = e.target;
    if (isEditing) {
      setEditingMember({ ...editingMember, [name]: value });
    } else {
      setNewMember({ ...newMember, [name]: value });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    exit: { 
      scale: 0.9, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Member Management
        </h1>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm"
              role="alert"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Error:</span> {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow-sm"
              role="alert"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Success:</span> {success}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-700">Processing...</p>
            </motion.div>
          </div>
        )}

        {/* Add Member Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10 bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-indigo-800 mb-6 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Member
          </h2>
          <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { name: 'name', type: 'text', placeholder: 'Full Name', label: 'Name' },
              { name: 'email', type: 'email', placeholder: 'Email Address', label: 'Email' },
              { name: 'age', type: 'number', placeholder: 'Age', label: 'Age', min: 12, max: 60 },
              { name: 'gender', type: 'select', label: 'Gender' },
              { name: 'contact', type: 'tel', placeholder: 'Contact Number', label: 'Contact Number', pattern: '[0-9]{10}', title: 'Contact number must be 10 digits' },
              { name: 'planId', type: 'number', placeholder: 'Plan ID', label: 'Plan ID', min: 1 }
            ].map((field, index) => (
              <motion.div key={field.name} variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    name={field.name}
                    value={newMember[field.name]}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={newMember[field.name]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    required
                    min={field.min}
                    max={field.max}
                    pattern={field.pattern}
                    title={field.title}
                  />
                )}
              </motion.div>
            ))}
            <motion.div variants={itemVariants} className="md:col-span-2">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Member
              </motion.button>
            </motion.div>
          </form>
        </motion.div>

        {/* Members List */}
        <h2 className="text-2xl font-semibold text-indigo-900 mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Members List
        </h2>

        {members.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-8 rounded-2xl shadow-md text-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-600 text-lg">No members found. Add your first member above.</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {members.map(member => (
                <motion.div
                  key={member.memberId}
                  variants={cardVariants}
                  layout
                  exit="exit"
                  className="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-indigo-900">{member.name}</h3>
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      ID: {member.memberId}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-gray-700">
                    {[
                      { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', text: member.email },
                      { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', text: `${member.age} years` },
                      { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', text: member.gender },
                      { icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', text: member.contact },
                      { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', text: `Plan ID: ${member.planId}` }
                    ].map((item, index) => (
                      <div key={`member-detail-${member.memberId}-${index}`} className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Workout Plans */}
                  {Array.isArray(member.workoutPlans) && member.workoutPlans.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="font-medium text-indigo-800 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Workout Plans
                      </h4>
                      <div className="space-y-2">
                        {member.workoutPlans.map(plan => (
                          <div key={plan.PlanId} className="bg-indigo-50 p-2 rounded-md">
                            <p className="text-sm font-medium text-indigo-800">{plan.planName}</p>
                            <p className="text-xs text-indigo-600">{plan.description}</p>
                            <p className="text-xs text-indigo-500 mt-1">Duration: {plan.durationInDays} days</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payments */}
                  {Array.isArray(member.payments) && member.payments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="font-medium text-indigo-800 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Payments
                      </h4>
                      <div className="space-y-2">
                        {member.payments.map(payment => (
                          <div key={payment.id} className="bg-green-50 p-2 rounded-md">
                            <p className="text-sm font-medium text-green-800">${payment.amount}</p>
                            <p className="text-xs text-green-600">{new Date(payment.date).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditingMember(member)}
                      className="flex-1 bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg font-medium text-sm hover:bg-indigo-200 transition-colors duration-200 flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteMember(member.memberId)}
                      className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg font-medium text-sm hover:bg-red-200 transition-colors duration-200 flex items-center justify-center"
                      disabled={loading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Edit Member Modal */}
        <AnimatePresence>
          {editingMember && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setEditingMember(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-indigo-900">Edit Member</h2>
                  <button 
                    onClick={() => setEditingMember(null)}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleUpdateMember} className="space-y-4">
                  {[
                    { name: 'name', type: 'text', placeholder: 'Name', label: 'Name' },
                    { name: 'email', type: 'email', placeholder: 'Email', label: 'Email' },
                    { name: 'age', type: 'number', placeholder: 'Age', label: 'Age', min: 12, max: 60 },
                    { name: 'gender', type: 'select', label: 'Gender' },
                    { name: 'contact', type: 'tel', placeholder: 'Contact Number', label: 'Contact Number', pattern: '[0-9]{10}', title: 'Contact number must be 10 digits' },
                    { name: 'planId', type: 'number', placeholder: 'Plan ID', label: 'Plan ID', min: 1 }
                  ].map((field, index) => (
                    <div key={`edit-${field.name}`}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          name={field.name}
                          value={editingMember[field.name]}
                          onChange={(e) => handleInputChange(e, true)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          name={field.name}
                          value={editingMember[field.name]}
                          onChange={(e) => handleInputChange(e, true)}
                          placeholder={field.placeholder}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          required
                          min={field.min}
                          max={field.max}
                          pattern={field.pattern}
                          title={field.title}
                        />
                      )}
                    </div>
                  ))}
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-indigo-600 text-white p-3 rounded-lg font-medium shadow-md hover:bg-indigo-700 transition-all duration-200"
                      disabled={loading}
                    >
                      Update Member
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setEditingMember(null)}
                      className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-lg font-medium hover:bg-gray-400 transition-all duration-200"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default MemberManage;