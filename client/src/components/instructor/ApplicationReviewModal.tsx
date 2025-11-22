import { useState } from 'react';
import { applicationService } from '../../services/api';
import { ThesisApplication } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { AlertCircle, FileText, Mail } from 'lucide-react';

interface ApplicationReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ThesisApplication;
}

export default function ApplicationReviewModal({
  isOpen,
  onClose,
  application,
}: ApplicationReviewModalProps) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<'accepted' | 'denied' | null>(null);

  const handleDecision = async (decision: 'accept' | 'deny') => {
    setError('');
    setLoading(true);

    try {
      const status =
        decision === 'accept' ? 'INSTRUCTOR_ACCEPTED' : 'INSTRUCTOR_DENIED';
      await applicationService.updateStatus(application.id, status, notes);
      setSuccess(decision === 'accept' ? 'accepted' : 'denied');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to process decision'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Decision Recorded">
        <div className="text-center py-6">
          <div
            className={`w-16 h-16 ${
              success === 'accepted' ? 'bg-green-100' : 'bg-red-100'
            } rounded-full flex items-center justify-center mx-auto mb-4`}
          >
            {success === 'accepted' ? (
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
            ) : (
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Application {success === 'accepted' ? 'Accepted' : 'Denied'}
          </h3>
          <p className="text-gray-600">
            {success === 'accepted'
              ? `${application.student?.fullName} has been accepted for the topic. A slot has been reserved.`
              : `${application.student?.fullName} has been notified of the denial.`}
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Application"
      size="lg"
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">
            Student Information
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{application.student?.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Student ID</p>
              <p className="font-medium">{application.student?.userId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <a
                href={`mailto:${application.student?.email}`}
                className="font-medium text-blue-600 hover:underline flex items-center space-x-1"
              >
                <Mail className="h-4 w-4" />
                <span>{application.student?.email}</span>
              </a>
            </div>
            <div>
              <p className="text-sm text-gray-500">Credits Claimed</p>
              <p className="font-medium">{application.creditsClaimed}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Topic</h4>
          <p className="font-medium">{application.topic?.titleVn}</p>
        </div>

        {application.motivationLetter && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Motivation Letter
            </h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                {application.motivationLetter}
              </p>
            </div>
          </div>
        )}

        {application.transcriptUrl && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Transcript Document
            </h4>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
              <FileText className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium">Transcript</span>
              <a
                href={application.transcriptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:underline"
              >
                View
              </a>
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Notes for Student (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add any notes or feedback for the student..."
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
          <Button
            variant="danger"
            onClick={() => handleDecision('deny')}
            isLoading={loading}
          >
            Deny Application
          </Button>
          <Button
            variant="success"
            onClick={() => handleDecision('accept')}
            isLoading={loading}
          >
            Accept Application
          </Button>
        </div>
      </div>
    </Modal>
  );
}
