// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  async function signup(email, password, name, phone, age, goals) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      const userDoc = {
        uid: userCredential.user.uid,
        email,
        name,
        phone,
        age,
        goals: goals || ['Personal Growth', 'Financial Freedom'],
        subscription: 'free',
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
        role: 'user',
        settings: {
          notifications: true,
          emailDigest: true,
          darkMode: false
        }
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userDoc);
      return userCredential;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  async function updateUserData(uid, data) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date()
      });
      
      if (currentUser && currentUser.uid === uid) {
        setUserData(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Update user data error:', error);
      throw error;
    }
  }

  async function upgradeSubscription(uid, plan) {
    const subscriptionData = {
      subscription: plan,
      subscriptionStatus: 'active',
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + (plan === 'premium' ? 30 : 365) * 24 * 60 * 60 * 1000)
    };
    await updateUserData(uid, subscriptionData);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setIsAdmin(data.role === 'admin');
          } else {
            // Create user document if it doesn't exist
            const newUserData = {
              uid: user.uid,
              email: user.email,
              name: user.displayName || 'User',
              phone: '',
              age: null,
              goals: ['Personal Growth'],
              subscription: 'free',
              subscriptionStatus: 'active',
              subscriptionStartDate: new Date(),
              subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              createdAt: new Date(),
              updatedAt: new Date(),
              role: 'user',
              settings: {
                notifications: true,
                emailDigest: true,
                darkMode: false
              }
            };
            await setDoc(doc(db, 'users', user.uid), newUserData);
            setUserData(newUserData);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    isAdmin,
    signup,
    login,
    logout,
    resetPassword,
    updateUserData,
    upgradeSubscription,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}