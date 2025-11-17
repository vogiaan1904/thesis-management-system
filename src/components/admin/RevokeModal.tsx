import { useState } from 'react';
import { applicationService } from '../../services/api';
import { ThesisApplication } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import StatusBadge from '../common/StatusBadge';
import { AlertTriangle } from 'lucide-react';

interface RevokeModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ThesisApplication;
}

export default function RevokeModal({
  isOpen,
  onClose,
  application,
}: RevokeModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRevoke = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for revocation');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await applicationService.updateStatus(
        application.id,
        'DEPARTMENT_REVOKED',
        reason
      );
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Revocation failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Revocation Complete">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-600"
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
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Registration Revoked
          </h3>
          <p className="text-gray-600">
            The registration has been revoked and the slot has been restored.
            Notifications have been sent to the student and instructor.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Revoke Registration" size="lg">
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800">Warning</h4>
            <p className="text-sm text-red-700">
              This action will revoke the student's registration and restore the
              slot to the instructor's topic. The student and instructor will be
              notified.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">
            Registration Details
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Student</p>
              <p className="font-medium">{application.studentName}</p>
              <p className="text-sm text-gray-600">{application.studentId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Topic</p>
              <p className="font-medium">{application.topicTitle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Instructor</p>
              <p className="font-medium">{application.instructorName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Status</p>
              <StatusBadge status={application.status} size="sm" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Self-Reported Credits</p>
              <p className="font-medium">{application.selfReportedCredits}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Actual Credits</p>
              <p className="font-medium">
                {application.actualCredits || 'Not verified'}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="reason"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Reason for Revocation *
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Provide a clear reason for revoking this registration..."
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
          <Button variant="danger" onClick={handleRevoke} isLoading={loading}>
            Confirm Revocation
          </Button>
        </div>
      </div>
    </Modal>
  );
}
