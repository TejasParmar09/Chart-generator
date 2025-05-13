import React, { useState } from 'react';
import { FaTwitter, FaLinkedin, FaGithub, FaEdit, FaSave, FaSignOutAlt } from 'react-icons/fa';

// Default user data (replace with dynamic data from API or state)
const defaultUser = {
  username: 'JaneDoe',
  email: 'janedoe@example.com',
  phone: '+1 234-567-8900',
  location: 'New York, USA',
  bio: 'Passionate developer and tech enthusiast. Love building intuitive and scalable web applications.',
  joinDate: 'March 10, 2022',
  socialLinks: {
    twitter: 'https://twitter.com/janedoe',
    linkedin: 'https://linkedin.com/in/janedoe',
    github: 'https://github.com/janedoe',
  },
};

const Profile = ({ user = defaultUser }) => {
  const [profilePicture, setProfilePicture] = useState('https://via.placeholder.com/150');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  // Handle profile picture upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfilePicture(imageUrl);
    }
  };

  // Toggle edit mode and save changes
  const toggleEdit = () => {
    if (isEditing) {
      // Save changes (you can add API call here to update user data)
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  // Handle input changes for editable fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  // Handle logout (replace with actual logout logic)
  const handleLogout = () => {
    alert('Logged out successfully!');
    // Add logout logic (e.g., clear auth token, redirect to login)
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 hover:shadow-2xl">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <img
              src={profilePicture}
              alt="Profile"
              className="w-40 h-40 rounded-full border-4 border-blue-500 mb-4 transition-transform duration-300 group-hover:scale-105"
            />
            {/* Overlay for image upload */}
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
              <span className="text-white text-sm font-roboto">Change Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 font-roboto">{user.username}</h2>
        </div>

        {/* User Information */}
        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-roboto">Email:</span>
            <span className="text-gray-800 font-roboto">{user.email}</span>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-roboto">Phone:</span>
            {isEditing ? (
              <input
                type="text"
                name="phone"
                value={editedUser.phone}
                onChange={handleInputChange}
                className="border p-1 rounded w-2/3 text-gray-800 font-roboto"
              />
            ) : (
              <span className="text-gray-800 font-roboto">{editedUser.phone}</span>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-roboto">Location:</span>
            {isEditing ? (
              <input
                type="text"
                name="location"
                value={editedUser.location}
                onChange={handleInputChange}
                className="border p-1 rounded w-2/3 text-gray-800 font-roboto"
              />
            ) : (
              <span className="text-gray-800 font-roboto">{editedUser.location}</span>
            )}
          </div>

          {/* Bio */}
          <div className="flex flex-col">
            <span className="text-gray-600 font-roboto">Bio:</span>
            {isEditing ? (
              <textarea
                name="bio"
                value={editedUser.bio}
                onChange={handleInputChange}
                className="border p-1 rounded w-full text-gray-800 font-roboto mt-1"
                rows="3"
              />
            ) : (
              <p className="text-gray-800 font-roboto mt-1">{editedUser.bio}</p>
            )}
          </div>

          {/* Join Date */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-roboto">Joined:</span>
            <span className="text-gray-800 font-roboto">{user.joinDate}</span>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="flex justify-center space-x-4 mt-6">
          {user.socialLinks.twitter && (
            <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
              <FaTwitter className="text-blue-500 text-2xl hover:text-blue-600 transition-colors duration-300" />
            </a>
          )}
          {user.socialLinks.linkedin && (
            <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
              <FaLinkedin className="text-blue-700 text-2xl hover:text-blue-800 transition-colors duration-300" />
            </a>
          )}
          {user.socialLinks.github && (
            <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer">
              <FaGithub className="text-gray-800 text-2xl hover:text-gray-900 transition-colors duration-300" />
            </a>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-2 mt-6">
          <button
            onClick={toggleEdit}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-roboto transition-colors duration-300"
          >
            {isEditing ? (
              <>
                <FaSave className="mr-2" /> Save
              </>
            ) : (
              <>
                <FaEdit className="mr-2" /> Edit Profile
              </>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-roboto transition-colors duration-300"
          >
            <FaSignOutAlt className="mr-2" /> Logout
          </button>
        </div>
      </div>

      {/* Inline style to apply Roboto font */}
      <style jsx>{`
        .font-roboto {
          font-family: 'Roboto', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default Profile;