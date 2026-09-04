import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, collegeApi, profileApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState('loading'); // 'unauthenticated' | 'needs_college' | 'needs_role' | 'needs_student_profile' | 'needs_alumni_profile' | 'ready'
  const [activeCollege, setActiveCollege] = useState(null);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('alumni_jwt_token');
    if (!token) {
      setUser(null);
      setStage('unauthenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.getCurrentUser();
      const userData = res.data.user;
      setUser(userData);
      setActiveCollege(userData.college || null);
      setStage(res.data.onboardingStage || 'ready');
    } catch (err) {
      console.error('Failed to load authenticated user session:', err);
      localStorage.removeItem('alumni_jwt_token');
      setUser(null);
      setStage('unauthenticated');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if redirected from OAuth with ?token=...
    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get('token');

    if (oauthToken) {
      localStorage.setItem('alumni_jwt_token', oauthToken);
      // Clean query param from URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    fetchCurrentUser();
  }, []);

  const loginWithToken = (token) => {
    localStorage.setItem('alumni_jwt_token', token);
    return fetchCurrentUser();
  };

  const logout = () => {
    localStorage.removeItem('alumni_jwt_token');
    setUser(null);
    setActiveCollege(null);
    setStage('unauthenticated');
  };

  const attachCollege = async (collegeId) => {
    const res = await collegeApi.attachUser(collegeId);
    await fetchCurrentUser();
    return res.data;
  };

  const selectRole = async (role) => {
    const res = await profileApi.setRole(role);
    await fetchCurrentUser();
    return res.data;
  };

  const submitStudentProfile = async (profileData) => {
    const res = await profileApi.createStudentProfile(profileData);
    await fetchCurrentUser();
    return res.data;
  };

  const submitAlumniProfile = async (profileData) => {
    const res = await profileApi.createAlumniProfile(profileData);
    await fetchCurrentUser();
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        stage,
        activeCollege,
        loginWithToken,
        logout,
        refreshUser: fetchCurrentUser,
        attachCollege,
        selectRole,
        submitStudentProfile,
        submitAlumniProfile,
      }}
    >
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
