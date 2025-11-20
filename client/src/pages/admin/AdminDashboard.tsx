import { useState, useEffect } from 'react';
import { applicationService, verificationService, reportService } from '../../services/api';
import { ThesisApplication, DashboardStats } from '../../types';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import ExcelUploadModal from '../../components/admin/ExcelUploadModal';
import RevokeModal from '../../components/admin/RevokeModal';
import {
  Upload,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  Shield,
  XCircle,
  RefreshCw,
} from 'lucide-react';

export default function AdminDashboard() {
  const [applications, setApplications] = useState<ThesisApplication[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<ThesisApplication | null>(null);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: number;
    invalidCredits: number;
    notEnrolled: number;
  } | null>(null);

  const fetchData = async () => {
    try {
      const [appsData, statsData] = await Promise.all([
        applicationService.getAll(),
        reportService.getSummary(),
      ]);
      setApplications(appsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      // Get the latest verification batch
      const latestBatch = await verificationService.getLatest();
      if (latestBatch) {
        setVerificationResult({
          verified: latestBatch.verifiedCount || 0,
          invalidCredits: latestBatch.invalidCreditsCount || 0,
          notEnrolled: latestBatch.notEnrolledCount || 0,
        });
      }
      await fetchData();
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setVerifying(false);
    }
  };

  const handleRevokeClick = (app: ThesisApplication) => {
    setSelectedApplication(app);
    setIsRevokeModalOpen(true);
  };

  const invalidApplications = applications.filter(
    (a) =>
      a.status === 'INVALID_CREDITS' ||
      a.status === 'NOT_ENROLLED_EDUSOFT' ||
      a.status === 'DEPARTMENT_REVOKED'
  );

  const acceptedApplications = applications.filter(
    (a) => a.status === 'INSTRUCTOR_ACCEPTED'
  );

  const verifiedApplications = applications.filter(
    (a) => a.status === 'VERIFIED'
  );

  const pendingInstructorReview = applications.filter(
    (a) => a.status === 'PENDING_INSTRUCTOR_REVIEW'
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex space-x-3">
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            variant="secondary"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload EDUSoft Data
          </Button>
          <Button
            onClick={handleVerify}
            isLoading={verifying}
            disabled={acceptedApplications.length === 0}
          >
            <Shield className="h-4 w-4 mr-2" />
            Run Verification
          </Button>
        </div>
      </div>

      {verificationResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            Verification Complete
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Verified:</span>{' '}
              <span className="font-bold">{verificationResult.verified}</span>
            </div>
            <div>
              <span className="text-blue-700">Invalid Credits:</span>{' '}
              <span className="font-bold">
                {verificationResult.invalidCredits}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Not in EDUSoft:</span>{' '}
              <span className="font-bold">
                {verificationResult.notEnrolled}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardBody className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalApplications || 0}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <RefreshCw className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Awaiting Instructor</p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingInstructorReview.length}
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
              <p className="text-sm text-gray-500">Verified</p>
              <p className="text-2xl font-bold text-gray-900">
                {verifiedApplications.length}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Invalid</p>
              <p className="text-2xl font-bold text-gray-900">
                {invalidApplications.length}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {invalidApplications.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Invalid Registrations
              </h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {invalidApplications.map((app) => (
                <div
                  key={app.id}
                  className={`border rounded-lg p-4 ${
                    app.status === 'INVALID_CREDITS'
                      ? 'border-red-200 bg-red-50'
                      : app.status === 'NOT_ENROLLED_EDUSOFT'
                      ? 'border-orange-200 bg-orange-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
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
                        Instructor: {app.instructorName}
                      </p>
                      {app.status === 'INVALID_CREDITS' && (
                        <p className="text-sm text-red-600 mt-2">
                          Self-reported: {app.selfReportedCredits} | Actual:{' '}
                          {app.actualCredits || 'N/A'}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <StatusBadge status={app.status} size="sm" />
                      {app.status !== 'DEPARTMENT_REVOKED' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRevokeClick(app)}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

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
              No applications in the system.
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
                      Instructor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credits (Self/Actual)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                        {app.instructorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.selfReportedCredits} /{' '}
                        {app.actualCredits || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={app.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(app.status === 'INVALID_CREDITS' ||
                          app.status === 'NOT_ENROLLED_EDUSOFT') && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRevokeClick(app)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Revoke
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

      <ExcelUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          fetchData();
        }}
      />

      {selectedApplication && (
        <RevokeModal
          isOpen={isRevokeModalOpen}
          onClose={() => {
            setIsRevokeModalOpen(false);
            setSelectedApplication(null);
            fetchData();
          }}
          application={selectedApplication}
        />
      )}
    </div>
  );
}
