import React from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault(); // Prevent form submission default behavior
    // Mock Signup (replace with actual logic)
    navigate('/login'); // Redirect to Login page after signup
  };

  const handleGoogleSignup = () => {
    // Mock Google Signup (replace with actual Google OAuth logic)
    console.log("Initiating Google Signup...");
    navigate('/login'); // Redirect to Login page after Google signup
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-indigo-600 mb-6 text-center">Sign Up</h2>
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Full Name"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-300"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-6 flex items-center justify-center">
          <button
            onClick={handleGoogleSignup}
            className="flex items-center bg-white text-gray-700 font-semibold py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors duration-300"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M44.5 20H24v8.5h11.8c-1.8 5.1-6.6 8.5-11.8 8.5-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 1.1 8.3 2.9l6.4-6.4C34.7 3.5 29.6 1 24 1 10.7 1 0 11.7 0 25s10.7 24 24 24c11.6 0 21.3-8.2 23.5-19.1L44.5 20z"
                fill="#4285F4"
              />
              <path
                d="M0 25c0-5.1 1.7-9.8 4.5-13.6l6.4 6.4C9.2 20.1 8 22.5 8 25s1.2 4.9 2.9 7.1l-6.4 6.4C1.7 34.8 0 30.1 0 25z"
                fill="#34A853"
              />
              <path
                d="M24 8.5c5.2 0 9.9 2.1 13.3 5.5l-6.4 6.4C29.1 18.5 26.6 17 24 17c-5.2 0-9.5 4.3-9.5 9.5s4.3 9.5 9.5 9.5c4.3 0 7.9-2.9 9.1-6.8H24V20h20.5c.3 1.8.5 3.6.5 5.5 0 13.3-10.7 24-24 24S0 38.3 0 25 10.7 1 24 1c5.6 0 10.7 2.5 14.5 6.5l-6.4 6.4C29.9 10.5 27 8.5 24 8.5z"
                fill="#FBBC05"
              />
              <path
                d="M10.9 31.9c2.2 2.9 5.4 5.1 9.1 6.2l6.4-6.4c-1.8-1.1-3.3-2.7-4.3-4.6H10.9v4.8z"
                fill="#EA4335"
              />
            </svg>
            Sign Up with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;