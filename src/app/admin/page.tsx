'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';

import {
  getVeterinarians,
  updateVeterinarianProfile,
  getTotalUsersCount,
  getTotalAppointmentsCount,
  getRecentActivities,
  getAllAppointments,
  approveAppointment,
  confirmAppointment,
  completeAppointment,
  cancelAppointment,
  rescheduleAppointment,
  getAllUsers,
  getUserProfile,
  updateUserProfile as updateFirestoreUserProfile,
  deleteUserProfile
} from '@/lib/firestore';
import { Veterinarian, Activity, Appointment, User as UserType } from '@/lib/types';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingVets, setPendingVets] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [totalVets, setTotalVets] = useState(0);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch veterinarians
        const vets = await getVeterinarians();
        setVeterinarians(vets);
        setPendingVets(vets.filter(v => v.verificationStatus === 'pending').length);
        setTotalVets(vets.length);

        // Fetch other stats (you'll need to implement these functions)
        // For now, let's create placeholder functions
        const usersCount = await getTotalUsersCount();
        const appointmentsCount = await getTotalAppointmentsCount();
        const activities = await getRecentActivities(5);
        const allAppointments = await getAllAppointments();
        const allUsers = await getAllUsers();

        setTotalUsers(usersCount);
        setTotalAppointments(appointmentsCount);
        setAppointments(allAppointments);
        setUsers(allUsers);
        setRecentActivities(activities);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVerifyVet = async (vetId: string) => {
    await updateVeterinarianProfile(vetId, { verificationStatus: 'verified' });
    setVeterinarians(vets =>
      vets.map(vet =>
        vet.id === vetId ? { ...vet, verificationStatus: 'verified' } : vet
      )
    );
    setPendingVets(prev => prev - 1);
  };

  const handleRejectVet = async (vetId: string) => {
    // You might want to delete the vet or move them to a 'rejected' status
    await updateVeterinarianProfile(vetId, { verificationStatus: 'rejected' });
    setVeterinarians(vets =>
      vets.filter(vet => vet.id !== vetId)
    );
    setPendingVets(prev => prev - 1);
  };

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

  const handleRescheduleAppointment = async (appointmentId: string) => {
    // For now, we'll just mark it as rescheduled with a placeholder date
    // In a real app, you would have a date picker
    try {
      await rescheduleAppointment(appointmentId, new Date());
      // Update the local state
      setAppointments(prev =>
        prev.map(app =>
          app.id === appointmentId ? { ...app, status: 'rescheduled' } : app
        )
      );
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
    }
  };

  const handleViewUser = async (userId: string) => {
    // In a real app, this would navigate to a user details page
    console.log('View user:', userId);
    // For now, we'll just log the action
  };

  const handleEditUser = async (userId: string) => {
    try {
      // In a real app, this would open an edit modal or navigate to an edit page
      // For now, we'll just fetch and log the user data
      const userToEdit = await getUserProfile(userId);
      console.log('Edit user:', userToEdit);
    } catch (error) {
      console.error('Error fetching user for edit:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteUserProfile(userId);
      // Update the local state to remove the user
      setUsers(prev => prev.filter(user => user.id !== userId));
      setTotalUsers(prev => prev - 1);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (!user) {
    return null;
  }

  

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {['overview', 'veterinarians', 'users', 'appointments'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="px-4 py-6 sm:px-0">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Dashboard Overview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-blue-100">
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-2xl font-bold text-gray-900">{totalUsers}</h3>
                        <p className="text-gray-500">Total Users</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-green-100">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-2xl font-bold text-gray-900">{pendingVets}</h3>
                        <p className="text-gray-500">Pending Vets</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-purple-100">
                        <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-2xl font-bold text-gray-900">{totalAppointments}</h3>
                        <p className="text-gray-500">Appointments</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Activity</h3>
                  <div className="flow-root">
                    <ul className="divide-y divide-gray-200">
                      {recentActivities.length > 0 ? (
                        recentActivities.map((activity) => (
                          <li key={activity.id} className="py-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <span className="text-indigo-800 text-sm font-medium">
                                    {activity.vetName
                                      ? activity.vetName.charAt(0)
                                      : activity.userName
                                        ? activity.userName.charAt(0)
                                        : 'U'}
                                  </span>
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {activity.vetName
                                    ? `Dr. ${activity.vetName}`
                                    : activity.userName
                                      ? activity.userName
                                      : 'User'}
                                </p>
                                <p className="text-sm text-gray-500 truncate">{activity.description}</p>
                              </div>
                              <div>
                                {activity.type === 'vet_requested' && (
                                  <button
                                    onClick={() => handleVerifyVet(activity.vetId!)}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-full text-green-700 bg-green-100 hover:bg-green-200"
                                  >
                                    Verify
                                  </button>
                                )}
                                {activity.type === 'user_created' && (
                                  <span className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-full text-gray-700 bg-gray-100">
                                    New
                                  </span>
                                )}
                              </div>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="py-4 text-center text-gray-500">
                          No recent activity
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Veterinarians Tab */}
            {activeTab === 'veterinarians' && (
              <div className="px-4 py-6 sm:px-0">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Manage Veterinarians</h2>
                
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  {loading ? (
                    <p className="px-4 py-4 text-center text-gray-500">Loading veterinarians...</p>
                  ) : veterinarians.length === 0 ? (
                    <p className="px-4 py-4 text-center text-gray-500">No veterinarians found.</p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {veterinarians.map((vet) => (
                        <li key={vet.id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-indigo-600 truncate">
                                {vet.name}
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  vet.verificationStatus === 'verified'
                                    ? 'bg-green-100 text-green-800'
                                    : vet.verificationStatus === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                }`}>
                                  {vet.verificationStatus}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <div className="mr-6 text-sm text-gray-500">
                                  <p>{vet.email}</p>
                                  <p className="mt-2">{vet.specialization}</p>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                {vet.verificationStatus === 'pending' && (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleVerifyVet(vet.id)}
                                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                    >
                                      Verify
                                    </button>
                                    <button
                                      onClick={() => handleRejectVet(vet.id)}
                                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="px-4 py-6 sm:px-0">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Manage Users</h2>

                {loading ? (
                  <p className="text-center text-gray-500">Loading users...</p>
                ) : users.length === 0 ? (
                  <p className="text-center text-gray-500">No users found.</p>
                ) : (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <li key={user.id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-indigo-600 truncate">
                                {user.name || user.email}
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.role === 'admin'
                                    ? 'bg-purple-100 text-purple-800' :
                                  user.role === 'veterinarian'
                                    ? 'bg-green-100 text-green-800' :
                                  user.role === 'farmer'
                                    ? 'bg-yellow-100 text-yellow-800' :
                                  user.role === 'pet_owner'
                                    ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {user.role}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <div className="mr-6 text-sm text-gray-500">
                                  <p>Email: {user.email}</p>
                                  <p className="mt-1">Location: {user.location || 'N/A'}</p>
                                  <p className="mt-1">
                                    Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleViewUser(user.id)}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => handleEditUser(user.id)}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div className="px-4 py-6 sm:px-0">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Manage Appointments</h2>

                {loading ? (
                  <p className="text-center text-gray-500">Loading appointments...</p>
                ) : appointments.length === 0 ? (
                  <p className="text-center text-gray-500">No appointments found.</p>
                ) : (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {appointments.map((appointment) => (
                        <li key={appointment.id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-indigo-600 truncate">
                                {appointment.userName || 'User'} - Dr. {appointment.vetId}
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  appointment.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800' :
                                  appointment.status === 'approved'
                                    ? 'bg-green-100 text-green-800' :
                                  appointment.status === 'confirmed'
                                    ? 'bg-blue-100 text-blue-800' :
                                  appointment.status === 'completed'
                                    ? 'bg-purple-100 text-purple-800' :
                                  appointment.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {appointment.status}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <div className="mr-6 text-sm text-gray-500">
                                  <p>Reason: {appointment.reason}</p>
                                  <p className="mt-1">
                                    Date: {appointment.dateTime ? new Date(appointment.dateTime).toLocaleDateString() : 'N/A'}
                                  </p>
                                  <p className="mt-1">
                                    Time: {appointment.dateTime ? new Date(appointment.dateTime).toLocaleTimeString() : 'N/A'}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <div className="flex space-x-2">
                                  {appointment.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleApproveAppointment(appointment.id)}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleCancelAppointment(appointment.id)}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  )}
                                  {appointment.status === 'approved' && (
                                    <>
                                      <button
                                        onClick={() => handleConfirmAppointment(appointment.id)}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                      >
                                        Confirm
                                      </button>
                                      <button
                                        onClick={() => handleCompleteAppointment(appointment.id)}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                                      >
                                        Complete
                                      </button>
                                    </>
                                  )}
                                  {(appointment.status === 'pending' || appointment.status === 'approved') && (
                                    <button
                                      onClick={() => handleRescheduleAppointment(appointment.id)}
                                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
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
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;