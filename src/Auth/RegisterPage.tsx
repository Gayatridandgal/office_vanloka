import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../Services/AuthService";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e: any) => {
    e.preventDefault();
    try {
      await register({ username, email, password });
      navigate("/login"); // Redirect to login page after successful registration
    } catch (err) {
      setError("Failed to register. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-purple-800 via-purple-600 to-pink-500 animate-gradient-slow text-white font-sans">
      <style>{`
                @keyframes gradient-slow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                .animate-gradient-slow {
                    background-size: 400% 400%;
                    animation: gradient-slow 5s ease infinite;
                }
            `}</style>

      <div className="bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-3xl p-8 sm:p-12 shadow-2xl border border-white border-opacity-20 max-w-lg w-full transform transition-transform duration-300">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-shadow-lg text-center">
          Sign Up
        </h2>
        <p className="text-lg sm:text-xl mb-8 opacity-80 text-center">
          Join us today! Fill out the form below.
        </p>
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white opacity-80 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-full text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 transition-all duration-200"
              placeholder="Your unique username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white opacity-80 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-full text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 transition-all duration-200"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white opacity-80 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-full text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 transition-all duration-200"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <p className="text-red-300 text-center text-sm mt-4">{error}</p>
          )}
          <button
            type="submit"
            className="w-full px-8 py-3 mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm mt-8 opacity-70">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-white hover:text-purple-300 transition-colors duration-200"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
