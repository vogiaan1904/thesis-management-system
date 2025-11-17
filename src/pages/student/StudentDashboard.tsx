import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { applicationService } from '../../services/api';
import { ThesisApplication, Student } from '../../types';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import { FileText, Search, Clock, CheckCircle } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ThesisApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const student = user as Student;

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await applicationService.getByStudent(student.studentId);
        setApplications(data);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [student.studentId]);

  const pendingCount = applications.filter(
    (a) => a.status === 'PENDING_INSTRUCTOR_REVIEW'
  ).length;
  const acceptedCount = applications.filter(
    (a) =>
      a.status === 'INSTRUCTOR_ACCEPTED' ||
      a.status === 'VERIFIED'
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <Link
          to="/student/topics"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Search className="h-5 w-5" />
          <span>Browse Topics</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.length}
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
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
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
                {acceptedCount}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">
            My Applications
          </h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                You haven't submitted any applications yet.
              </p>
              <Link
                to="/student/topics"
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                Browse available topics
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {app.topicTitle}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Instructor: {app.instructorName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Applied: {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  {app.instructorNotes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                      <p className="font-medium text-gray-700">
                        Instructor Notes:
                      </p>
                      <p className="text-gray-600">{app.instructorNotes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
