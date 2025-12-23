import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp,
  QueryConstraint
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
export const createUserProfile = async (userData: Omit<User, 'id' | 'createdAt'>) => {
  try {
    const userRef = await addDoc(collection(db, 'users'), {
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

export const getAllVeterinarians = async (filters?: { 
  location?: string; 
  specialization?: string; 
  animalType?: string 
}) => {
  try {
    let q = query(collection(db, 'veterinarians'));
    
    const queryConstraints: QueryConstraint[] = [];
    
    if (filters?.location) {
      queryConstraints.push(where('serviceRegions', 'array-contains', filters.location));
    }
    
    if (filters?.specialization) {
      queryConstraints.push(where('specialization', '==', filters.specialization));
    }
    
    if (filters?.animalType) {
      // Assuming veterinarians have a field for animal types they serve
      queryConstraints.push(where('animalTypes', 'array-contains', filters.animalType));
    }
    
    // Add the where clauses to the query
    for (const constraint of queryConstraints) {
      q = query(q, constraint);
    }
    
    const vetDocs = await getDocs(q);
    return vetDocs.docs.map(doc => ({ 
      id: doc.id, 
      ...convertTimestamps(doc.data()) 
    })) as Veterinarian[];
  } catch (error) {
    console.error('Error getting veterinarians:', error);
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

export const updateAppointment = async (appointmentId: string, appointmentData: Partial<Appointment>) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, { ...appointmentData, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Error updating appointment:', error);
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

export const getMessages = async (senderId: string, receiverId: string) => {
  try {
    // Get messages between two users
    const q = query(
      collection(db, 'messages'),
      where('senderId', 'in', [senderId, receiverId]),
      where('receiverId', 'in', [senderId, receiverId])
    );
    const messageDocs = await getDocs(q);
    return messageDocs.docs.map(doc => ({ 
      id: doc.id, 
      ...convertTimestamps(doc.data()) 
    })) as Message[];
  } catch (error) {
    console.error('Error getting messages:', error);
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