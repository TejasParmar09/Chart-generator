import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";


import Dashboard from "./Pages/Dashboard";
import Profile from "./Pages/Profile";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import UploadedFiles from "./Pages/UploadedFiles";
import AdminPanel from "./Pages/AdminPanel";

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div style={{ display: "flex" }}>
          <Sidebar />
          <div style={{ flex: 1, padding: "1rem" }}>
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/AdminPanel" element={<AdminPanel/>}/>
              <Route path="/dashboard" element={<Dashboard/>} />
              <Route path="/profile" element={< Profile/>} />
              <Route path="/login" element={< Login/>} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/uploaded-files" element={<UploadedFiles />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
