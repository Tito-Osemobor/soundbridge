import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

const useRequireAuth = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if ( user === null) {
      router.push("/login");
    }
  }, [user, router]);

  return user;
};

export default useRequireAuth;
