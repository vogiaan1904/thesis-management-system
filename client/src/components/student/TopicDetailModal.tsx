import Modal from '../common/Modal';
import Button from '../common/Button';
import { ThesisTopic } from '../../types';
import {
  GraduationCap,
  Mail,
  Building2,
  Tag,
  Users,
  Calendar,
  FileText,
  CheckCircle2,
  BookMarked,
  Clock,
} from 'lucide-react';

interface TopicDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: ThesisTopic;
  onApply: () => void;
}

export default function TopicDetailModal({
  isOpen,
  onClose,
  topic,
  onApply,
}: TopicDetailModalProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'FULL':
        return 'bg-red-100 text-red-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string | Date) => {
    return date instanceof Date ? date.toLocaleDateString() : new Date(date).toLocaleDateString();
  };

  const availableSlots = topic.maxStudents - topic.currentStudents;
  const isAvailable = topic.status === 'ACTIVE' && availableSlots > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Topic Details" size="4xl">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Header Section */}
        <div className="border-b pb-4">
          <div className="flex items-center space-x-2 mb-3">
            <span className="px-3 py-1 bg-[#7C2946] text-white text-sm font-mono rounded">
              {topic.topicCode}
            </span>
            <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded">
              {topic.topicType}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded">
              {topic.semester}
            </span>
            <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(topic.status)}`}>
              {topic.status}
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{topic.titleVn}</h2>
          {topic.titleEn && (
            <p className="text-base text-gray-600 italic">{topic.titleEn}</p>
          )}
        </div>

        {/* Instructor Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <GraduationCap className="h-4 w-4 mr-2 text-[#7C2946]" />
            INSTRUCTOR INFORMATION
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{topic.instructor.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Employee ID</p>
              <p className="font-medium">{topic.instructor.userId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-medium flex items-center">
                <Building2 className="h-4 w-4 mr-1 text-gray-400" />
                {topic.instructor.department || topic.department}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <a
                href={`mailto:${topic.instructor.email}`}
                className="font-medium text-[#7C2946] hover:underline flex items-center"
              >
                <Mail className="h-4 w-4 mr-1" />
                {topic.instructor.email}
              </a>
            </div>
          </div>
        </div>

        {/* Topic Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Slots</h4>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {availableSlots}/{topic.maxStudents}
            </p>
            <p className="text-sm text-blue-600">Available</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Tag className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-green-900">Department</h4>
            </div>
            <p className="text-lg font-semibold text-green-700">{topic.department}</p>
          </div>
        </div>

        {/* Program Types */}
        {topic.programTypes && topic.programTypes.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">ELIGIBLE PROGRAMS</h3>
            <div className="flex flex-wrap gap-2">
              {topic.programTypes.map((type) => (
                <span
                  key={type}
                  className="px-3 py-1.5 bg-[#7C2946]/10 text-[#7C2946] text-sm rounded font-medium border border-[#7C2946]/20"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            DESCRIPTION
          </h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {topic.description}
          </p>
        </div>

        {/* Requirements */}
        {(topic.phase1Requirements || topic.phase2Requirements) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topic.phase1Requirements && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <h3 className="text-sm font-semibold text-orange-800 mb-2 flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  PHASE 1 REQUIREMENTS
                </h3>
                <p className="text-sm text-orange-900 leading-relaxed whitespace-pre-line">
                  {topic.phase1Requirements}
                </p>
              </div>
            )}
            {topic.phase2Requirements && (
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                <h3 className="text-sm font-semibold text-teal-800 mb-2 flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  PHASE 2 REQUIREMENTS
                </h3>
                <p className="text-sm text-teal-900 leading-relaxed whitespace-pre-line">
                  {topic.phase2Requirements}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Prerequisites */}
        {topic.prerequisites && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">PREREQUISITES</h3>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-line">{topic.prerequisites}</p>
            </div>
          </div>
        )}

        {/* References */}
        {topic.references && topic.references.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <BookMarked className="h-4 w-4 mr-2" />
              REFERENCES
            </h3>
            <div className="space-y-2">
              {topic.references.map((ref, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-3 rounded border-l-4 border-[#7C2946] text-sm text-gray-700"
                >
                  {ref.url ? (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {ref.text}
                    </a>
                  ) : (
                    ref.text
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>Created: {formatDate(topic.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Updated: {formatDate(topic.updatedAt)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button onClick={onApply} disabled={!isAvailable} className="flex-1">
            {isAvailable ? 'Apply for this Topic' : 'Topic Full'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
