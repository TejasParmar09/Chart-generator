import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import XmlUploader from '../components/XmlUploader';
import { useFiles } from '../components/FileContext';

const UploadedFiles = () => {
  const { files, deleteFile, loading, error } = useFiles();
  const [selectedFile, setSelectedFile] = useState(null);
  const [localError, setLocalError] = useState(null);
  const chartContainerRef = useRef(null);

  useEffect(() => {
    console.log('UploadedFilesPage.jsx - Received files from context:', files);
    if (error) {
      setLocalError(error);
    }
  }, [files, error]);

  const handleView = (file) => {
    try {
      setSelectedFile(file);
      console.log('UploadedFilesPage.jsx - Selected file:', file);
    } catch (err) {
      setLocalError('Failed to view file details. Please try again.');
    }
  };

  const handleDownload = () => {
    if (!selectedFile) return;

    try {
      const pdf = new jsPDF('portrait');
      let yOffset = 20;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('File Details', 20, yOffset);
      yOffset += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.text(`File Name: ${selectedFile.name || 'Unknown'}`, 20, yOffset);
      yOffset += 10;
      pdf.text(`X-Axis: ${selectedFile.xAxis || 'Unknown'}`, 20, yOffset);
      yOffset += 10;
      pdf.text(`Y-Axis: ${(selectedFile.yAxis || []).join(', ') || 'Unknown'}`, 20, yOffset);
      yOffset += 10;
      pdf.text(`Graph Type: ${selectedFile.chartType || 'Unknown'}`, 20, yOffset);
      yOffset += 20;

      const chartElement = chartContainerRef.current.querySelector('canvas') || chartContainerRef.current.querySelector('div');
      if (chartElement) {
        const canvas = chartElement.tagName === 'CANVAS' ? chartElement : chartElement.querySelector('canvas');
        if (canvas) {
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 170;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 20, yOffset, imgWidth, imgHeight);
        } else {
          import('plotly.js').then((Plotly) => {
            Plotly.toImage(chartElement, { format: 'png', width: 800, height: 500 }).then((imgData) => {
              const imgWidth = 170;
              const imgHeight = (500 * imgWidth) / 800;
              pdf.addImage(imgData, 'PNG', 20, yOffset, imgWidth, imgHeight);
              pdf.save(`${selectedFile.name || 'file'}-details.pdf`);
            });
          });
          return;
        }
      }

      pdf.save(`${selectedFile.name || 'file'}-details.pdf`);
    } catch (err) {
      setLocalError('Failed to download file details. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-8 font-roboto">
        Uploaded Files
      </h1>
      {localError && (
        <p className="text-red-500 text-center whitespace-pre-line mb-4 font-roboto">
          {localError}
        </p>
      )}
      {loading ? (
        <p className="text-gray-600 text-center font-roboto">Loading files...</p>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
          <div className="flex-1 bg-white p-6 rounded-lg shadow-lg min-h-[300px]">
            <h2 className="text-xl font-bold text-gray-800 mb-4 font-roboto">Files</h2>
            {files.length === 0 ? (
              <p className="text-gray-600 text-center font-roboto">No files uploaded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-3 text-gray-800 font-roboto">File Name</th>
                      <th className="p-3 text-gray-800 font-roboto">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file) => {
                      console.log('UploadedFilesPage.jsx - Rendering file:', file);
                      return (
                        <tr key={file.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-gray-800 font-roboto">{file.name || 'Unknown'}</td>
                          <td className="p-3 space-x-2">
                            <button
                              onClick={() => handleView(file)}
                              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-roboto transition-colors duration-300"
                            >
                              View
                            </button>
                            <button
                              onClick={() => deleteFile(file.id)}
                              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-roboto transition-colors duration-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex-1 bg-white p-6 rounded-lg shadow-lg min-h-[300px]">
            <h2 className="text-xl font-bold text-gray-800 mb-4 font-roboto">
              File Details
            </h2>
            {selectedFile ? (
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 font-roboto">
                    <span className="font-bold text-gray-800">File Name:</span> {selectedFile.name || 'Unknown'}
                  </p>
                  <p className="text-gray-600 font-roboto">
                    <span className="font-bold text-gray-800">X-Axis:</span> {selectedFile.xAxis || 'Unknown'}
                  </p>
                  <p className="text-gray-600 font-roboto">
                    <span className="font-bold text-gray-800">Y-Axis:</span> {(selectedFile.yAxis || []).join(', ') || 'Unknown'}
                  </p>
                  <p className="text-gray-600 font-roboto">
                    <span className="font-bold text-gray-800">Graph Type:</span> {selectedFile.chartType || 'Unknown'}
                  </p>
                </div>
                <div ref={chartContainerRef}>
                  {selectedFile.data ? (
                    <XmlUploader
                      data={selectedFile.data}
                      chartType={selectedFile.chartType}
                      xAxis={selectedFile.xAxis}
                      yAxis={selectedFile.yAxis}
                      xAxisOptions={selectedFile.xAxisOptions}
                      yAxisOptions={selectedFile.yAxisOptions}
                    />
                  ) : (
                    <p className="text-red-500 font-roboto">No data available for this file.</p>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-roboto transition-colors duration-300"
                  >
                    Download Details as PDF
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-center font-roboto">
                Select a file to view details.
              </p>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .font-roboto {
          font-family: 'Roboto', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default UploadedFiles;