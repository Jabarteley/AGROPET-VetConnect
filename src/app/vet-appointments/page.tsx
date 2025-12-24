'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { getVetAppointments, approveAppointment, confirmAppointment, completeAppointment, cancelAppointment, rescheduleAppointment, getUserProfile, getVeterinarianProfile } from '@/lib/firestore';
import { Appointment, User as UserType, Veterinarian } from '@/lib/types';

const VetAppointmentsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [vetProfile, setVetProfile] = useState<Veterinarian | null>(null);
  const [loading, setLoading] = useState(true);
  const [reschedulingAppointmentId, setReschedulingAppointmentId] = useState<string | null>(null);
  const [rescheduleDateTime, setRescheduleDateTime] = useState<string>('');

  useEffect(() => {
    const fetchAppointments = async () => {
      if (user) {
        try {
          // Fetch user profile to confirm role
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          
          if (profile?.role === 'veterinarian') {
            // Fetch veterinarian profile
            const vet = await getVeterinarianProfile(user.uid);
            setVetProfile(vet);
            
            // Fetch appointments assigned to this veterinarian
            const vetAppointments = await getVetAppointments(user.uid);
            setAppointments(vetAppointments);
          }
        } catch (error) {
          console.error('Error fetching appointments:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAppointments();
  }, [user]);

  const handleApproveAppointment = async (appointmentId: string) => {
    try {
      await approveAppointment(appointmentId);
      // Update the local state
      setAppointments(prev => 
        prev.map(app => 
          app.id === appointmentId ? { ...app, status: 'approved' } : app
        )
      );
    } catch (error) {
      console.error('Error approving appointment:', error);
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await confirmAppointment(appointmentId);
      // Update the local state
      setAppointments(prev => 
        prev.map(app => 
          app.id === appointmentId ? { ...app, status: 'confirmed' } : app
        )
      );
    } catch (error) {
      console.error('Error confirming appointment:', error);
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      await completeAppointment(appointmentId);
      // Update the local state
      setAppointments(prev => 
        prev.map(app => 
          app.id === appointmentId ? { ...app, status: 'completed' } : app
        )
      );
    } catch (error) {
      console.error('Error completing appointment:', error);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId);
      // Update the local state
      setAppointments(prev => 
        prev.map(app => 
          app.id === appointmentId ? { ...app, status: 'cancelled' } : app
        )
      );
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const handleRescheduleAppointment = async (appointmentId: string, newDateTime: Date) => {
    try {
      await rescheduleAppointment(appointmentId, newDateTime);
      // Update the local state
      setAppointments(prev => 
        prev.map(app => 
          app.id === appointmentId ? { ...app, status: 'rescheduled', dateTime: newDateTime } : app
        )
      );
      // Close the reschedule modal
      setReschedulingAppointmentId(null);
      setRescheduleDateTime('');
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
    }
  };

  const handleRescheduleSubmit = (appointmentId: string) => {
    if (!rescheduleDateTime) return;
    
    const newDateTime = new Date(rescheduleDateTime);
    handleRescheduleAppointment(appointmentId, newDateTime);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userProfile || userProfile.role !== 'veterinarian') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
          <p className="text-gray-600">Only veterinarians can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Your Appointments</h1>
            <p className="mt-2 text-gray-600">Manage appointments scheduled with your clients</p>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-5 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Appointments with Dr. {vetProfile?.name || userProfile?.name}</h2>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'}
                    </span>
                  </div>
                </div>

                {appointments.length > 0 ? (
                  <div className="overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {appointments.map((appointment) => (
                        <li key={appointment.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <div className="px-6 py-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="bg-indigo-100 p-3 rounded-lg">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div className="ml-4">
                                  <h3 className="text-lg font-medium text-gray-900">Appointment with {appointment.userName || 'User'}</h3>
                                  <p className="text-sm text-gray-500 mt-1">Reason: {appointment.reason}</p>
                                  {appointment.notes && (
                                    <p className="text-sm text-gray-500 mt-1">Notes: {appointment.notes}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  appointment.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                  appointment.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                                  appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  appointment.status === 'rescheduled' ? 'bg-gray-100 text-gray-800' :
                                  'bg-indigo-100 text-indigo-800'
                                }`}>
                                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                </span>
                                <div className="mt-2 text-sm text-gray-500">
                                  <p>Date: {appointment.dateTime ? new Date(appointment.dateTime).toLocaleDateString() : 'N/A'}</p>
                                  <p>Time: {appointment.dateTime ? new Date(appointment.dateTime).toLocaleTimeString() : 'N/A'}</p>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {appointment.status === 'pending' && (
                                    <>
                                      <button 
                                        onClick={() => handleApproveAppointment(appointment.id)}
                                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                      >
                                        Approve
                                      </button>
                                      <button 
                                        onClick={() => handleCancelAppointment(appointment.id)}
                                        className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  )}
                                  {appointment.status === 'approved' && (
                                    <>
                                      <button 
                                        onClick={() => handleConfirmAppointment(appointment.id)}
                                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                      >
                                        Confirm
                                      </button>
                                      <button 
                                        onClick={() => handleCompleteAppointment(appointment.id)}
                                        className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
                                      >
                                        Complete
                                      </button>
                                    </>
                                  )}
                                  {(appointment.status === 'pending' || appointment.status === 'approved') && (
                                    <button 
                                      onClick={() => {
                                        setReschedulingAppointmentId(appointment.id);
                                        // Set default to current date/time for rescheduling
                                        setRescheduleDateTime(new Date(appointment.dateTime).toISOString().slice(0, 16));
                                      }}
                                      className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                                    >
                                      Reschedule
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                    <p className="mt-1 text-sm text-gray-500">You don't have any appointments scheduled yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        
        {/* Reschedule Appointment Modal */}
        {reschedulingAppointmentId && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="relative p-4 w-full max-w-md h-full md:h-auto">
              <div className="relative bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Reschedule Appointment</h3>
                
                <div className="mb-4">
                  <label htmlFor="rescheduleDateTime" className="block text-sm font-medium text-gray-700 mb-1">
                    New Date and Time
                  </label>
                  <input
                    type="datetime-local"
                    id="rescheduleDateTime"
                    value={rescheduleDateTime}
                    onChange={(e) => setRescheduleDateTime(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setReschedulingAppointmentId(null);
                      setRescheduleDateTime('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRescheduleSubmit(reschedulingAppointmentId)}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default VetAppointmentsPage;