import {createContext, useContext, useState, useEffect} from "react";
import {connectSpotify} from "@/services/auth/spotifyAuthService";
import {connectYoutubeMusic} from "@/services/auth/youtubeAuthService";
import {fetchUser, logoutUser, loginUser, registerUser} from "@/services/auth/authService";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = Cookies.get("soundbridgeUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      console.log("👤 Stored user found in cookies:", storedUser);
    } else {
      console.warn("⚠️ No stored user found in cookies.");
      setUser(null);
    }
    setLoading(false);
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

        // ✅ Store user data in a client-side cookie
        Cookies.set("soundbridgeUser", JSON.stringify(response.user), { expires: 7 });

        return response;
      } else {
        console.error("Login failed:", response.message);
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };
  // ✅ Register function
  const register = async (email, password, reEnterPassword) => {
    try {
      const response = await registerUser(email, password, reEnterPassword);
      if (response.success) {
        setUser(response.user);
        // ✅ Store user data in a client-side cookie
        Cookies.set("soundbridgeUser", JSON.stringify(response.user), { expires: 7 });

        return response;
      } else {
        console.error("Registration failed:", response.message);
      }
    } catch (error) {
      console.error("Error registering:", error);
    }
  };

  // ✅ Updated logout function to wait for backend before redirecting
  const logout = async () => {
    try {
      const response = await logoutUser();
      if (response.success) {
        setUser(null);

        // ✅ Remove the cookie on logout
        Cookies.remove("soundbridgeUser");

        return response;
      } else {
        console.error("Logout failed:", response);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{user, loading, login, register, logout, connect}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
