'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { useState, useEffect } from 'react';
import { getUserProfile, getAppointmentsForVet, getVeterinarianProfile, approveAppointment, confirmAppointment, completeAppointment, cancelAppointment, rescheduleAppointment } from '@/lib/firestore';
import { User as UserType, Appointment, Veterinarian } from '@/lib/types';

const VetDashboard = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserType | null>(null);
  const [vetData, setVetData] = useState<Veterinarian | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const handleApproveAppointment = async (appointmentId: string) => {
    try {
      await approveAppointment(appointmentId);
      // Update the local state
      setTodayAppointments(prev =>
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
      setTodayAppointments(prev =>
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
      setTodayAppointments(prev =>
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
      setTodayAppointments(prev =>
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
      setTodayAppointments(prev =>
        prev.map(app =>
          app.id === appointmentId ? { ...app, status: 'rescheduled', dateTime: newDateTime } : app
        )
      );
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserData(profile);

          // Fetch veterinarian profile if user is a veterinarian
          if (profile?.role === 'veterinarian' && profile.vetProfileId) {
            const vetProfile = await getVeterinarianProfile(profile.vetProfileId);
            setVetData(vetProfile);
          }

          // Fetch today's appointments for this vet
          const appointments = await getAppointmentsForVet(user.uid);
          // Filter to only today's appointments
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const filteredAppointments = appointments.filter(app => {
            const appDate = new Date(app.dateTime.seconds * 1000);
            appDate.setHours(0, 0, 0, 0);
            return appDate.getTime() === today.getTime();
          });
          setTodayAppointments(filteredAppointments);
        } catch (error) {
          console.error('Error fetching user data or appointments:', error);
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
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Welcome, Dr. {vetData?.name || userData?.name || user?.email}!</h2>
                
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
                  {todayAppointments.length > 0 ? (
                    <div className="bg-white rounded-lg border p-4">
                      <ul className="divide-y divide-gray-200">
                        {todayAppointments.map((appointment) => (
                          <li key={appointment.id} className="py-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{appointment.userName || 'User'}</p>
                                <p className="text-sm text-gray-500">
                                  {appointment.dateTime && typeof appointment.dateTime === 'object' && 'seconds' in appointment.dateTime
                                    ? new Date(appointment.dateTime.seconds * 1000).toLocaleTimeString()
                                    : new Date(appointment.dateTime).toLocaleTimeString()}
                                </p>
                              </div>
                              <div className="text-sm text-gray-500 capitalize">{appointment.status}</div>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">{appointment.reason}</p>
                            </div>
                            <div className="mt-3 flex space-x-2">
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
                                  onClick={() => handleRescheduleAppointment(appointment.id, new Date())} // This should be a proper date selection
                                  className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                                >
                                  Reschedule
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p>You don't have any appointments scheduled for today.</p>
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

export default VetDashboard;