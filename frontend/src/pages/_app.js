import {Inter} from "next/font/google"; // Global styles
import "@/globals.css";
import {AuthProvider} from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div className={`bg-grid min-h-screen ${inter.className}`}>
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}
