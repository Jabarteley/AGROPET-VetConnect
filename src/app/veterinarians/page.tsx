'use client';

import { useState, useEffect } from 'react';
import { getAllVeterinarians } from '@/lib/firestore';
import { Veterinarian } from '@/lib/types';
import Navigation from '@/components/Navigation';

const VeterinariansPage = () => {
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [filteredVets, setFilteredVets] = useState<Veterinarian[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    specialization: '',
    animalType: '',
  });

  useEffect(() => {
    const fetchVeterinarians = async () => {
      try {
        const vets = await getAllVeterinarians();
        console.log('Fetched veterinarians:', vets);
        setVeterinarians(vets);
        setFilteredVets(vets);
      } catch (error) {
        console.error('Error fetching veterinarians:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVeterinarians();
  }, []);

  // Apply filters whenever filters change
  useEffect(() => {
    let result = veterinarians;

    if (filters.location) {
      result = result.filter(vet =>
        vet.serviceRegions && vet.serviceRegions.some(region =>
          region.toLowerCase().includes(filters.location.toLowerCase())
        )
      );
    }

    if (filters.specialization) {
      result = result.filter(vet =>
        vet.specialization &&
        vet.specialization.toLowerCase().includes(filters.specialization.toLowerCase())
      );
    }

    // For animal type, we'll assume veterinarians have an array of animal types they serve
    if (filters.animalType) {
      result = result.filter(vet =>
        vet.animalType && vet.animalType.some(type =>
          type.toLowerCase().includes(filters.animalType.toLowerCase())
        )
      );
    }

    console.log('Filtered veterinarians:', result);
    setFilteredVets(result);
  }, [filters, veterinarians]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      specialization: '',
      animalType: '',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Find a Veterinarian</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  value={filters.location}
                  onChange={handleInputChange}
                  placeholder="City, State..."
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>

              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  id="specialization"
                  value={filters.specialization}
                  onChange={handleInputChange}
                  placeholder="e.g., Poultry, Cattle..."
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>

              <div>
                <label htmlFor="animalType" className="block text-sm font-medium text-gray-700 mb-1">
                  Animal Type
                </label>
                <input
                  type="text"
                  name="animalType"
                  id="animalType"
                  value={filters.animalType}
                  onChange={handleInputChange}
                  placeholder="e.g., Dogs, Cattle..."
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={clearFilters}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Veterinarians List */}
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              {filteredVets.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {filteredVets.map((vet) => (
                    <li key={vet.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <div className="px-6 py-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center">
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                              <div className="ml-4">
                                <div className="flex items-center">
                                  <h3 className="text-lg font-semibold text-indigo-600">Dr. {vet.name}</h3>
                                  <span className="ml-3 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {vet.verificationStatus === 'verified' ? 'Verified' : vet.verificationStatus}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">{vet.specialization}</p>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center text-sm text-gray-500">
                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <span>{vet.serviceRegions?.join(', ') || 'Nigeria'}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                <span>{vet.email}</span>
                              </div>
                            </div>

                            <div className="mt-4">
                              <p className="text-sm text-gray-700">{vet.bio || 'No bio provided'}</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end">
                            <div className="flex items-center text-sm text-gray-500 mb-4">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span>{vet.rating || 'N/A'} Rating</span>
                            </div>
                            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                              Book Appointment
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-6 py-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No veterinarians found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VeterinariansPage;