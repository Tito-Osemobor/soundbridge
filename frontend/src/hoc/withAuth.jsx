import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

const withAuth = (Component) => {
  return function ProtectedRoute(props) {
    const { user } = useAuth();
    const router = useRouter();

    if (typeof window !== "undefined" && !user) {
      router.replace("/login");
      return null;
    }

    return <Component {...props} />;
  };
};

export default withAuth;
