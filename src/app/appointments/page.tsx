'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { createAppointment, getUserAppointments, getVetAppointments, getUserProfile, getVeterinarianProfile, approveAppointment, confirmAppointment, completeAppointment, cancelAppointment, rescheduleAppointment } from '@/lib/firestore';
import { Appointment, User as UserType, Veterinarian } from '@/lib/types';

const AppointmentsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [reschedulingAppointmentId, setReschedulingAppointmentId] = useState<string | null>(null);
  const [rescheduleDateTime, setRescheduleDateTime] = useState<string>('');

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
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      if (user) {
        try {
          // Fetch user profile to determine role
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);

          console.log('User profile role:', profile?.role); // DEBUG LOG
          let fetchedAppointments: Appointment[] = [];

          if (profile?.role === 'veterinarian') {
            // If user is a veterinarian, fetch appointments assigned to them
            fetchedAppointments = await getVetAppointments(user.uid);
            console.log('Fetched vet appointments:', fetchedAppointments); // DEBUG LOG
          } else {
            // For other users, fetch their own appointments
            fetchedAppointments = await getUserAppointments(user.uid);
            console.log('Fetched user appointments:', fetchedAppointments); // DEBUG LOG
          }

          // If the user is not a veterinarian, fetch veterinarian names for better display
          if (profile?.role !== 'veterinarian') {
            const appointmentsWithVetNames = await Promise.all(
              fetchedAppointments.map(async (appointment) => {
                try {
                  const vetProfile = await getVeterinarianProfile(appointment.vetId);
                  return {
                    ...appointment,
                    vetName: vetProfile?.name || appointment.vetId
                  };
                } catch (error) {
                  console.error('Error fetching veterinarian profile:', error);
                  return {
                    ...appointment,
                    vetName: appointment.vetId
                  };
                }
              })
            );
            setAppointments(appointmentsWithVetNames);
          } else {
            const appointmentsWithUserNames = await Promise.all(
              fetchedAppointments.map(async (appointment) => {
                try {
                  const userProfile = await getUserProfile(appointment.userId);
                  return {
                    ...appointment,
                    userName: userProfile?.name || appointment.userId,
                  };
                } catch (error) {
                  console.error('Error fetching user profile:', error);
                  return {
                    ...appointment,
                    userName: appointment.userId,
                  };
                }
              })
            );
            setAppointments(appointmentsWithUserNames);
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
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-5 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Your Appointments</h2>
                    <a
                      href="/appointments/new"
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Book New Appointment
                    </a>
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
                                  {userProfile?.role === 'veterinarian' ? (
                                    <div>
                                      <h3 className="text-lg font-medium text-gray-900">Appointment with {appointment.userName || 'User'}</h3>
                                      <p className="text-sm text-gray-500 mt-1">Reason: {appointment.reason}</p>
                                    </div>
                                  ) : (
                                    <div>
                                      <h3 className="text-lg font-medium text-gray-900">Appointment with Dr. {appointment.vetName || appointment.vetId}</h3>
                                      <p className="text-sm text-gray-500 mt-1">Reason: {appointment.reason}</p>
                                    </div>
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
                                {userProfile?.role === 'veterinarian' && (
                                  <div className="mt-2 flex space-x-2">
                                    {appointment.status === 'pending' && (
                                      <>
                                        <button
                                          onClick={() => handleApproveAppointment(appointment.id)}
                                          className="mt-2 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                        >
                                          Approve
                                        </button>
                                        <button
                                          onClick={() => handleCancelAppointment(appointment.id)}
                                          className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    )}
                                    {appointment.status === 'approved' && (
                                      <>
                                        <button
                                          onClick={() => handleConfirmAppointment(appointment.id)}
                                          className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                        >
                                          Confirm
                                        </button>
                                        <button
                                          onClick={() => handleCompleteAppointment(appointment.id)}
                                          className="mt-2 text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                                        >
                                          Complete
                                        </button>
                                      </>
                                    )}
                                    {(appointment.status === 'pending' || appointment.status === 'approved') && (
                                      <button
                                        onClick={() => handleRescheduleAppointment(appointment.id, new Date())} // This should be a proper date selection
                                        className="mt-2 text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                                      >
                                        Reschedule
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            {appointment.notes && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <h4 className="text-sm font-medium text-gray-900">Notes</h4>
                                <p className="mt-1 text-sm text-gray-500">{appointment.notes}</p>
                              </div>
                            )}
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
                    <div className="mt-6">
                      <a
                        href="/appointments/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Book Your First Appointment
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AppointmentsPage;