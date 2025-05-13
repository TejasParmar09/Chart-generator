import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="w-64 bg-indigo-800 text-white min-h-screen p-6 shadow-lg">
      <h3 className="text-2xl font-bold text-indigo-200 mb-6">Pages</h3>
      <ul className="space-y-4">
        <li>
           <Link 
            to="/AdminPanel" 
            className="text-lg font-semibold text-white hover:text-indigo-200 transition-colors duration-300"
          >
            Admin Panel
          </Link>
          </li>
          <li>
          <Link 
            to="/dashboard" 
            className="text-lg font-semibold text-white hover:text-indigo-200 transition-colors duration-300"
          >
            User Panel
          </Link>
        </li>
        <li>
          <Link 
            to="/profile" 
            className="text-lg font-semibold text-white hover:text-indigo-200 transition-colors duration-300"
          >
            Profile
          </Link>
        </li>
        <li>
          <Link 
            to="/uploaded-files" 
            className="text-lg font-semibold text-white hover:text-indigo-200 transition-colors duration-300"
          >
            Uploaded Files
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;