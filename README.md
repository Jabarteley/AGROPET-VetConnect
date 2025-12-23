# AGROPET VetConnect

A Web-Based Platform for Veterinary Services in Nigeria built with Next.js and Firebase.

## Overview

AGROPET VetConnect bridges the gap between animal owners (farmers and pet owners) and certified veterinary professionals in Nigeria by providing a centralized, accessible, and reliable digital platform for veterinary consultation, appointment scheduling, and information sharing.

## Features

- User authentication (farmers, pet owners, veterinarians, and admins)
- Veterinarian directory with search and filtering
- Appointment scheduling system
- Secure messaging between users and veterinarians
- Admin dashboard for moderation
- User profile management

## Tech Stack

- Next.js 14 (with App Router)
- TypeScript
- Tailwind CSS
- Firebase (Authentication, Firestore)
- React Hooks

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd agropet-vetconnect
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication and Firestore
   - Create a `.env.local` file in the root directory with your Firebase configuration:
     ```env
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Environment Variables

The application requires the following environment variables to be set in a `.env.local` file:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # User dashboard
│   ├── profile/         # User profile page
│   ├── veterinarians/   # Veterinarian directory
│   ├── appointments/    # Appointment management
│   ├── messages/        # Messaging system
│   └── admin/           # Admin dashboard
├── components/          # Reusable React components
├── context/             # React context providers
├── lib/                 # Utility functions and types
└── public/              # Static assets
```

## Deployment

The application can be deployed to Vercel, Netlify, or any platform that supports Next.js. For Vercel:

1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts to configure your deployment

## Firebase Security Rules

Remember to set up appropriate Firestore security rules for your collections to ensure data security.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.