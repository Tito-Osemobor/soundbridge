import Link from "next/link";
import Button from "@/components/Button";
import {useAuth} from "@/context/AuthContext";
import {useRouter} from "next/router";

const Navbar = () => {
  const {user, logout} = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const response = await logout();
    if (response.success) {
      await router.replace("/");
    }
  }

  return (
    <nav className="w-full pt-3 text-center select-none">
      <div
        className={`flex justify-between items-center p-4 text-white border border-gray-300 bg-white rounded-lg max-w-[600px] mx-auto`}>
        {/* Logo/Brand */}
        <Link href={"/"}><h1 className="text-xl text-black">SoundBridge</h1></Link>

        {/* Navigation Links */}
        <div className={`flex items-center gap-4`}>
          {user && router.pathname === "/hub" ? (
            <Button onClick={handleLogout} className="text-black hover:underline">Logout</Button>
          ) : (
            <>
              <Link href="/login" className="text-black hover:underline">Login</Link>
              <Button href="/register">Get Started</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
