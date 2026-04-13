'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    checkAppState();

    // Listen for Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          setAuthError(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      // Check if user has an active session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Session check failed:', error);
        setAuthError({ type: 'unknown', message: error.message });
        setIsLoadingAuth(false);
        return;
      }

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }

      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('Unexpected auth error:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'An unexpected error occurred',
      });
      setIsLoadingAuth(false);
      setIsLoadingPublicSettings(false);
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !userProfile) {
        // Return basic user info from auth session if profile not found
        const { data: { session } } = await supabase.auth.getSession();
        const authUser = session?.user;
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
            role: 'client',
            avatar_url: authUser.user_metadata?.avatar_url || null,
          });
          setIsAuthenticated(true);
        }
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const authUser = session?.user;

      setUser({
        id: userId,
        email: authUser?.email || userProfile.email,
        full_name: userProfile.full_name || authUser?.user_metadata?.full_name,
        role: userProfile.role || 'client',
        avatar_url: userProfile.avatar_url || authUser?.user_metadata?.avatar_url,
        ...userProfile,
      });
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const logout = async (shouldRedirect = true) => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);

    if (shouldRedirect && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const navigateToLogin = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
