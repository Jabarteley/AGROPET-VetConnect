'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { useState, useEffect } from 'react';
import { getUserProfile } from '@/lib/firestore';
import { User as UserType } from '@/lib/types';

const VetDashboard = () => {
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
            <h1 className="text-3xl font-bold text-gray-900">Veterinarian Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Welcome, Dr. {userData?.name || user?.email}!</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-blue-800">Your Profile</h3>
                    <p className="mt-2 text-blue-600">Manage your professional information and schedule.</p>
                    <a href="/profile" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block">
                      View Profile
                    </a>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-green-800">Manage Appointments</h3>
                    <p className="mt-2 text-green-600">View and manage your scheduled appointments.</p>
                    <a href="/appointments" className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 inline-block">
                      View Appointments
                    </a>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-purple-800">Messages</h3>
                    <p className="mt-2 text-purple-600">Check messages from clients.</p>
                    <a href="/messages" className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 inline-block">
                      View Messages
                    </a>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Today's Appointments</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p>You don't have any appointments scheduled for today.</p>
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

export default VetDashboard;