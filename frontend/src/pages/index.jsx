import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import {useAuth} from "@/context/AuthContext";
import {useRouter} from "next/router";

const Home = () => {
  const {user} = useAuth();
  const router = useRouter();

  console.log(user);
  const handleClick = () => {
    if (user) {
      router.push("/hub");
    } else {
      router.push("/login");
    }
  }

  return (
    <div className="flex flex-col min-h-screen select-none">
      <Navbar/>
      <main className="flex flex-col items-center justify-center flex-grow text-center gap-3">
        <div>
          <h1 className="text-8xl font-bold">SoundBridge</h1>
          <p className="text-3xl mt-2 text-gray-600">
            Seamlessly transfer your music across platforms
          </p>
        </div>
        <Button className={`text-2xl py-3 px-5`} children={`Get Started`} onClick={handleClick}/>
      </main>
      <Footer/>
    </div>
  );
}

export default Home;
