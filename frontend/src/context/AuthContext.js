import {createContext, useContext, useEffect, useState} from "react";
import {oauthService} from "@/services/auth/oauthService";
import {fetchUser, loginUser, logoutUser, registerUser} from "@/services/auth/authService";
import {OAuthError, UserFetchFailedError} from "@/utils/errors";
import {resetApp} from "@/store/globalActions";
import {useDispatch} from "react-redux";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

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


  // ✅ Updated connect function to call oauthService
  const connect = async (platformId) => {
    try {
      await oauthService(platformId);

      const userData = await fetchUser();
      if (!userData) {
        console.warn("User data not returned after connecting platform.");
        throw new UserFetchFailedError(platformId);
      }

      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      if (error instanceof OAuthError && ["USER_CLOSED", "PLATFORM_REJECTED", "TIMEOUT", "POPUP_BLOCKED"].includes(error.type)) {
        console.warn(`[AuthContext] OAuth connection ended early for ${platformId}:`, error.message);
      } else {
        console.error("[AuthContext] Unexpected error during platform connection:", error);
      }

      try {
        if (error instanceof OAuthError) {
          return {
            success: false,
            errorType: error.type,
            platformId: error.platformId,
            message: error.message,
          };
        }

        // Catch-all for unexpected errors
        return {
          success: false,
          errorType: "UNKNOWN",
          platformId,
          message: error?.message || "An unknown error occurred.",
        };
      } catch (dispatchError) {
        console.error("Failed to remove pending connection:", dispatchError);

        return {
          success: false,
          errorType: "DISPATCH_ERROR",
          platformId,
          message: "Error dispatching pending connection cleanup.",
        };
      }
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
      dispatch(resetApp());
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
