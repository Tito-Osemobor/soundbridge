import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

const withPublic = (Component) => {
  return function PublicRoute(props) {
    const { user } = useAuth();
    const router = useRouter();

    if (typeof window !== "undefined" && user) {
      router.replace("/hub");
      return null;
    }

    return <Component {...props} />;
  };
};

export default withPublic;
