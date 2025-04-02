import { useAuth } from "@/context/AuthContext";
import {useEffect, useState} from "react";
import LoaderAnimation from "@/components/LoaderAnimation";

const withLoader = (Component) => {
  return function WrappedWithLoader(props) {
    const { loading } = useAuth();
    const [delayDone, setDelayDone] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setDelayDone(true), 2000); // 1.2s fixed splash
      return () => clearTimeout(timer);
    }, []);

    const showSplash = loading || !delayDone;

    return (
      <>
        <Component {...props} />
        {showSplash && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
            <LoaderAnimation />
          </div>
        )}
      </>
    );
  };
};

export default withLoader;
