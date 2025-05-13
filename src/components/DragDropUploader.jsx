import React, { useState } from 'react';

const DragDropUploader = ({ onFileUpload }) => {
  const [dragging, setDragging] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/xml') {
      onFileUpload(file);
    } else {
      alert('Please upload a valid XML file.');
    }
  };

  return (
    <div
      style={{
        border: dragging ? '2px dashed green' : '2px dashed gray',
        padding: '50px',
        textAlign: 'center',
        cursor: 'pointer'
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <p>Drag and Drop an XML file here</p>
      <input
        type="file"
        accept=".xml"
        onChange={(e) => onFileUpload(e.target.files[0])}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default DragDropUploader;
