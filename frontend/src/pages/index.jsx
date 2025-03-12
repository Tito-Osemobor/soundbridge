import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen select-none">
      <Navbar />
      <main className="flex flex-col items-center justify-center flex-grow text-center">
        <h1 className="text-8xl font-bold">SoundBridge</h1>
        <p className="text-3xl mt-2 text-gray-600">
          Seamlessly transfer your music across platforms
        </p>
      </main>
      <Footer />
    </div>
  );
}
