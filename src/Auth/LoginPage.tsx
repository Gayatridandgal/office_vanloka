import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../Services/AuthService"; // Your refactored service
import logo from "../../public/logo.avif";
import type { User } from "../Types/Index";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login({ email, password } as User);

      navigate("/dashboard");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";

      setError(errorMessage);
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-purple-50 animate-gradient-slow text-white font-sans">
      <div className="bg-opacity-10 bg-white backdrop-filter backdrop-blur-sm rounded-xl p-8 sm:p-12 shadow-2xl max-w-lg w-full transform transition-transform duration-300">
        <div className="flex justify-center">
          <img
            src={logo}
            alt="Company Logo"
            className="rounded-lg w-1/2 h-13 shadow-xl"
          />
        </div>
        <h2 className="text-4xl mt-5 font-bold mb-4 text-shadow-lg text-center text-purple-600">
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm text-black font-medium mb-1">
              Email<span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white bg-opacity-20 border border-black border-opacity-30 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 transition-all duration-200"
              placeholder="Email"
            />
          </div>
          <div>
            <label className="block text-sm text-black font-medium  mb-1">
              Password<span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white bg-opacity-20 border border-black border-opacity-30 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 transition-all duration-200"
              placeholder="Password"
            />
          </div>
          {error && (
            <p className="text-red-500 bg-red-100 p-2 rounded-md text-center text-sm mt-4">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full px-8 py-3 mt-5 mb-5 bg-purple-900 hover:bg-purple-950 text-white font-semibold rounded-lg shadow-lg"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
