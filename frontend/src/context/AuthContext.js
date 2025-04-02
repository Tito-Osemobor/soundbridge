import {createContext, useContext, useEffect, useState} from "react";
import {connectSpotify} from "@/services/auth/spotifyAuthService";
import {connectYoutubeMusic} from "@/services/auth/youtubeAuthService";
import {fetchUser, loginUser, logoutUser, registerUser} from "@/services/auth/authService";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await fetchUser();

        if (userData) {
          setUser(userData);
        } else {
          setUser(null); // Ensure state remains null for unauthenticated users
        }
      } catch (error) {
        console.error("Error in AuthContext useEffect:", error);
        setUser(null);
      } finally {
        setLoading(false); // Ensure loading state is updated
      }
    };

    loadUser();
  }, []);


  // ✅ Updated connect function to ensure OAuth completes before fetching user
  const connect = async (provider) => {
    try {
      switch (provider) {
        case "Spotify":
          await connectSpotify();
          break;
        case "YouTube Music":
          await connectYoutubeMusic();
          break;
        default:
          console.error("Unknown provider:", provider);
          return;
      }

      // ✅ Fetch user profile after connecting a new service
      const userData = await fetchUser();
      if (userData) setUser(userData);
      console.log("🔗 Connected to", provider);
      console.log("👤 User data:", userData);
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      if (response.success) {
        setUser(response.user);
      } else {
        console.warn("Login failed:", response.message);
      }
      return response;
    } catch (error) {
      console.error("Unexpected error during login:", error);
      return {success: false, message: "An unexpected error occurred"};
    }
  };
  // ✅ Register function
  const register = async (email, password, reEnterPassword) => {
    try {
      const response = await registerUser(email, password, reEnterPassword);
      if (response.success) {
        setUser(response.user);
      } else {
        console.warn("Registration failed:", response.message);
      }
      return response;
    } catch (error) {
      console.error("Unexpected error during registration:", error);
      return {success: false, message: "An unexpected error occurred"};
    }
  };

  // ✅ Updated logout function to wait for backend before redirecting
  const logout = async () => {
    try {
      const response = await logoutUser();
      setUser(null); // ✅ Always clear user state

      if (!response.success) {
        console.warn("Logout request failed:", response.message);
      }
      return response;
    } catch (error) {
      setUser(null); // ✅ Ensure state is cleared even on unexpected errors
      console.error("Unexpected error during logout:", error);
      return {success: false, message: "An unexpected error occurred"};
    }
  };
  return (
    <AuthContext.Provider value={{user, loading, login, register, logout, connect}}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
