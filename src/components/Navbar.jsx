import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left side - Navigation Links */}
        <div className="flex space-x-6">

          <Link 
            to="/AdminPanel" 
            className="text-white font-semibold text-lg hover:text-indigo-200 transition-colors duration-300"
          >
            Admin Panel
          </Link>

          <Link 
            to="/dashboard" 
            className="text-white font-semibold text-lg hover:text-indigo-200 transition-colors duration-300"
          >
            Dashboard
          </Link>
          <Link 
            to="/profile" 
            className="text-white font-semibold text-lg hover:text-indigo-200 transition-colors duration-300"
          >
            Profile
          </Link>
          <Link 
            to="/uploaded-files" 
            className="text-white font-semibold text-lg hover:text-indigo-200 transition-colors duration-300"
          >
            Uploaded Files
          </Link>
        </div>

        {/* Right side - Login and Sign Up Buttons */}
        <div className="flex space-x-4">
          <Link 
            to="/login" 
            className="bg-white text-indigo-600 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-100 transition-colors duration-300"
          >
            Login
          </Link>
          <Link 
            to="/signup" 
            className="bg-indigo-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-900 transition-colors duration-300"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;