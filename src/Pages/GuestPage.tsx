import { Link } from "react-router-dom";

const GuestPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-600 via-red-400 to-purple-500 animate-gradient-slow text-white font-sans">
      <div className="bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-3xl p-8 sm:p-12 shadow-2xl border border-white border-opacity-20 max-w-lg w-full transform transition-transform duration-300 hover:scale-105">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-shadow-lg text-center">
          Welcome!
        </h1>
        <p className="text-lg sm:text-xl mb-8 opacity-80 text-center">
          Please log in or register to continue.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link to="/login" className="w-full sm:w-auto">
            <button className="w-full px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75">
              Login
            </button>
          </Link>
          <Link to="/register" className="w-full sm:w-auto">
            <button className="w-full px-8 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75">
              Register
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuestPage;
