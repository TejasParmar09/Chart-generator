import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the FileContext
const FileContext = createContext();

// FileProvider component to wrap the app and provide the context
export const FileProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch files from the backend when the component mounts
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/files'); // Adjust the endpoint as needed
        if (!response.ok) {
          throw new Error('Failed to fetch files');
        }
        const data = await response.json();

        // Ensure the fetched data matches the expected structure
        const formattedFiles = data.map((file) => ({
          id: file.id,
          name: file.name,
          data: file.data || [], // Ensure this matches your API response
          chartType: file.chartType || 'bar', // Default to 'bar' if not provided
          xAxis: file.xAxis || 'name',
          yAxis: file.yAxis || ['men'],
          xAxisOptions: file.xAxisOptions || [{ value: 'name', label: 'Name' }],
          yAxisOptions: file.yAxisOptions || [
            { value: 'men', label: 'Men' },
            { value: 'women', label: 'Women' },
            { value: 'children', label: 'Children' },
          ],
        }));

        setFiles(formattedFiles);
        console.log('FileContext - Fetched and formatted files:', formattedFiles);
      } catch (err) {
        setError(err.message);
        console.error('FileContext - Error fetching files:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []); // Empty dependency array to fetch only on mount

  // Function to add a new file (and optionally save to backend)
  const addFile = async (newFile) => {
    try {
      // Optionally send the new file to the backend
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFile),
      });

      if (!response.ok) {
        throw new Error('Failed to save file to backend');
      }

      const savedFile = await response.json();

      // Update the local state with the saved file (ensure it matches the expected structure)
      setFiles((prevFiles) => {
        const updatedFiles = [...prevFiles, savedFile];
        console.log('FileContext - Updated files after adding:', updatedFiles);
        return updatedFiles;
      });
    } catch (err) {
      setError(err.message);
      console.error('FileContext - Error adding file:', err);
    }
  };

  // Function to delete a file by ID (and optionally remove from backend)
  const deleteFile = async (fileId) => {
    try {
      // Optionally delete the file from the backend
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete file from backend');
      }

      // Update the local state
      setFiles((prevFiles) => {
        const updatedFiles = prevFiles.filter((file) => file.id !== fileId);
        console.log('FileContext - Updated files after deletion:', updatedFiles);
        return updatedFiles;
      });
    } catch (err) {
      setError(err.message);
      console.error('FileContext - Error deleting file:', err);
    }
  };

  return (
    <FileContext.Provider value={{ files, addFile, deleteFile, loading, error }}>
      {children}
    </FileContext.Provider>
  );
};

// Custom hook to use the FileContext
export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};