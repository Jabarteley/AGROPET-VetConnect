'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

const Navigation = () => {
  const { user, userProfile, signOutUser } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      // Redirect to homepage after signout
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Determine user role from user profile
  const userRole = userProfile?.role;

  // Define navigation links based on user role
  const getNavLinks = () => {
    if (!user) {
      // Unauthenticated user links
      return [
        { name: 'Home', href: '/' },
        { name: 'Veterinarians', href: '/veterinarians' },
      ];
    }

    switch (userRole) {
      case 'admin':
        return [
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Veterinarians', href: '/veterinarians' },
          { name: 'Appointments', href: '/admin/appointments' },
          { name: 'Users', href: '/admin/users' },
         
        ];
      case 'veterinarian':
        return [
          { name: 'Dashboard', href: '/vet-dashboard' },
          { name: 'Appointments', href: '/appointments' },
          { name: 'Messages', href: '/messages' },
          { name: 'Profile', href: '/profile' },
        ];
      case 'farmer':
      case 'pet_owner':
        return [
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Veterinarians', href: '/veterinarians' },
          { name: 'Appointments', href: '/appointments' },
          { name: 'Messages', href: '/messages' },
          { name: 'Profile', href: '/profile' },
        ];
      default:
        return [
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Veterinarians', href: '/veterinarians' },
          { name: 'Appointments', href: '/appointments' },
          { name: 'Messages', href: '/messages' },
          { name: 'Profile', href: '/profile' },
        ];
    }
  };

  const navLinks = getNavLinks();

  const isAdmin = userRole === 'admin';
  const isVet = userRole === 'veterinarian';
  const isFarmerOrPetOwner = userRole === 'farmer' || userRole === 'pet_owner';

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-700 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-white flex items-center animate-pulse">
                <span className="bg-white text-indigo-600 p-2 rounded-lg mr-2 font-bold">V</span>
                <span className="text-2xl">AGROPET VetConnect</span>
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`${
                    pathname === link.href
                      ? 'border-white text-white'
                      : 'border-transparent text-indigo-100 hover:border-indigo-300 hover:text-white'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium capitalize transition-all duration-300 transform hover:scale-105`}
                >
                  {link.name}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`${
                    pathname === '/admin'
                      ? 'border-white text-white'
                      : 'border-transparent text-indigo-100 hover:border-indigo-300 hover:text-white'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium capitalize transition-all duration-300 transform hover:scale-105`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <div className="relative">
                  <div className="bg-gradient-to-r from-indigo-400 to-purple-500 border-2 border-white rounded-xl w-8 h-8 flex items-center justify-center text-white font-bold">
                    {userProfile?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <span className="text-sm text-white hidden sm:block">
                  {userProfile?.name || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/auth/login"
                  className="bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-900 transition-all duration-300 transform hover:scale-105"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-indigo-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-expanded="false"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-gradient-to-r from-indigo-700 to-purple-800`}>
        <div className="pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`${
                pathname === link.href
                  ? 'bg-indigo-600 text-white'
                  : 'text-indigo-200 hover:bg-indigo-600 hover:text-white'
              } block pl-3 pr-4 py-2 text-base font-medium transition-all duration-300`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={`${
                pathname === '/admin'
                  ? 'bg-indigo-600 text-white'
                  : 'text-indigo-200 hover:bg-indigo-600 hover:text-white'
              } block pl-3 pr-4 py-2 text-base font-medium transition-all duration-300`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin
            </Link>
          )}
          {user ? (
            <button
              onClick={() => {
                handleSignOut();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-indigo-200 hover:bg-indigo-600 hover:text-white transition-all duration-300"
            >
              Sign out
            </button>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="block pl-3 pr-4 py-2 text-base font-medium text-indigo-200 hover:bg-indigo-600 hover:text-white transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="block pl-3 pr-4 py-2 text-base font-medium text-indigo-200 hover:bg-indigo-600 hover:text-white transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;