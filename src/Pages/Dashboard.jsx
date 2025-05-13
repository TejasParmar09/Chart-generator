import React, { useState, useRef } from 'react';
import XmlUploader from '../components/XmlUploader.jsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Select from 'react-select';
import toast, { Toaster } from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';

const Dashboard = () => {
  const [files, setFiles] = useState([]); // Store all uploaded files
  const [selectedFileData, setSelectedFileData] = useState(null); // Data of the selected file
  const [isLoading, setIsLoading] = useState(false); // Loading state for file parsing
  const [selectedChart, setSelectedChart] = useState(null);
  const [selectedXAxis, setSelectedXAxis] = useState(null);
  const [selectedYAxes, setSelectedYAxes] = useState([]);
  const [xAxisOptions, setXAxisOptions] = useState([]);
  const [yAxisOptions, setYAxisOptions] = useState([]);
  const [warning, setWarning] = useState(null);
  const [isDragging, setIsDragging] = useState(false); // Drag-and-drop state
  const chartRef = useRef();

  // Handle file upload (both button and drag-and-drop)
  const handleFileUpload = (file) => {
    if (!file) {
      toast.error('No file selected.');
      return;
    }

    if (file.type !== 'text/xml') {
      toast.error('Please upload a valid XML file.');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(reader.result, 'text/xml');

        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
          throw new Error('Invalid XML format');
        }

        const root = Array.from(xmlDoc.childNodes).find(node => node.nodeType === 1);
        if (!root) throw new Error('No valid root element found in XML');

        const entries = Array.from(root.children);
        const data = entries.map(entry => {
          const entryData = {};
          Array.from(entry.attributes).forEach(attr => {
            entryData[attr.name] = isNaN(attr.value) ? attr.value : parseFloat(attr.value);
          });
          Array.from(entry.children).forEach(child => {
            const childName = child.tagName.toLowerCase();
            const childValue = child.textContent.trim();
            entryData[childName] = isNaN(childValue) ? childValue : parseFloat(childValue);
          });
          return entryData;
        });

        console.log('Parsed fileData:', data);
        if (data.length === 0) throw new Error('No data entries found in XML');

        const { xOptions, yOptions } = analyzeDataTypes(data);

        const newFile = {
          id: Date.now(),
          name: file.name,
          data,
          xAxisOptions: xOptions,
          yAxisOptions: yOptions,
        };

        setFiles(prevFiles => [...prevFiles, newFile]);
        toast.success(`File "${file.name}" uploaded successfully!`);
      } catch (error) {
        console.error('Error parsing XML:', error);
        toast.error('Failed to parse XML file. Using fallback data.');
        const fallbackData = getFallbackData();
        const { xOptions, yOptions } = analyzeDataTypes(fallbackData);
        const newFile = {
          id: Date.now(),
          name: file.name || 'fallback.xml',
          data: fallbackData,
          xAxisOptions: xOptions,
          yAxisOptions: yOptions,
        };
        setFiles(prevFiles => [...prevFiles, newFile]);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      toast.error('Error reading the file.');
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  const getFallbackData = () => [
    { state: 'California', men: 1000, women: 1200, children: 800, other: 300, total: 3300 },
    { state: 'Texas', men: 900, women: 1100, children: 700, other: 200, total: 2900 },
    { state: 'Florida', men: 800, women: 1000, children: 600, other: 150, total: 2550 },
  ];

  const analyzeDataTypes = (data) => {
    if (!Array.isArray(data) || data.length === 0) return { xOptions: [], yOptions: [] };

    const allKeys = new Set();
    data.forEach(entry => {
      Object.keys(entry).forEach(key => allKeys.add(key));
    });

    const xOptions = [];
    const yOptions = [];

    allKeys.forEach(key => {
      const values = data.map(item => item[key]);
      const isNumerical = values.every(val => typeof val === 'number' && !isNaN(val));
      const uniqueValues = new Set(values);
      const isTemporal = values.every(val => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      });

      if (!isNumerical || isTemporal || uniqueValues.size <= 10) {
        xOptions.push({
          value: key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
        });
      }

      if (isNumerical) {
        yOptions.push({
          value: key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
        });
      }
    });

    if (xOptions.length === 0) {
      allKeys.forEach(key => {
        xOptions.push({
          value: key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
        });
      });
    }

    if (yOptions.length === 0) {
      allKeys.forEach(key => {
        yOptions.push({
          value: key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
        });
      });
    }

    return { xOptions, yOptions };
  };

  // Drag-and-Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  // Select a file for chart generation
  const handleFileSelect = (file) => {
    if (!file.data || file.data.length === 0) {
      toast.error('Selected file has no data to display.');
      return;
    }

    setSelectedFileData(file.data);
    setXAxisOptions(file.xAxisOptions || []);
    setYAxisOptions(file.yAxisOptions || []);
    // Reset chart configuration states
    setSelectedChart(null);
    setSelectedXAxis(null);
    setSelectedYAxes([]);
    setWarning(null);
    toast.success(`Selected file: ${file.name}`);
  };

  // Clear all uploaded files
  const handleClearFiles = () => {
    setFiles([]);
    setSelectedFileData(null);
    setXAxisOptions([]);
    setYAxisOptions([]);
    setSelectedChart(null);
    setSelectedXAxis(null);
    setSelectedYAxes([]);
    setWarning(null);
    toast.success('All files cleared.');
  };

  const handleXAxisSelect = (selectedOption) => {
    setSelectedXAxis(selectedOption ? selectedOption.value : null);
    console.log('Selected X-axis:', selectedOption?.value);
  };

  const handleYAxesSelect = (selectedOptions) => {
    const selected = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedYAxes(selected);
    console.log('Selected Y-axes:', selected);

    if (selected.length > 0 && selectedFileData) {
      const allNumerical = selected.every(yKey => {
        const values = selectedFileData.map(item => item[yKey]);
        return values.every(val => typeof val === 'number' && !isNaN(val));
      });
      if (!allNumerical) {
        setWarning('Some selected Y-axis fields contain non-numerical data, which may not display correctly in charts.');
      } else {
        setWarning(null);
      }
    } else {
      setWarning(null);
    }
  };

  let filteredData = selectedFileData || [];
  if (filteredData.length === 0 && selectedFileData && selectedFileData.length > 0) {
    filteredData = selectedFileData;
    console.warn('filteredData is empty, using all selectedFileData as fallback:', filteredData);
  }

  const downloadImage = (format) => {
    if (!chartRef.current) {
      toast.error('Chart element not found.');
      return;
    }

    html2canvas(chartRef.current, { scale: 2 }).then((canvas) => {
      const image = canvas.toDataURL(`image/${format}`);
      const link = document.createElement('a');
      link.href = image;
      link.download = `chart.${format}`;
      link.click();
      toast.success(`Chart downloaded as ${format.toUpperCase()}.`);
    }).catch(err => {
      toast.error('Failed to download image: ' + err.message);
    });
  };

  const downloadPDF = () => {
    if (!chartRef.current) {
      toast.error('Chart element not found.');
      return;
    }

    html2canvas(chartRef.current, { scale: 2 }).then((canvas) => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('chart.pdf');
      toast.success('Chart downloaded as PDF.');
    }).catch(err => {
      toast.error('Failed to download PDF: ' + err.message);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toaster for notifications */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <header className="bg-indigo-700 text-white p-6 shadow-md">
        <h1 className="text-3xl font-bold text-center">Interactive Data Visualization Dashboard</h1>
      </header>

      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        {/* File Upload Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload XML Files</h2>
          <div
            className={`p-6 border-2 border-dashed rounded-xl transition-all duration-300 ${
              isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              {isLoading ? (
                <div className="flex justify-center items-center">
                  <ClipLoader color="#4F46E5" size={40} />
                  <span className="ml-3 text-gray-600">Parsing file...</span>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    Drag and drop an XML file here, or click to upload
                  </p>
                  <label className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md font-semibold text-sm md:text-base hover:bg-indigo-200 transition-colors duration-300 cursor-pointer">
                    Upload XML File
                    <input
                      type="file"
                      accept=".xml"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Uploaded Files Section */}
        {files.length > 0 && (
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                Uploaded Files
                <span className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-indigo-700 text-white rounded-full text-sm font-semibold">
                  {files.length}
                </span>
              </h2>
              <button
                onClick={handleClearFiles}
                className="px-4 py-2 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 transition-colors duration-300"
              >
                Clear All
              </button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <ul className="space-y-2">
                {files.map(file => (
                  <li
                    key={file.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors duration-200 ${
                      selectedFileData === file.data ? 'bg-indigo-100' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => handleFileSelect(file)}
                  >
                    <span className="text-gray-800">{file.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Chart Configuration Section */}
        {selectedFileData && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Configure Chart</h2>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="mb-6">
                <label className="block text-base md:text-lg font-semibold text-gray-700 mb-2">
                  Select X-Axis (Categorical or Temporal):
                </label>
                <Select
                  options={xAxisOptions}
                  onChange={handleXAxisSelect}
                  value={xAxisOptions.find(option => option.value === selectedXAxis) || null}
                  className="basic-single-select"
                  classNamePrefix="select"
                  placeholder="Select X-axis..."
                  styles={{
                    control: (base) => ({ ...base, borderRadius: '0.5rem', padding: '0.2rem' }),
                    option: (base) => ({ ...base, color: '#1f2937' }),
                  }}
                />
              </div>

              <div className="mb-6">
                <label className="block text-base md:text-lg font-semibold text-gray-700 mb-2">
                  Select Y-Axis (Numerical, Multiple):
                </label>
                <Select
                  isMulti
                  options={yAxisOptions}
                  onChange={handleYAxesSelect}
                  value={yAxisOptions.filter(option => selectedYAxes.includes(option.value))}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder="Select Y-axes..."
                  styles={{
                    control: (base) => ({ ...base, borderRadius: '0.5rem', padding: "0.2rem" }),
                    multiValue: (base) => ({ ...base, backgroundColor: '#e0e7ff', borderRadius: '0.25rem' }),
                  }}
                />
                {warning && (
                  <p className="mt-2 text-sm text-red-500">{warning}</p>
                )}
              </div>

              {selectedXAxis && selectedYAxes.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-base md:text-lg font-semibold text-gray-700 mb-3">
                    Select a Chart Type:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['bar', 'line', 'pie', 'scatter', '3d'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedChart(type)}
                        className={`px-4 py-2 rounded-md font-semibold text-sm md:text-base transition-colors duration-300 ${
                          selectedChart === type
                            ? 'bg-indigo-700 text-white'
                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                        }`}
                      >
                        {type === '3d' ? '3D Chart' : `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Chart Display Section */}
        {selectedChart && filteredData.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Generated Chart</h2>
            <div ref={chartRef} className="bg-white p-10 rounded-xl shadow-md max-w-5xl mx-auto">
              {console.log('filteredData passed to XmlUploader:', filteredData)}
              <XmlUploader
                data={filteredData}
                chartType={selectedChart}
                xAxis={selectedXAxis}
                yAxis={selectedYAxes}
                xAxisOptions={xAxisOptions}
                yAxisOptions={yAxisOptions}
              />
              <div className="mt-4 flex gap-2 justify-center">
                <button
                  onClick={() => downloadImage('png')}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md font-semibold hover:bg-indigo-200 transition-colors duration-300"
                >
                  Download PNG
                </button>
                <button
                  onClick={() => downloadImage('jpeg')}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md font-semibold hover:bg-indigo-200 transition-colors duration-300"
                >
                  Download JPEG
                </button>
                <button
                  onClick={downloadPDF}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md font-semibold hover:bg-indigo-200 transition-colors duration-300"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-indigo-700 text-white p-4 text-center">
        <p>© 2025 Data Visualization Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;