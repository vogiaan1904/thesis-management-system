import { useState, useEffect, useRef } from 'react';
import { applicationService } from '../../services/api';
import { ThesisApplication } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import ExcelUploadModal from '../../components/admin/ExcelUploadModal';
import RevokeModal from '../../components/admin/RevokeModal';
import {
  Upload,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Mail,
  Trash2,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'INSTRUCTOR_ACCEPTED', label: 'Instructor Accepted' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'INVALID_CREDITS', label: 'Invalid Credits' },
  { value: 'NOT_ENROLLED_EDUSOFT', label: 'Not Enrolled EDUSoft' },
  { value: 'DEPARTMENT_REVOKED', label: 'Department Revoked' },
];

export default function AdminDashboard() {
  const [applications, setApplications] = useState<ThesisApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ThesisApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ThesisApplication | null>(null);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const menuRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const appsData = await applicationService.getAll();
      setApplications(appsData.data);
      setFilteredApplications(appsData.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = applications;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (app) =>
          app.student?.fullName?.toLowerCase().includes(query) ||
          app.student?.userId?.toLowerCase().includes(query) ||
          app.student?.email?.toLowerCase().includes(query) ||
          app.topic?.titleVn?.toLowerCase().includes(query) ||
          app.topic?.instructor?.fullName?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter) {
      result = result.filter((app) => app.status === statusFilter);
    }

    setFilteredApplications(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, statusFilter, applications]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredApplications.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

  // Check if row is near bottom of current page (for dropdown direction)
  const isNearBottom = (index: number) => {
    const positionInPage = index - startIndex;
    return positionInPage >= rowsPerPage - 2;
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRevokeClick = (app: ThesisApplication) => {
    setSelectedApplication(app);
    setIsRevokeModalOpen(true);
    setOpenMenuId(null);
  };

  const handleViewDetails = (app: ThesisApplication) => {
    setSelectedApplication(app);
    setIsDetailModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSendEmail = (app: ThesisApplication) => {
    if (app.student?.email) {
      window.location.href = `mailto:${app.student.email}?subject=Thesis Registration - ${app.topic?.titleVn || 'Update'}`;
    }
    setOpenMenuId(null);
  };

  const handleDelete = async (app: ThesisApplication) => {
    if (!confirm(`Are you sure you want to delete the registration for ${app.student?.fullName}?`)) {
      return;
    }

    try {
      await applicationService.delete(app.id);
      toast.success('Registration deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete registration');
    }
    setOpenMenuId(null);
  };

  const handleExportExcel = async () => {
    try {
      // Use the reports export endpoint
      const response = await fetch('/api/reports/export?type=registrations', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registrations-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export successful');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    }
  };

  const getStatusStats = () => {
    const stats = {
      total: applications.length,
      accepted: applications.filter((a) => a.status === 'INSTRUCTOR_ACCEPTED').length,
      verified: applications.filter((a) => a.status === 'VERIFIED').length,
      invalid: applications.filter((a) =>
        a.status === 'INVALID_CREDITS' ||
        a.status === 'NOT_ENROLLED_EDUSOFT' ||
        a.status === 'DEPARTMENT_REVOKED'
      ).length,
    };
    return stats;
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Registration Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and verify thesis registrations
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              onClick={handleExportExcel}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload EDUSoft
            </Button>
            <Button onClick={fetchData} variant="secondary">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center space-x-6 text-sm">
          <span className="text-gray-500">
            Total: <span className="font-semibold text-gray-900">{stats.total}</span>
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">
            Accepted: <span className="font-semibold text-yellow-600">{stats.accepted}</span>
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">
            Verified: <span className="font-semibold text-green-600">{stats.verified}</span>
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">
            Invalid: <span className="font-semibold text-red-600">{stats.invalid}</span>
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name, ID, email, topic, or instructor..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C2946] focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-[#7C2946] focus:border-transparent cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Clear Filters */}
          {(searchQuery || statusFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
              }}
              className="text-sm text-[#7C2946] hover:text-[#5a1f33] font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-b border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C2946]"></div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {applications.length === 0
                  ? 'No registrations found'
                  : 'No registrations match your filters'}
              </p>
            </div>
          ) : (
            <div>
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 border-b border-gray-200">
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
                      Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedApplications.map((app, index) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {app.student?.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {app.student?.userId}
                          </div>
                          <div className="text-xs text-gray-400">
                            {app.student?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {app.topic?.titleVn}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {app.topic?.instructor?.fullName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <span className="text-gray-900">{app.creditsClaimed}</span>
                          <span className="text-gray-400"> / </span>
                          <span className={app.creditsVerified ? 'text-green-600' : 'text-gray-400'}>
                            {app.creditsVerified || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={app.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="relative" ref={openMenuId === app.id ? menuRef : null}>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === app.id ? null : app.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="h-5 w-5 text-gray-500" />
                          </button>

                          {/* Dropdown Menu - opens upward if near bottom */}
                          {openMenuId === app.id && (
                            <div className={`absolute right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 ${
                              isNearBottom(startIndex + index) ? 'bottom-full mb-2' : 'top-full mt-2'
                            }`}>
                              <button
                                onClick={() => handleViewDetails(app)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                <Eye className="h-4 w-4 mr-3 text-gray-400" />
                                View Details
                              </button>
                              <button
                                onClick={() => handleSendEmail(app)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                <Mail className="h-4 w-4 mr-3 text-gray-400" />
                                Send Email
                              </button>
                              {(app.status === 'INSTRUCTOR_ACCEPTED' ||
                                app.status === 'VERIFIED' ||
                                app.status === 'INVALID_CREDITS' ||
                                app.status === 'NOT_ENROLLED_EDUSOFT') && (
                                <button
                                  onClick={() => handleRevokeClick(app)}
                                  className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center"
                                >
                                  <XCircle className="h-4 w-4 mr-3" />
                                  Revoke
                                </button>
                              )}
                              <div className="border-t border-gray-100 my-1"></div>
                              <button
                                onClick={() => handleDelete(app)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                              >
                                <Trash2 className="h-4 w-4 mr-3" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        {/* Pagination */}
        {!loading && filteredApplications.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredApplications.length)} of {filteredApplications.length} registrations
            </div>
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first, last, current, and pages around current
                      return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, idx, arr) => {
                      // Add ellipsis if there's a gap
                      const prevPage = arr[idx - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      return (
                        <span key={page} className="flex items-center">
                          {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded-lg text-sm ${
                              currentPage === page
                                ? 'bg-[#7C2946] text-white'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        </span>
                      );
                    })}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Registration Details</h2>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedApplication(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Student Name</p>
                  <p className="font-medium">{selectedApplication.student?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Student ID</p>
                  <p className="font-medium">{selectedApplication.student?.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedApplication.student?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <StatusBadge status={selectedApplication.status} />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500 mb-1">Topic</p>
                <p className="font-medium">{selectedApplication.topic?.titleVn}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Instructor</p>
                <p className="font-medium">{selectedApplication.topic?.instructor?.fullName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                <div>
                  <p className="text-sm text-gray-500">Credits Claimed</p>
                  <p className="font-medium">{selectedApplication.creditsClaimed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Credits Verified</p>
                  <p className="font-medium">{selectedApplication.creditsVerified || 'Not verified'}</p>
                </div>
              </div>

              {selectedApplication.motivationLetter && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-500 mb-1">Motivation Letter</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedApplication.motivationLetter}
                  </p>
                </div>
              )}

              {selectedApplication.instructorComment && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-500 mb-1">Instructor Comment</p>
                  <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                    {selectedApplication.instructorComment}
                  </p>
                </div>
              )}

              {selectedApplication.departmentComment && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-500 mb-1">Department Comment</p>
                  <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg">
                    {selectedApplication.departmentComment}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4 text-sm text-gray-500">
                <div>
                  <p>Created: {new Date(selectedApplication.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p>Updated: {new Date(selectedApplication.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => handleSendEmail(selectedApplication)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedApplication(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

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
