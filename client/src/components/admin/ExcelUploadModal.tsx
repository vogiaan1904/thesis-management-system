import React, { useState } from 'react';
import { verificationService } from '../../services/api';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExcelUploadModal({
  isOpen,
  onClose,
}: ExcelUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [semester, setSemester] = useState('HK251');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    if (!semester) {
      setError('Please enter a semester');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await verificationService.uploadFile(file, semester);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Upload Complete">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            EDUSoft Data Uploaded Successfully
          </h3>
          <p className="text-gray-600">
            The verification process has been started. You can check the results in the verification history.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload EDUSoft Excel File"
      size="lg"
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label
            htmlFor="semester"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Semester
          </label>
          <input
            type="text"
            id="semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            placeholder="e.g., HK251"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7C2946] focus:border-transparent"
          />
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#7C2946]/30 transition-colors">
          <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
            id="excel-upload"
          />
          <label
            htmlFor="excel-upload"
            className="cursor-pointer text-[#7C2946] hover:underline text-lg font-medium"
          >
            Click to select Excel file
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Supports .xlsx, .xls, or .csv files
          </p>
          {file && (
            <div className="mt-4 p-3 bg-[#7C2946]/10 rounded-md">
              <p className="text-sm text-[#7C2946] font-medium">
                Selected: {file.name}
              </p>
              <p className="text-xs text-gray-600">
                Size: {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Important Notes</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>
              - This file will be used to verify student eligibility
            </li>
            <li>- Ensure the file contains the latest data from EDUSoft</li>
            <li>
              - The verification process will run automatically after upload
            </li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            isLoading={loading}
            disabled={!file}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload & Process
          </Button>
        </div>
      </div>
    </Modal>
  );
}
