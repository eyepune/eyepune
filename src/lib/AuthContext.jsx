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
          await fetchUserProfile(session.user.id, session.user);
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

      // Check if Supabase is even configured
      const { isSupabaseConfigured } = await import('@/integrations/supabase/client');
      if (!isSupabaseConfigured) {
        setAuthError({ 
          type: 'config_missing', 
          message: 'Supabase credentials are missing. Please check your .env file.' 
        });
        setIsLoadingAuth(false);
        return;
      }

      // Check if user has an active session
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError && authError.message !== 'Auth session missing!') {
        console.error('Session check failed:', authError);
        setAuthError({ type: 'unknown', message: authError.message });
        setIsLoadingAuth(false);
        return;
      }

      if (authUser) {
        await fetchUserProfile(authUser.id, authUser);
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

  const fetchUserProfile = async (userId, authUser) => {
    try {
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !userProfile) {
        console.warn('Profile not found, using auth metadata');
        if (authUser) {
          // AUTO-CREATE PROFILE IF MISSING (Defensive)
          try {
            await supabase.from('users').insert([{
              id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
              role: (authUser.email === 'connect@eyepune.com' || authUser.email === 'eyepune.contact@gmail.com') ? 'admin' : 'client'
            }]);
          } catch (e) {
            console.error('Auto-profile creation failed:', e);
          }

          setUser({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
            role: (authUser.email === 'connect@eyepune.com' || authUser.email === 'eyepune.contact@gmail.com') ? 'admin' : 'client',
            avatar_url: authUser.user_metadata?.avatar_url || null,
          });
          setIsAuthenticated(true);
        }
        return;
      }

      // Force admin role for master admin email
      const finalRole = (authUser?.email === 'connect@eyepune.com' || userProfile.email === 'connect@eyepune.com' || authUser?.email === 'eyepune.contact@gmail.com' || userProfile.email === 'eyepune.contact@gmail.com') 
        ? 'admin' 
        : (userProfile.role || 'client');

      setUser({
        id: userId,
        email: authUser?.email || userProfile.email,
        full_name: userProfile.full_name || authUser?.user_metadata?.full_name,
        role: finalRole,
        avatar_url: userProfile.avatar_url || authUser?.user_metadata?.avatar_url,
        ...userProfile,
        role: finalRole, // Ensure it's not overridden by spread
      });
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setAuthError({ type: 'profile_fetch', message: error.message });
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
