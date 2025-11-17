import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { applicationService } from '../../services/api';
import { ThesisTopic, Student } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Upload, AlertCircle } from 'lucide-react';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: ThesisTopic;
}

export default function ApplicationModal({
  isOpen,
  onClose,
  topic,
}: ApplicationModalProps) {
  const { user } = useAuth();
  const student = user as Student;

  const [credits, setCredits] = useState(student.creditsCompleted.toString());
  const [motivation, setMotivation] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const creditsNum = parseInt(credits, 10);
      if (isNaN(creditsNum) || creditsNum < 0) {
        throw new Error('Please enter a valid number of credits');
      }

      if (!files || files.length === 0) {
        throw new Error('Please upload your transcript');
      }

      await applicationService.create(
        {
          topicId: topic.id,
          selfReportedCredits: creditsNum,
          motivationLetter: motivation,
          documents: Array.from(files),
        },
        {
          studentId: student.studentId,
          studentName: student.name,
          studentEmail: student.email,
        }
      );

      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Application Submitted">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Application Submitted Successfully!
          </h3>
          <p className="text-gray-600">
            Your application has been sent to {topic.instructorName} for review.
            You will be notified of their decision.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Apply for: ${topic.title}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructor
          </label>
          <p className="text-gray-900">{topic.instructorName}</p>
          <a
            href={`mailto:${topic.instructorEmail}`}
            className="text-sm text-blue-600 hover:underline"
          >
            {topic.instructorEmail}
          </a>
        </div>

        <div>
          <label
            htmlFor="credits"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Total Credits Completed *
          </label>
          <input
            type="number"
            id="credits"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            required
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the total number of credits you have completed
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Transcript/Credits Screenshot *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-blue-500 transition-colors">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFiles(e.target.files)}
              className="hidden"
              id="file-upload"
              required
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-blue-600 hover:underline"
            >
              Click to upload
            </label>
            <p className="text-xs text-gray-500 mt-1">
              PDF, PNG, or JPG (max 10MB)
            </p>
            {files && files.length > 0 && (
              <p className="text-sm text-green-600 mt-2">
                Selected: {files[0].name}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="motivation"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Motivation Letter (Optional)
          </label>
          <textarea
            id="motivation"
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your interest in this topic and relevant experience..."
          />
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
          <Button type="submit" isLoading={loading}>
            Submit Application
          </Button>
        </div>
      </form>
    </Modal>
  );
}
