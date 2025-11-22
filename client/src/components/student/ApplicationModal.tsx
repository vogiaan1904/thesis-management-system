import React, { useState } from 'react';
import { applicationService } from '../../services/api';
import { ThesisTopic } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { AlertCircle } from 'lucide-react';

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
  const [credits, setCredits] = useState('');
  const [motivation, setMotivation] = useState('');
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

      await applicationService.create({
        topicId: topic.id,
        creditsClaimed: creditsNum,
        motivationLetter: motivation || undefined,
      });

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
            Your application has been sent to {topic.instructor.fullName} for review.
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
      title={`Apply for: ${topic.titleVn}`}
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
          <p className="text-gray-900">{topic.instructor.fullName}</p>
          <a
            href={`mailto:${topic.instructor.email}`}
            className="text-sm text-blue-600 hover:underline"
          >
            {topic.instructor.email}
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
