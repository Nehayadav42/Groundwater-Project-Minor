import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Mock users for demonstration (kept for local/demo logins)
const mockUsers = [
  {
    id: '1',
    email: 'policy@jalshakti.gov.in',
    name: 'Dr. Rajesh Kumar',
    role: 'policymaker',
    department: 'Ministry of Jal Shakti'
  },
  {
    id: '2',
    email: 'stakeholder@waterboard.gov.in',
    name: 'Priya Sharma',
    role: 'stakeholder',
    organization: 'State Water Board'
  },
  {
    id: '3',
    email: 'citizen@example.com',
    name: 'Amit Singh',
    role: 'public'
  }
];

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check for stored user session (migrate from old key if needed)
    const storedUser =
      localStorage.getItem('app_user') || localStorage.getItem('dwlr_user');

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });

        // Normalize to the new key and remove the legacy one
        localStorage.setItem('app_user', JSON.stringify(user));
        localStorage.removeItem('dwlr_user');
      } catch {
        localStorage.removeItem('app_user');
        localStorage.removeItem('dwlr_user');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email, password) => {
    // First try backend authentication
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        const user = {
          id: data._id,
          name: data.name,
          email: data.email,
          // Default to public role for backend users
          role: data.role || 'public'
        };

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
        localStorage.setItem('app_user', JSON.stringify(user));
        return true;
      }
    } catch (error) {
      console.error('Backend login failed, falling back to demo users:', error);
    }

    // Fallback to mock/demo authentication
    const demoUser = mockUsers.find(u => u.email === email);
    if (demoUser && password === 'password123') {
      setAuthState({
        user: demoUser,
        isAuthenticated: true,
        isLoading: false
      });
      localStorage.setItem('app_user', JSON.stringify(demoUser));
      return true;
    }

    return false;
  };

  const register = async (
    email,
    password,
    name,
    role,
    department,
    organization
  ) => {
    // Prefer backend registration
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      if (response.ok) {
        const data = await response.json();
        const user = {
          id: data._id,
          name: data.name,
          email: data.email,
          role: 'public'
        };

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
        localStorage.setItem('app_user', JSON.stringify(user));
        return true;
      }
    } catch (error) {
      console.error('Backend registration failed, falling back to demo users:', error);
    }

    // Fallback to mock/demo registration
    if (mockUsers.find(u => u.email === email)) {
      return false; // User already exists
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      role,
      department,
      organization
    };

    mockUsers.push(newUser);
    setAuthState({
      user: newUser,
      isAuthenticated: true,
      isLoading: false
    });
    localStorage.setItem('app_user', JSON.stringify(newUser));
    return true;
  };

  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Failed to request password reset');
      }

      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      return false;
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    localStorage.removeItem('app_user');
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      register,
      logout,
      forgotPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};