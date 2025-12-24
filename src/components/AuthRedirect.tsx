'use client';

import { useAuth } from '@/context/AuthContext';
import { getUserProfile } from '@/lib/firestore';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthRedirect = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const redirect = async () => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);

        if (!profile || !profile.role) {
          router.push('/profile/setup');
          return;
        }

        switch (profile.role) {
          case 'admin':
            router.push('/admin');
            break;
          case 'veterinarian':
            router.push('/vet-dashboard');
            break;
          default:
            router.push('/farmer-dashboard');
        }
      } catch (error) {
        console.error('Error redirecting user:', error);
        router.push('/auth/login');
      }
    };

    if (!loading) redirect();
  }, [user, loading, router]);

  return null;
};

export default AuthRedirect;