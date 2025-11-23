import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { applicationService, topicService } from '../../services/api';
import { ThesisApplication, ThesisTopic } from '../../types';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import ApplicationReviewModal from '../../components/instructor/ApplicationReviewModal';
import TopicFormModal from '../../components/instructor/TopicFormModal';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Tag,
  Building2,
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function InstructorDashboard() {
  useAuth();

  const [applications, setApplications] = useState<ThesisApplication[]>([]);
  const [topics, setTopics] = useState<ThesisTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] =
    useState<ThesisApplication | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Topic management state
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<ThesisTopic | null>(null);
  const [deleteConfirmTopic, setDeleteConfirmTopic] = useState<ThesisTopic | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [appsData, topicsData] = await Promise.all([
        applicationService.getPendingReviews(),
        topicService.getByInstructor(),
      ]);
      setApplications(appsData);
      setTopics(topicsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const pendingApplications = applications.filter(
    (a) => a.status === 'PENDING_INSTRUCTOR_REVIEW'
  );
  const acceptedApplications = applications.filter(
    (a) =>
      a.status === 'INSTRUCTOR_ACCEPTED' || a.status === 'VERIFIED'
  );
  const deniedApplications = applications.filter(
    (a) => a.status === 'INSTRUCTOR_DENIED'
  );

  const handleReviewClick = (app: ThesisApplication) => {
    setSelectedApplication(app);
    setIsReviewModalOpen(true);
  };

  const handleReviewModalClose = () => {
    setIsReviewModalOpen(false);
    setSelectedApplication(null);
    fetchData();
  };

  // Topic management handlers
  const handleCreateTopic = () => {
    setSelectedTopic(null);
    setIsTopicModalOpen(true);
  };

  const handleEditTopic = (topic: ThesisTopic) => {
    setSelectedTopic(topic);
    setIsTopicModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleDeleteClick = (topic: ThesisTopic) => {
    setDeleteConfirmTopic(topic);
    setOpenDropdownId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmTopic) return;

    try {
      await topicService.delete(deleteConfirmTopic.id);
      setDeleteConfirmTopic(null);
      fetchData();
    } catch (error) {
      console.error('Failed to delete topic:', error);
      toast.error('Failed to delete topic');
    }
  };

  const handleTopicModalClose = () => {
    setIsTopicModalOpen(false);
    setSelectedTopic(null);
  };

  const handleTopicSuccess = () => {
    fetchData();
  };

  const toggleDropdown = (e: React.MouseEvent, topicId: string) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === topicId ? null : topicId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Instructor Dashboard
        </h1>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={fetchData}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardBody className="flex items-center space-x-4">
            <div className="p-3 bg-[#7C2946]/10 rounded-full">
              <FileText className="h-6 w-6 text-[#7C2946]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">My Topics</p>
              <p className="text-2xl font-bold text-gray-900">
                {topics.length}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingApplications.length}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Accepted</p>
              <p className="text-2xl font-bold text-gray-900">
                {acceptedApplications.length}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Denied</p>
              <p className="text-2xl font-bold text-gray-900">
                {deniedApplications.length}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* My Topics Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              My Thesis Topics
            </h2>
            <Button onClick={handleCreateTopic} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Topic</span>
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C2946] mx-auto"></div>
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">
                You haven't created any topics yet.
              </p>
              <Button onClick={handleCreateTopic} className="flex items-center space-x-2 mx-auto">
                <Plus className="h-4 w-4" />
                <span>Create Your First Topic</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-[#7C2946]/30 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-[#7C2946] text-white text-xs font-mono rounded">
                        {topic.topicCode}
                      </span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                        {topic.topicType}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          topic.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : topic.status === 'FULL'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {topic.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {topic.maxStudents - topic.currentStudents}/{topic.maxStudents} slots
                        </span>
                      </div>
                      {/* Actions Dropdown */}
                      <div className="relative">
                        <button
                          onClick={(e) => toggleDropdown(e, topic.id)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <MoreVertical className="h-5 w-5 text-gray-500" />
                        </button>
                        {openDropdownId === topic.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                            <button
                              onClick={() => handleEditTopic(topic)}
                              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Pencil className="h-4 w-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(topic)}
                              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              disabled={topic.currentStudents > 0}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {topic.titleVn}
                    </h3>
                    {topic.titleEn && (
                      <p className="text-sm text-gray-500 italic">
                        {topic.titleEn}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {topic.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <div className="flex items-center space-x-1">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                        {topic.department}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {topic.instructor?.department || topic.department}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      ELIGIBLE PROGRAMS
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {topic.programTypes.map((type) => (
                        <span
                          key={type}
                          className="px-2 py-0.5 bg-[#7C2946]/10 text-[#7C2946] text-xs rounded font-medium"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Pending Applications Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Pending Applications
            </h2>
            <span className="text-sm text-gray-500">
              {pendingApplications.length} application(s) to review
            </span>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C2946] mx-auto"></div>
            </div>
          ) : pendingApplications.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No pending applications to review.
            </p>
          ) : (
            <div className="space-y-4">
              {pendingApplications.map((app) => (
                <div
                  key={app.id}
                  className="border border-yellow-200 bg-yellow-50 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {app.student?.fullName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Student ID: {app.student?.userId}
                      </p>
                      <p className="text-sm text-gray-600">
                        Topic: {app.topic?.titleVn}
                      </p>
                      <p className="text-sm text-gray-600">
                        Credits claimed: {app.creditsClaimed}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Applied:{' '}
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button onClick={() => handleReviewClick(app)} size="sm">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* All Applications Table */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">
            All Applications
          </h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C2946] mx-auto"></div>
            </div>
          ) : applications.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No applications received yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Topic
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {app.student?.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {app.student?.userId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {app.topic?.titleVn}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.creditsClaimed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={app.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {app.status === 'PENDING_INSTRUCTOR_REVIEW' && (
                          <Button
                            onClick={() => handleReviewClick(app)}
                            size="sm"
                          >
                            Review
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Application Review Modal */}
      {selectedApplication && (
        <ApplicationReviewModal
          isOpen={isReviewModalOpen}
          onClose={handleReviewModalClose}
          application={selectedApplication}
        />
      )}

      {/* Topic Form Modal */}
      <TopicFormModal
        isOpen={isTopicModalOpen}
        onClose={handleTopicModalClose}
        topic={selectedTopic}
        onSuccess={handleTopicSuccess}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Topic
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the topic "{deleteConfirmTopic.titleVn}"?
              This action cannot be undone.
            </p>
            {deleteConfirmTopic.currentStudents > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  This topic has {deleteConfirmTopic.currentStudents} student(s) registered.
                  You cannot delete it while students are enrolled.
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmTopic(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteConfirmTopic.currentStudents > 0}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
