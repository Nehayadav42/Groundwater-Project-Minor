import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

// Mock users for demonstration
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
    // Check for stored user session
    const storedUser = localStorage.getItem('dwlr_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } catch {
        localStorage.removeItem('dwlr_user');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email, password) => {
    // Mock authentication - in real app, this would call an API
    const user = mockUsers.find(u => u.email === email);
    if (user && password === 'password123') {
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
      localStorage.setItem('dwlr_user', JSON.stringify(user));
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
    // Mock registration - in real app, this would call an API
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
    localStorage.setItem('dwlr_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    localStorage.removeItem('dwlr_user');
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      register,
      logout
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