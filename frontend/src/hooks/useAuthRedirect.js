import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

const useAuthRedirect = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/hub"); // ✅ Redirect if authenticated
      } else {
        setIsCheckingAuth(false); // ✅ Show UI once auth check completes
      }
    }
  }, [user, loading, router]);

  return isCheckingAuth;
};

export default useAuthRedirect;
