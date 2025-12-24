'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { createUserProfile, getUserProfile, createVeterinarianProfile, updateUserProfile } from '@/lib/firestore';
import { User as UserType } from '@/lib/types';

const ProfileSetupPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1); // Step 1: Role selection, Step 2: Profile details
  const [role, setRole] = useState<'farmer' | 'pet_owner' | 'veterinarian' | ''>('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [specialization, setSpecialization] = useState(''); // For veterinarians
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkUserProfile = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            // If profile already exists, redirect to dashboard
            if (profile.role === 'admin') {
              router.push('/admin');
            } else if (profile.role === 'veterinarian') {
              router.push('/vet-dashboard');
            } else {
              router.push('/farmer-dashboard');
            }
          }
        } catch (err) {
          console.error('Error checking user profile:', err);
        }
      }
    };

    checkUserProfile();
  }, [user, router]);

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role) {
      setStep(2);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if user profile exists, if not create it, otherwise update it
      const existingProfile = await getUserProfile(user!.uid);
      if (!existingProfile) {
        // Create user profile if it doesn't exist
        await createUserProfile({
          id: user!.uid,
          name: name || user!.email.split('@')[0], // Use email prefix as name if not provided
          email: user!.email,
          role: role as 'farmer' | 'pet_owner' | 'veterinarian',
          location,
          ...(role === 'veterinarian' && { specialization }),
          createdAt: new Date(),
        });
      } else {
        // Update user profile with role and other information
        await updateUserProfile(user!.uid, {
          name: name || user!.email.split('@')[0], // Use email prefix as name if not provided
          role: role as 'farmer' | 'pet_owner' | 'veterinarian',
          location,
          ...(role === 'veterinarian' && { specialization }),
        });
      }

      // If the user is a veterinarian, also create a veterinarian profile
      if (role === 'veterinarian') {
        console.log('Creating veterinarian profile for user:', user!.uid);
        try {
          const vetProfileId = await createVeterinarianProfile({
            userId: user!.uid,
            name: name || user!.email.split('@')[0],
            email: user!.email,
            role: 'veterinarian',
            qualifications: '', // Will be filled later in the profile
            specialization: specialization || '',
            serviceRegions: [location], // Use the location as the service region
            animalType: [], // Will be filled later in the profile
            verificationStatus: 'pending', // Start with pending verification
            createdAt: new Date(),
          });

          console.log('Veterinarian profile created with ID:', vetProfileId);

          // Update the user profile to include the veterinarian profile ID
          await updateUserProfile(user!.uid, {
            vetProfileId: vetProfileId
          });

          console.log('User profile updated with vetProfileId:', vetProfileId);
        } catch (error) {
          console.error('Error creating veterinarian profile:', error);
          throw error;
        }
      }

      // Redirect based on role
      if (role === 'veterinarian') {
        router.push('/vet-dashboard');
      } else {
        router.push('/farmer-dashboard');
      }
    } catch (err) {
      console.error('Error creating profile:', err);
      setError('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
          </div>
        </header>
        <main>
          <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow rounded-lg p-6">
                {step === 1 ? (
                  <form onSubmit={handleRoleSubmit}>
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">What best describes you?</h2>
                    
                    <div className="space-y-4">
                      <div 
                        className={`border-2 p-4 rounded-lg cursor-pointer transition-colors ${
                          role === 'farmer' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300'
                        }`}
                        onClick={() => setRole('farmer')}
                      >
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 mr-3">
                            {role === 'farmer' && <div className="w-4 h-4 rounded-full bg-indigo-600"></div>}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Farmer</h3>
                            <p className="text-sm text-gray-500">I raise livestock (cattle, poultry, goats, etc.)</p>
                          </div>
                        </div>
                      </div>
                      
                      <div 
                        className={`border-2 p-4 rounded-lg cursor-pointer transition-colors ${
                          role === 'pet_owner' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300'
                        }`}
                        onClick={() => setRole('pet_owner')}
                      >
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 mr-3">
                            {role === 'pet_owner' && <div className="w-4 h-4 rounded-full bg-indigo-600"></div>}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Pet Owner</h3>
                            <p className="text-sm text-gray-500">I have pets (dogs, cats, birds, etc.)</p>
                          </div>
                        </div>
                      </div>
                      
                      <div 
                        className={`border-2 p-4 rounded-lg cursor-pointer transition-colors ${
                          role === 'veterinarian' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300'
                        }`}
                        onClick={() => setRole('veterinarian')}
                      >
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 mr-3">
                            {role === 'veterinarian' && <div className="w-4 h-4 rounded-full bg-indigo-600"></div>}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Veterinarian</h3>
                            <p className="text-sm text-gray-500">I am a certified veterinary professional</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        type="submit"
                        disabled={!role}
                        className={`px-4 py-2 rounded-md text-white ${
                          role ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Continue
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleProfileSubmit}>
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Tell us more about yourself</h2>
                    
                    {error && (
                      <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {error}
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="Your full name"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                          Location
                        </label>
                        <input
                          type="text"
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="City, State or Region"
                        />
                      </div>
                      
                      {role === 'veterinarian' && (
                        <div>
                          <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                            Specialization
                          </label>
                          <input
                            type="text"
                            id="specialization"
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="e.g., Poultry Specialist, Small Animal Care, etc."
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Complete Profile'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ProfileSetupPage;