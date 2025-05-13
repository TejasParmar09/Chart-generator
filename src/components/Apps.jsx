import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import UploadedFiles from '../Pages/UploadedFiles';
import XmlUploader from './XmlUploader';
import { FileProvider, useFiles } from './FileContext';

const Dashboard = () => {
  const { addFile, loading, error } = useFiles();
  const [currentGraph, setCurrentGraph] = useState(null);
  const [localError, setLocalError] = useState(null);

  const parseXml = (file) => {
    // Mock XML parsing (replace with actual parsing logic if needed)
    const parsedData = [
      { name: file.name.split('.')[0], men: 1200, women: 1300, children: 900 },
      { name: 'Sample', men: 800, women: 950, children: 600 },
    ];
    console.log('App.jsx - Parsed XML data:', parsedData);
    return parsedData;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const parsedData = parseXml(file);
        const newFile = {
          id: Date.now(), // Temporary ID (backend will assign a real ID)
          name: file.name,
          data: parsedData,
          chartType: 'bar',
          xAxis: 'name',
          yAxis: ['men'],
          xAxisOptions: [{ value: 'name', label: 'Name' }],
          yAxisOptions: [
            { value: 'men', label: 'Men' },
            { value: 'women', label: 'Women' },
            { value: 'children', label: 'Children' },
          ],
        };

        console.log('App.jsx - New file to be added:', newFile);
        await addFile(newFile); // Use context to add the file (includes backend call)
        setCurrentGraph(newFile);
      } catch (err) {
        setLocalError('Failed to upload file. Please try again.');
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-8 font-roboto">
        Dashboard
      </h1>
      {error && (
        <p className="text-red-500 text-center whitespace-pre-line mb-4 font-roboto">
          {error}
        </p>
      )}
      {localError && (
        <p className="text-red-500 text-center whitespace-pre-line mb-4 font-roboto">
          {localError}
        </p>
      )}
      {loading ? (
        <p className="text-gray-600 text-center font-roboto">Loading...</p>
      ) : (
        <>
          <div className="mb-6">
            <label className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-roboto cursor-pointer">
              Upload New File
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
          {currentGraph && (
            <div className="mb-6 bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 font-roboto">
                Graph Preview: {currentGraph.name}
              </h2>
              <XmlUploader
                data={currentGraph.data}
                chartType={currentGraph.chartType}
                xAxis={currentGraph.xAxis}
                yAxis={currentGraph.yAxis}
                xAxisOptions={currentGraph.xAxisOptions}
                yAxisOptions={currentGraph.yAxisOptions}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Apps = () => {
  return (
    <FileProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <nav className="p-4 bg-white shadow-md">
            <Link to="/" className="px-4 py-2 text-blue-500 hover:text-blue-600 font-roboto">
              Dashboard
            </Link>
            <Link to="/uploaded-files" className="px-4 py-2 text-blue-500 hover:text-blue-600 font-roboto">
              Uploaded Files
            </Link>
          </nav>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/uploaded-files" element={<UploadedFiles />} />
          </Routes>
        </div>

        <style jsx>{`
          .font-roboto {
            font-family: 'Roboto', sans-serif;
          }
        `}</style>
      </Router>
    </FileProvider>
  );
};

export default Apps;