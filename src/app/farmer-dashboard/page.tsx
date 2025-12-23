'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { useState, useEffect } from 'react';
import { getUserProfile } from '@/lib/firestore';
import { User as UserType } from '@/lib/types';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserData(profile);
        } catch (error) {
          console.error('Error fetching user data:', error);
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
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Activity</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p>No recent activity yet. Start by booking an appointment or connecting with a veterinarian.</p>
                  </div>
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