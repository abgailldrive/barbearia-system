import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId, email) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error("Error fetching profile:", error);
      }

      if (data) {
        setUser({ ...data, email }); // Merge profile data with Auth email
      } else {
        // Fallback if profile trigger failed or hasn't run yet
        setUser({ id: userId, email });
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, user: data.user };
  };

  const register = async (userData) => {
    const { email, password, name, phone } = userData;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          phone: phone // Pass metadata for trigger to use
        }
      }
    });

    if (error) {
      return { success: false, message: error.message };
    }

    // Setup initial profile manually if needed (though trigger handles it usually)
    // For phone number specifically, we might need to update the profile if trigger only captures name
    if (data.user) {
      await supabase.from('profiles').update({ phone: phone }).eq('id', data.user.id);
    }

    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateUser = async (updates) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setUser({ ...user, ...updates });
      return { success: true };
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, message: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
