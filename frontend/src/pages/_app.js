import {Inter} from "next/font/google"; // Global styles
import {AuthProvider} from "@/context/AuthContext";
import {Provider} from "react-redux";
import store from "@/store"; // Redux store
import "@/globals.css";
import {ToastContainer} from "react-toastify";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function MyApp({Component, pageProps}) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <div className={`bg-grid min-h-screen ${inter.className}`}>
          <Component {...pageProps} />
          <ToastContainer />
        </div>
      </AuthProvider>
    </Provider>
  );
}
