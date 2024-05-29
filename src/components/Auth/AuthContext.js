import { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase.config';

export const AuthContext = createContext();

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    //return unsubscribe;

    const handleUnload = () => {
      logout();
    };

    window.addEventListener('unload', handleUnload);

    return () => {
      unsubscribe();
      window.removeEventListener('unload', handleUnload);
    };
  }, []);

  const logout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        console.log("User signed out successfully");
      })
      .catch((error) => {
        console.log("Error signing out:", error);
      });
  };

  return { user, loading, logout };
};