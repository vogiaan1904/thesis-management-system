import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { applicationService, topicService } from '../../services/api';
import { ThesisApplication, ThesisTopic, Instructor } from '../../types';
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
} from 'lucide-react';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const instructor = user as Instructor;

  const [applications, setApplications] = useState<ThesisApplication[]>([]);
  const [topics, setTopics] = useState<ThesisTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] =
    useState<ThesisApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [appsData, topicsData] = await Promise.all([
        applicationService.getByInstructor(instructor.id),
        topicService.getByInstructor(instructor.id),
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
  }, [instructor.id]);

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
            <div className="p-3 bg-purple-100 rounded-full">
              <FileText className="h-6 w-6 text-purple-600" />
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {topic.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {topic.researchArea}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {topic.availableSlots}/{topic.totalSlots} slots
                      </span>
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
                        {app.studentName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Student ID: {app.studentId}
                      </p>
                      <p className="text-sm text-gray-600">
                        Topic: {app.topicTitle}
                      </p>
                      <p className="text-sm text-gray-600">
                        Self-reported credits: {app.selfReportedCredits}
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
                            {app.studentName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {app.studentId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {app.topicTitle}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.selfReportedCredits}
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
