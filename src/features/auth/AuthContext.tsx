import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../services/firebase/config';
import { dbGetUserProfile, dbSaveUserProfile } from '../../services/database';
import { UserProfile, SupportedLanguage } from '../../types';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  isDemoAccount: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
  startDemoSession: (role?: 'customer' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  firebaseUser: null,
  loading: true,
  isAdmin: false,
  isDemoAccount: false,
  signIn: async () => {},
  signUp: async () => {},
  resetPassword: async () => {},
  signOut: async () => {},
  updateProfileData: async () => {},
  startDemoSession: () => {},
});

const DEMO_CUSTOMER: UserProfile = {
  uid: 'demo-user-123',
  email: 'customer@demo.com',
  displayName: 'Rahul Sharma',
  phone: '+91 9876543210',
  language: 'en',
  createdAt: Date.now() - 86400000 * 10,
  updatedAt: Date.now(),
  isAdmin: false,
};

const DEMO_ADMIN: UserProfile = {
  uid: 'demo-admin-999',
  email: 'admin@demo.com',
  displayName: 'Senior Claims Assessor',
  phone: '+91 9123456789',
  language: 'en',
  createdAt: Date.now() - 86400000 * 30,
  updatedAt: Date.now(),
  isAdmin: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('app_session_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoAccount, setIsDemoAccount] = useState<boolean>(() => {
    return localStorage.getItem('app_is_demo') === 'true';
  });

  // Admin UIDs check from VITE_ADMIN_UIDS
  const adminUids = (import.meta.env.VITE_ADMIN_UIDS || '').split(',').map((s: string) => s.trim());
  const isAdmin = Boolean(currentUser?.isAdmin || (currentUser?.uid && adminUids.includes(currentUser.uid)));

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setFirebaseUser(user);
        if (user) {
          let profile = await dbGetUserProfile(user.uid);
          if (!profile) {
            profile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              language: 'en',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              isAdmin: adminUids.includes(user.uid),
            };
            await dbSaveUserProfile(profile);
          }
          setCurrentUser(profile);
          localStorage.setItem('app_session_profile', JSON.stringify(profile));
          setIsDemoAccount(false);
          localStorage.removeItem('app_is_demo');
        } else {
          if (!isDemoAccount) {
            setCurrentUser(null);
            localStorage.removeItem('app_session_profile');
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [isDemoAccount]);

  const signIn = async (email: string, pass: string) => {
    if (isFirebaseConfigured && auth) {
      await signInWithEmailAndPassword(auth, email, pass);
    } else {
      // Demo session fallback for offline / unconfigured setup
      const isAd = email.includes('admin') || email.includes('reviewer');
      startDemoSession(isAd ? 'admin' : 'customer');
    }
  };

  const signUp = async (email: string, pass: string, name: string) => {
    if (isFirebaseConfigured && auth) {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const newProf: UserProfile = {
        uid: res.user.uid,
        email,
        displayName: name,
        language: 'en',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isAdmin: adminUids.includes(res.user.uid),
      };
      await dbSaveUserProfile(newProf);
      setCurrentUser(newProf);
    } else {
      const newProf: UserProfile = {
        uid: 'user-' + Date.now(),
        email,
        displayName: name,
        language: 'en',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isAdmin: false,
      };
      setCurrentUser(newProf);
      localStorage.setItem('app_session_profile', JSON.stringify(newProf));
      setIsDemoAccount(true);
      localStorage.setItem('app_is_demo', 'true');
    }
  };

  const resetPassword = async (email: string) => {
    if (isFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
    }
  };

  const signOut = async () => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth).catch(() => {});
    }
    setCurrentUser(null);
    setIsDemoAccount(false);
    localStorage.removeItem('app_session_profile');
    localStorage.removeItem('app_is_demo');
  };

  const updateProfileData = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates, updatedAt: Date.now() };
    setCurrentUser(updated);
    localStorage.setItem('app_session_profile', JSON.stringify(updated));
    await dbSaveUserProfile(updated);
  };

  const startDemoSession = (role: 'customer' | 'admin' = 'customer') => {
    const prof = role === 'admin' ? DEMO_ADMIN : DEMO_CUSTOMER;
    setCurrentUser(prof);
    setIsDemoAccount(true);
    localStorage.setItem('app_session_profile', JSON.stringify(prof));
    localStorage.setItem('app_is_demo', 'true');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        isAdmin,
        isDemoAccount,
        signIn,
        signUp,
        resetPassword,
        signOut,
        updateProfileData,
        startDemoSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
