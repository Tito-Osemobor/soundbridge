import {useState} from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {useAuth} from "@/context/AuthContext";
import Button from "@/components/Button";
import Input from "@/components/Input";
import {useRouter} from "next/router";

const Register = () => {
  const {register} = useAuth();
  const [registerData, setRegisterData] = useState({email: "", password: "", reEnterPassword: ""});
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleInputChange = (e) => {
    const {id, value} = e.target;
    setRegisterData((prev) => ({...prev, [id]: value}));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (registerData.password !== registerData.reEnterPassword) {
      setError("Passwords do not match.");
      return;
    }
    await router.push("/hub"); // ✅ Redirect user after registration

    const response = await register(registerData.email, registerData.password, registerData.reEnterPassword);
    if (!response?.success) {
      setError(response?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen select-none">
      <Navbar/>
      <div className="flex-grow flex items-center justify-center text-white">
        <div className="p-8 border border-gray-300 bg-white rounded-lg shadow-lg w-[500px] text-center relative">
          {/* Title */}
          <h2 className="text-4xl text-black font-black mb-6">Sign Up</h2>

          {/* Register Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && <p className="text-red-500">{error}</p>}
            <Input id="email" type="email" placeHolder="Enter Email" value={registerData.email}
                   onChange={handleInputChange}/>
            <Input id="password" type="password" placeHolder="Enter Password" value={registerData.password}
                   onChange={handleInputChange}/>
            <Input id="reEnterPassword" type="password" placeHolder="Re-enter Password"
                   value={registerData.reEnterPassword} onChange={handleInputChange}/>
            <Button type="submit">Sign Up</Button>
          </form>

          {/* Switch to Log in */}
          <div className="mt-4 text-sm text-gray-600">
            <p>
              Already have an account?{" "}
              <span
                className="text-black cursor-pointer font-bold"
                onClick={() => (router.push("/login"))}
              >
                Sign in!
              </span>
            </p>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Register;
