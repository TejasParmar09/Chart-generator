import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview'); // Tabs: overview, users, files, activity
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFiles: 0,
    totalCharts: 0,
  });
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // Mock data fetching (replace with API calls in a real app)
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalUsers: 25,
        totalFiles: 150,
        totalCharts: 300,
      });
      setUsers([
        { id: 1, username: 'john_doe', email: 'john@example.com', filesUploaded: 10, isBanned: false },
        { id: 2, username: 'jane_smith', email: 'jane@example.com', filesUploaded: 5, isBanned: true },
        { id: 3, username: 'alice_jones', email: 'alice@example.com', filesUploaded: 8, isBanned: false },
      ]);
      setFiles([
        { id: 1, name: 'data1.xml', uploadedBy: 'john_doe', date: '2025-05-10', size: '1.2 MB' },
        { id: 2, name: 'data2.xml', uploadedBy: 'jane_smith', date: '2025-05-11', size: '0.8 MB' },
        { id: 3, name: 'data3.xml', uploadedBy: 'alice_jones', date: '2025-05-12', size: '2.0 MB' },
      ]);
      setActivityLogs([
        { id: 1, user: 'john_doe', action: 'Uploaded file data1.xml', timestamp: '2025-05-10 10:30 AM' },
        { id: 2, user: 'jane_smith', action: 'Generated chart', timestamp: '2025-05-11 02:15 PM' },
        { id: 3, user: 'alice_jones', action: 'Uploaded file data3.xml', timestamp: '2025-05-12 09:45 AM' },
      ]);
      setIsLoading(false);
      toast.success('Admin data loaded successfully.');
    }, 1000);
  }, []);

  const handleBanUser = (userId, isBanned) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, isBanned: !isBanned } : user
    ));
    toast.success(`User ${isBanned ? 'unbanned' : 'banned'} successfully.`);
  };

  const handleDeleteFile = (fileId) => {
    setFiles(files.filter(file => file.id !== fileId));
    toast.success('File deleted successfully.');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toaster for notifications */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <header className="bg-indigo-700 text-white p-6 shadow-md">
        <h1 className="text-3xl font-bold text-center">Admin Panel - Data Visualization Dashboard</h1>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md h-screen p-4">
          <nav>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-2 rounded-md font-semibold transition-colors duration-300 ${
                    activeTab === 'overview'
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full text-left px-4 py-2 rounded-md font-semibold transition-colors duration-300 ${
                    activeTab === 'users'
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  Manage Users
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('files')}
                  className={`w-full text-left px-4 py-2 rounded-md font-semibold transition-colors duration-300 ${
                    activeTab === 'files'
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  Manage Files
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`w-full text-left px-4 py-2 rounded-md font-semibold transition-colors duration-300 ${
                    activeTab === 'activity'
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  Activity Logs
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <ClipLoader color="#4F46E5" size={50} />
              <span className="ml-3 text-gray-600">Loading admin data...</span>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <section>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Users</h3>
                      <p className="text-3xl font-bold text-indigo-700">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Files Uploaded</h3>
                      <p className="text-3xl font-bold text-indigo-700">{stats.totalFiles}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Charts Generated</h3>
                      <p className="text-3xl font-bold text-indigo-700">{stats.totalCharts}</p>
                    </div>
                  </div>
                </section>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <section>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Users</h2>
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 text-gray-700">Username</th>
                          <th className="py-3 px-4 text-gray-700">Email</th>
                          <th className="py-3 px-4 text-gray-700">Files Uploaded</th>
                          <th className="py-3 px-4 text-gray-700">Status</th>
                          <th className="py-3 px-4 text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{user.username}</td>
                            <td className="py-3 px-4">{user.email}</td>
                            <td className="py-3 px-4">{user.filesUploaded}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-sm ${
                                  user.isBanned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}
                              >
                                {user.isBanned ? 'Banned' : 'Active'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleBanUser(user.id, user.isBanned)}
                                className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors duration-300 ${
                                  user.isBanned
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : 'bg-red-500 text-white hover:bg-red-600'
                                }`}
                              >
                                {user.isBanned ? 'Unban' : 'Ban'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Files Tab */}
              {activeTab === 'files' && (
                <section>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Files</h2>
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 text-gray-700">Filename</th>
                          <th className="py-3 px-4 text-gray-700">Uploaded By</th>
                          <th className="py-3 px-4 text-gray-700">Date</th>
                          <th className="py-3 px-4 text-gray-700">Size</th>
                          <th className="py-3 px-4 text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {files.map(file => (
                          <tr key={file.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{file.name}</td>
                            <td className="py-3 px-4">{file.uploadedBy}</td>
                            <td className="py-3 px-4">{file.date}</td>
                            <td className="py-3 px-4">{file.size}</td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleDeleteFile(file.id)}
                                className="px-4 py-2 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 transition-colors duration-300"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Activity Logs Tab */}
              {activeTab === 'activity' && (
                <section>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Activity Logs</h2>
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <ul className="space-y-4">
                      {activityLogs.map(log => (
                        <li key={log.id} className="border-b pb-2">
                          <p className="text-gray-700">
                            <span className="font-semibold">{log.user}</span> {log.action} at {log.timestamp}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-indigo-700 text-white p-4 text-center">
        <p>© 2025 Data Visualization Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AdminPanel;