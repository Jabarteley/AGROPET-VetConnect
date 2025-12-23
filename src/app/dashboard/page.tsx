'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { useState, useEffect } from 'react';
import { getUserProfile } from '@/lib/firestore';
import { User as UserType } from '@/lib/types';
import { useRouter } from 'next/navigation';

const DashboardPage = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserData(profile);

          // Redirect based on user role after fetching data
          if (profile) {
            if (profile.role === 'admin') {
              router.push('/admin');
            } else if (profile.role === 'veterinarian') {
              router.push('/vet-dashboard');
            } else {
              // For farmers and pet owners
              router.push('/farmer-dashboard');
            }
          } else {
            // If no profile exists, redirect to profile setup
            router.push('/profile');
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Unable to load user data. Redirecting to profile...');

          // Redirect to profile page after showing error
          setTimeout(() => {
            router.push('/profile');
          }, 2000);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user, router]);

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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome, {userData?.name || user?.email}!</h2>
                {error ? (
                  <p className="text-red-600">{error}</p>
                ) : (
                  <p className="text-gray-600">Redirecting to your dashboard...</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;