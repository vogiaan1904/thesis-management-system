import React, { useState } from 'react';
import { verificationService } from '../../services/api';
import { EDUSoftStudent } from '../../types';
import { mockEDUSoftData } from '../../services/mockData';
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
  const [previewData, setPreviewData] = useState<EDUSoftStudent[] | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // For demo, we'll use mock data as preview
      setPreviewData(mockEDUSoftData);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // In production, this would parse the Excel file
      // For demo, we'll use mock data
      await verificationService.uploadEDUSoftData(mockEDUSoftData);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
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
            {previewData?.length || 0} student records have been loaded. You can
            now run the verification process.
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

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
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
            className="cursor-pointer text-blue-600 hover:underline text-lg font-medium"
          >
            Click to select Excel file
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Supports .xlsx, .xls, or .csv files
          </p>
          {file && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700 font-medium">
                Selected: {file.name}
              </p>
              <p className="text-xs text-blue-600">
                Size: {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}
        </div>

        {previewData && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Data Preview ({previewData.length} records)
            </h4>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Student ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Major
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Enrolled
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Credits
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {previewData.slice(0, 5).map((student) => (
                    <tr key={student.studentId}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {student.studentId}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {student.major}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            student.enrolledInThesis
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {student.enrolledInThesis ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {student.actualCredits}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {previewData.length > 5 && (
              <p className="text-xs text-gray-500 mt-2">
                Showing 5 of {previewData.length} records
              </p>
            )}
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Important Notes</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>
              - This file will be used to verify student eligibility
            </li>
            <li>- Ensure the file contains the latest data from EDUSoft</li>
            <li>
              - A backup of current data will be created before processing
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
