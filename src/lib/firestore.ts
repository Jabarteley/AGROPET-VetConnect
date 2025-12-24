import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Veterinarian, Appointment, Message } from './types';

// Helper function to convert Firestore timestamps to Date objects
const convertTimestamps = (obj: any): any => {
  const converted: any = { ...obj };
  for (const key in converted) {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    }
  }
  return converted;
};

// User operations
export const createUserProfile = async (userData: Omit<User, 'createdAt'>) => {
  try {
    // Use the user's UID as the document ID to match security rules
    const userRef = doc(db, 'users', userData.id);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
    });
    return userRef.id;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...convertTimestamps(userDoc.data()) } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, userData: Partial<User>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { ...userData, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Veterinarian operations
export const createVeterinarianProfile = async (vetData: Omit<Veterinarian, 'id' | 'createdAt'>) => {
  try {
    const vetRef = await addDoc(collection(db, 'veterinarians'), {
      ...vetData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      verificationStatus: 'pending',
    });
    return vetRef.id;
  } catch (error) {
    console.error('Error creating veterinarian profile:', error);
    throw error;
  }
};

export const getVeterinarianProfile = async (vetId: string) => {
  try {
    const vetDoc = await getDoc(doc(db, 'veterinarians', vetId));
    if (vetDoc.exists()) {
      return { id: vetDoc.id, ...convertTimestamps(vetDoc.data()) } as Veterinarian;
    }
    return null;
  } catch (error) {
    console.error('Error getting veterinarian profile:', error);
    throw error;
  }
};

export const updateVeterinarianProfile = async (vetId: string, vetData: Partial<Veterinarian>) => {
  try {
    const vetRef = doc(db, 'veterinarians', vetId);
    await updateDoc(vetRef, { ...vetData, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Error updating veterinarian profile:', error);
    throw error;
  }
};

export const getAllVeterinarians = async () => {
  try {
    const vetsQuery = query(collection(db, 'veterinarians'));
    const vetDocs = await getDocs(vetsQuery);
    return vetDocs.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Veterinarian[];
  } catch (error) {
    console.error('Error getting veterinarians:', error);
    throw error;
  }
};

export const getVeterinarians = async (status?: 'verified' | 'pending' | 'rejected') => {
  try {
    let q;
    if (status) {
      q = query(
        collection(db, 'veterinarians'),
        where('verificationStatus', '==', status)
      );
    } else {
      q = query(collection(db, 'veterinarians'));
    }
    const vetDocs = await getDocs(q);
    return vetDocs.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Veterinarian[];
  } catch (error) {
    console.error(`Error getting veterinarians:`, error);
    throw error;
  }
};

// Appointment operations
export const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const appointmentRef = await addDoc(collection(db, 'appointments'), {
      ...appointmentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return appointmentRef.id;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const getAppointment = async (appointmentId: string) => {
  try {
    const appointmentDoc = await getDoc(doc(db, 'appointments', appointmentId));
    if (appointmentDoc.exists()) {
      return { id: appointmentDoc.id, ...convertTimestamps(appointmentDoc.data()) } as Appointment;
    }
    return null;
  } catch (error) {
    console.error('Error getting appointment:', error);
    throw error;
  }
};

// Get appointments for a specific veterinarian
export const getAppointmentsForVet = async (vetId: string) => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('vetId', '==', vetId),
      orderBy('dateTime', 'asc')
    );
    const appointmentDocs = await getDocs(q);
    return appointmentDocs.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Appointment[];
  } catch (error) {
    console.error('Error getting appointments for vet:', error);
    throw error;
  }
};

export const updateAppointment = async (appointmentId: string, appointmentData: Partial<Appointment>) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, { ...appointmentData, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

// Specific appointment status update functions
export const approveAppointment = async (appointmentId: string) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      status: 'approved',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error approving appointment:', error);
    throw error;
  }
};

export const confirmAppointment = async (appointmentId: string) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      status: 'confirmed',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    throw error;
  }
};

export const completeAppointment = async (appointmentId: string) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      status: 'completed',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    throw error;
  }
};

export const cancelAppointment = async (appointmentId: string) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      status: 'cancelled',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};

export const rescheduleAppointment = async (appointmentId: string, newDateTime: Date) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      status: 'rescheduled',
      dateTime: newDateTime,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    throw error;
  }
};

export const getUserAppointments = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', userId),
      orderBy('dateTime', 'desc')
    );
    const appointmentDocs = await getDocs(q);
    return appointmentDocs.docs.map(doc => ({ 
      id: doc.id, 
      ...convertTimestamps(doc.data()) 
    })) as Appointment[];
  } catch (error) {
    console.error('Error getting user appointments:', error);
    throw error;
  }
};

export const getVetAppointments = async (vetId: string) => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('vetId', '==', vetId),
      orderBy('dateTime', 'desc')
    );
    const appointmentDocs = await getDocs(q);
    return appointmentDocs.docs.map(doc => ({ 
      id: doc.id, 
      ...convertTimestamps(doc.data()) 
    })) as Appointment[];
  } catch (error) {
    console.error('Error getting vet appointments:', error);
    throw error;
  }
};

export const getConversations = (userId: string, callback: (conversations: any[]) => void) => {
  console.warn('PERFORMANCE WARNING: Fetching all messages and filtering on the client. Consider using a more efficient query.');
  const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));

  const unsub = onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
    const userMessages = messages.filter(m => m.senderId === userId || m.receiverId === userId);

    const conversations: any = {};
    userMessages.forEach(message => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          participantId: otherUserId,
          messages: []
        };
      }
      conversations[otherUserId].messages.push(message);
    });

    const conversationsArray = Object.values(conversations).map((conv: any) => {
      const lastMessage = conv.messages[0];
      return {
        id: conv.participantId,
        participant: 'Loading...', // We will fetch the name later
        participantId: conv.participantId,
        lastMessage: lastMessage.content,
        timestamp: lastMessage.timestamp,
        unread: conv.messages.filter((m: Message) => !m.read && m.receiverId === userId).length
      };
    });

    callback(conversationsArray);
  });

  return unsub;
};

// Message operations
export const sendMessage = async (messageData: Omit<Message, 'id' | 'timestamp' | 'read'>) => {
  try {
    const messageRef = await addDoc(collection(db, 'messages'), {
      ...messageData,
      timestamp: serverTimestamp(),
      read: false,
    });
    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getMessages = (userId1: string, userId2: string, callback: (messages: Message[]) => void) => {
  const q = query(
    collection(db, 'messages'),
    where('senderId', 'in', [userId1, userId2]),
    where('receiverId', 'in', [userId1, userId2]),
    orderBy('timestamp', 'asc')
  );

  const unsub = onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Message[];
    // Have to filter again because the query is not perfect
    const filteredMessages = messages.filter(m => (m.senderId === userId1 && m.receiverId === userId2) || (m.senderId === userId2 && m.receiverId === userId1));
    callback(filteredMessages);
  });

  return unsub;
};

// Get total counts for admin dashboard
export const getTotalUsersCount = async (): Promise<number> => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.size;
  } catch (error) {
    console.error('Error getting users count:', error);
    throw error;
  }
};

export const getTotalAppointmentsCount = async (): Promise<number> => {
  try {
    const appointmentsSnapshot = await getDocs(collection(db, 'appointments'));
    return appointmentsSnapshot.size;
  } catch (error) {
    console.error('Error getting appointments count:', error);
    throw error;
  }
};

export const markMessageAsRead = async (messageId: string) => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, { read: true });
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

// Activity operations for admin dashboard
export const getRecentActivities = async (limit: number = 5) => {
  try {
    // In a real implementation, we would have an 'activities' collection
    // For now, we'll simulate by fetching recent users, appointments, etc.
    // and combining them into activity objects

    // Get recent veterinarians with pending status
    const pendingVets = await getVeterinarians('pending');
    const recentPendingVets = pendingVets.slice(0, limit);

    // Get recent appointments
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      orderBy('createdAt', 'desc')
    );
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    const appointments = appointmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Appointment[];

    // Get recent users
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc')
    );
    const usersSnapshot = await getDocs(usersQuery);
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as User[];

    // Combine and sort activities by timestamp
    let activities = [
      // Pending veterinarian requests
      ...recentPendingVets.map(vet => ({
        id: `vet-${vet.id}`,
        type: 'vet_requested' as const,
        vetId: vet.id,
        description: 'Requested verification',
        timestamp: vet.createdAt || new Date(),
        vetName: vet.name
      })),

      // Recent appointments
      ...appointments.slice(0, limit).map(app => ({
        id: `app-${app.id}`,
        type: 'appointment_booked' as const,
        appointmentId: app.id,
        userId: app.userId,
        vetId: app.vetId,
        description: 'New appointment booked',
        timestamp: app.createdAt || new Date(),
        userName: 'User', // In a real app, we'd fetch the user name
        vetName: 'Vet'   // In a real app, we'd fetch the vet name
      })),

      // Recent user signups
      ...users.slice(0, limit).map(user => ({
        id: `user-${user.id}`,
        type: 'user_created' as const,
        userId: user.id,
        description: 'Created account',
        timestamp: user.createdAt || new Date(),
        userName: user.name || user.email
      }))
    ];

    // Sort by timestamp (newest first) and limit
    activities = activities
      .sort((a, b) => (b.timestamp as Date).getTime() - (a.timestamp as Date).getTime())
      .slice(0, limit);

    return activities;
  } catch (error) {
    console.error('Error getting recent activities:', error);
    throw error;
  }
};