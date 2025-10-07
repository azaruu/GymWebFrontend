import { useState, useEffect } from 'react';
import api from '../axiosConfig';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
 const navigate=useNavigate();
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/Authentication/profile`);
        setUser(response.data);
      } catch (err) {
        setError('Failed to fetch profile data');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <NotFoundMessage />;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Profile</h1>
          <p className="text-lg text-gray-600">Manage your personal information</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{user.fullName}</h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {user.role?.toLowerCase()}
                  </span>
                </div>
                <p className="text-gray-600 mb-6">{user.email}</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <InfoCard 
                    icon="📧"
                    label="Email"
                    value={user.email}
                  />
                  <InfoCard 
                    icon="📱"
                    label="Phone"
                    value={user.number || 'Not provided'}
                  />
                  <InfoCard 
                    icon="👤"
                    label="Full Name"
                    value={user.fullName}
                  />
                  <InfoCard 
                    icon="🎯"
                    label="Role"
                    value={user.role?.toLowerCase()}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <div className="flex justify-end">
              <button onClick={()=>navigate("/orders")} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700  focus:ring-blue-500">
                  Your Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-96">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading profile...</p>
    </div>
  </div>
);

const ErrorMessage = ({ error }) => (
  <div className="flex justify-center items-center min-h-96">
    <div className="text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">⚠️</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
      <p className="text-gray-600">{error}</p>
    </div>
  </div>
);

const NotFoundMessage = () => (
  <div className="flex justify-center items-center min-h-96">
    <div className="text-center">
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">🔍</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">User Not Found</h3>
      <p className="text-gray-600">The requested profile could not be found.</p>
    </div>
  </div>
);

const InfoCard = ({ icon, label, value }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex items-center space-x-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default Profile;