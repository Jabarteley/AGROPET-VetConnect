export interface User {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'owner' | 'veterinarian' | 'admin';
  location?: string;
  createdAt: Date;
  // Farmer/Pet Owner specific fields
  farmType?: string; // for farmers (poultry, cattle, etc.)
  profilePicture?: string;
  bio?: string;
  contactNumber?: string;
  // Veterinarian specific field
  vetProfileId?: string; // Reference to the veterinarian profile in the veterinarians collection
}

export interface Veterinarian {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'veterinarian';
  qualifications: string;
  specialization: string;
  serviceRegions: string[];
  animalType?: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  profilePicture?: string;
  bio?: string;
  contactNumber?: string;
  rating?: number;
  totalReviews?: number;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  userId: string; // ID of the user who booked
  vetId: string; // ID of the veterinarian
  dateTime: Date;
  status: 'pending' | 'approved' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  reason: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  appointmentId?: string; // Optional - link to specific appointment
}

export interface Review {
  id: string;
  appointmentId: string;
  userId: string; // The user who left the review
  vetId: string; // The veterinarian being reviewed
  rating: number; // 1-5 stars
  comment: string;
  createdAt: Date;
}

export interface Activity {
  id: string;
  type: 'user_created' | 'vet_requested' | 'appointment_booked' | 'appointment_completed' | 'review_submitted';
  userId?: string;
  vetId?: string;
  appointmentId?: string;
  description: string;
  timestamp: Date;
  userName?: string;
  vetName?: string;
}