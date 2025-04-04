import {useAuth} from "@/context/AuthContext";
import {toast} from "react-toastify";
import {removePendingConnection} from "@/store/platformSlice";
import {useDispatch} from "react-redux";

export const usePlatformConnection = () => {
  const {connect} = useAuth();
  const dispatch = useDispatch();

  const connectToPlatform = async (platformId) => {
    try {
      const result = await connect(platformId);

      if (!result.success) {
        if (["USER_CLOSED", "PLATFORM_REJECTED", "TIMEOUT", "POPUP_BLOCKED"].includes(result.errorType)) {
          console.warn(`[PlatformConnection] ${platformId} connection ended early:`, result.message);
        } else {
          console.warn(`[PlatformConnection] ${platformId} failed unexpectedly:`, result.message);
        }
        dispatch(removePendingConnection(platformId));
        toast.error(result.message || "Could not connect to platform.");
      } else {
        toast.success(`Successfully connected to ${platformId}`);
      }

      return result;
    } catch (err) {
      console.error("Connection threw unexpectedly:", err);
      toast.error("An unexpected error occurred.");
      return { success: false };
    }
  };

  return {
    connectToPlatform
  };
};
