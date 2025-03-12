import {useState} from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import useAuthRedirect from "@/hooks/useAuthRedirect";
import {useAuth} from "@/context/AuthContext";
import Button from "@/components/Button";
import Input from "@/components/Input";
import {useRouter} from "next/router";

const Login = () => {
  const {login} = useAuth();
  const [loginData, setLoginData] = useState({email: "", password: ""});
  const [error, setError] = useState(null);
  const router = useRouter();


  const handleInputChange = (e) => {
    const {id, value} = e.target;
    setLoginData((prev) => ({...prev, [id]: value}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const response = await login(loginData.email, loginData.password);
    if (!response?.success) {
      setError(response?.message || "Login failed. Please try again.");
      return;
    }
    await router.push("/hub");

  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen select-none">
      <Navbar/>
      <div className="flex-grow flex items-center justify-center text-white">
        <div className="p-8 border border-gray-300 bg-white rounded-lg shadow-lg w-[500px] text-center relative">
          {/* Title */}
          <h2 className="text-4xl text-black font-black mb-6">Sign In</h2>

          {/* Login Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && <p className="text-red-500">{error}</p>}
            <Input id="email" type="email" placeHolder="Enter Email" value={loginData.email}
                   onChange={handleInputChange}/>
            <Input id="password" type="password" placeHolder="Enter Password" value={loginData.password}
                   onChange={handleInputChange}/>
            <Button type="submit">Sign In</Button>
          </form>

          {/* Switch to Register */}
          <div className="mt-4 text-sm text-gray-600">
            <p>
              New to SoundBridge?{" "}
              <span
                className="text-black cursor-pointer font-bold"
                onClick={() => (router.push("/register"))}
              >
                Sign up!
              </span>
            </p>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Login;
