'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { useState, useEffect } from 'react';
import { getUserProfile, getAllVeterinarians } from '@/lib/firestore';
import { User as UserType, Veterinarian } from '@/lib/types';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserType | null>(null);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserData(profile);

          // Fetch veterinarians to show on the dashboard
          const vets = await getAllVeterinarians();
          setVeterinarians(vets.slice(0, 3)); // Show first 3 vets
        } catch (error) {
          console.error('Error fetching user data or veterinarians:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900"> Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Welcome, {userData?.name || user?.email}!</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-blue-800">Your Profile</h3>
                    <p className="mt-2 text-blue-600">Manage your personal information and preferences.</p>
                    <a href="/profile" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block">
                      View Profile
                    </a>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-green-800">Book Appointment</h3>
                    <p className="mt-2 text-green-600">Schedule a consultation with a veterinarian.</p>
                    <a href="/appointments/new" className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 inline-block">
                      Book Now
                    </a>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-purple-800">Find Vets</h3>
                    <p className="mt-2 text-purple-600">Browse and connect with veterinarians in your area.</p>
                    <a href="/veterinarians" className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 inline-block">
                      Find Vets
                    </a>
                  </div>
                </div>
                
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Recommended Veterinarians</h3>
                    <a href="/veterinarians" className="text-blue-600 hover:text-blue-800 font-medium">
                      View All
                    </a>
                  </div>

                  {veterinarians.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {veterinarians.map((vet) => (
                        <div key={vet.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                            <div className="ml-4">
                              <h4 className="font-medium text-gray-900">Dr. {vet.name}</h4>
                              <p className="text-sm text-gray-500">{vet.specialization}</p>
                              <div className="flex items-center mt-1">
                                <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-xs text-gray-500 ml-1">{vet.rating || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex space-x-2">
                            <button className="flex-1 bg-blue-600 text-white text-sm py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                              Contact
                            </button>
                            <button className="flex-1 bg-white text-blue-600 border border-blue-600 text-sm py-2 px-4 rounded-md hover:bg-blue-50 transition-colors">
                              Book
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p>No veterinarians available at the moment.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default FarmerDashboard;