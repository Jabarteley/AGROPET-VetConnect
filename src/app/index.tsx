'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile } from '@/lib/firestore';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const redirectBasedOnRole = async () => {
      if (user) {
        try {
          // Try to get user profile to determine role
          const profile = await getUserProfile(user.uid);
          if (profile && profile.role) {
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
            router.push('/profile/setup');
          }
        } catch (error) {
          // If there's an error fetching profile, redirect to profile setup
          router.push('/profile/setup');
        }
      } else {
        // If not authenticated, redirect to login
        router.push('/auth/login');
      }
    };

    redirectBasedOnRole();
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}