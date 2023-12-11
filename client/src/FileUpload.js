// FileUpload.js
import React, { useState } from 'react';
import axios from 'axios';
import './FileUpload.css';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('Upload');
  const [labelText, setLabelText] = useState('Select an Excel File');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    if (file) {
      setLabelText(file.name);
    } else {
      setLabelText('Select an Excel File');
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const response = await axios.post('http://localhost:3000/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.status === 200) {
          setUploadStatus('File uploaded successfully!');
          alert('File uploaded successfully!');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadStatus('Upload');
        alert('An error occurred while uploading the file.');
      }
    } else {
      alert('Please choose an Excel file to upload.');
    }
  };

  return (
    <div className="container">
      <h1>Tree Donation Certificate Generator</h1>
      <div className="label-container">
        <label htmlFor="file" className="file-label">
          {labelText}
          <input type="file" id="file" onChange={handleFileChange} accept=".xlsx" />
        </label>
      </div>
      <div className="button-container">
        <button className="upload-button" onClick={handleUpload}>
          {uploadStatus}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
