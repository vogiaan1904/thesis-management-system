import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { applicationService, topicService } from '../../services/api';
import { ThesisApplication, ThesisTopic } from '../../types';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import ApplicationReviewModal from '../../components/instructor/ApplicationReviewModal';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Tag,
  Building2,
} from 'lucide-react';

export default function InstructorDashboard() {
  useAuth();

  const [applications, setApplications] = useState<ThesisApplication[]>([]);
  const [topics, setTopics] = useState<ThesisTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] =
    useState<ThesisApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Instructor Dashboard
        </h1>
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

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">
            My Thesis Topics
          </h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C2946] mx-auto"></div>
            </div>
          ) : topics.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              You haven't created any topics yet.
            </p>
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
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        {topic.maxStudents - topic.currentStudents}/{topic.maxStudents} slots
                      </span>
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

      {selectedApplication && (
        <ApplicationReviewModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          application={selectedApplication}
        />
      )}
    </div>
  );
}
