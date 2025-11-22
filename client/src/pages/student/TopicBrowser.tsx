import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { topicService } from '../../services/api';
import { ThesisTopic } from '../../types';
import { Card, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import ApplicationModal from '../../components/student/ApplicationModal';
import TopicDetailModal from '../../components/student/TopicDetailModal';
import {
  Search,
  Filter,
  Mail,
  BookOpen,
  Tag,
  Building2,
  GraduationCap,
  Eye,
  AlertCircle,
} from 'lucide-react';

export default function TopicBrowser() {
  const [topics, setTopics] = useState<ThesisTopic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<ThesisTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<ThesisTopic | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailTopic, setDetailTopic] = useState<ThesisTopic | null>(null);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await topicService.getAll({ status: 'ACTIVE' });
      setTopics(response.data);
      setFilteredTopics(response.data);
    } catch (err) {
      const errorMessage = 'Failed to load topics. Please try again later.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Failed to fetch topics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = topics;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.titleVn?.toLowerCase().includes(search) ||
          t.titleEn?.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search) ||
          t.instructor?.fullName?.toLowerCase().includes(search) ||
          t.topicCode?.toLowerCase().includes(search)
      );
    }

    if (selectedDepartment) {
      filtered = filtered.filter((t) => t.department === selectedDepartment);
    }

    setFilteredTopics(filtered);
  }, [searchTerm, selectedDepartment, topics]);

  const departments = [...new Set(topics.map((t) => t.department).filter(Boolean))];

  const handleApply = (topic: ThesisTopic) => {
    setSelectedTopic(topic);
    setIsModalOpen(true);
  };

  const handleViewDetails = (topic: ThesisTopic) => {
    setDetailTopic(topic);
    setIsDetailModalOpen(true);
  };

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

  const getStatusLabel = (topic: ThesisTopic) => {
    if (topic.status === 'FULL' || topic.currentStudents >= topic.maxStudents) {
      return 'FULL';
    }
    const available = topic.maxStudents - topic.currentStudents;
    return `${available}/${topic.maxStudents} slots`;
  };

  const canApply = (topic: ThesisTopic) => {
    return topic.status === 'ACTIVE' && topic.currentStudents < topic.maxStudents;
  };

  if (error && !loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-red-100 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Unable to Load Topics
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={fetchTopics}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Available Thesis Topics</h1>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, instructor, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7C2946] focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#7C2946] focus:border-transparent"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C2946] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading topics...</p>
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No topics found matching your criteria.</p>
          {(searchTerm || selectedDepartment) && (
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedDepartment('');
              }}
              variant="secondary"
              className="mt-4"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-600 mb-2">
            Showing {filteredTopics.length} of {topics.length} topics
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTopics.map((topic) => (
              <Card key={topic.id} className="hover:shadow-lg transition-shadow">
                <CardBody>
                  <div className="space-y-4">
                    {/* Header */}
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="px-2 py-1 bg-[#7C2946] text-white text-xs font-mono rounded">
                            {topic.topicCode}
                          </span>
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                            {topic.topicType}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {topic.semester}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${getStatusColor(topic.status)}`}
                        >
                          {getStatusLabel(topic)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {topic.titleVn}
                      </h3>
                      {topic.titleEn && (
                        <p className="text-sm text-gray-600 italic">{topic.titleEn}</p>
                      )}
                    </div>

                    {/* Instructor Info */}
                    <div className="flex items-start space-x-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {topic.instructor?.fullName || 'N/A'}
                        </p>
                        {topic.instructor?.email && (
                          <a
                            href={`mailto:${topic.instructor.email}`}
                            className="text-blue-600 hover:underline flex items-center space-x-1"
                          >
                            <Mail className="h-3 w-3" />
                            <span>{topic.instructor.email}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Department */}
                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span>{topic.department}</span>
                    </div>

                    {/* Program Types */}
                    {topic.programTypes && topic.programTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {topic.programTypes.slice(0, 4).map((program) => (
                          <span
                            key={program}
                            className="px-2 py-1 bg-[#7C2946] bg-opacity-10 text-[#7C2946] text-xs rounded"
                          >
                            {program}
                          </span>
                        ))}
                        {topic.programTypes.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{topic.programTypes.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Description Preview */}
                    <p className="text-sm text-gray-600 line-clamp-2">{topic.description}</p>

                    {/* Prerequisites */}
                    {topic.prerequisites && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Prerequisites: </span>
                        <span className="text-gray-600">{topic.prerequisites}</span>
                      </div>
                    )}

                    {/* Pending Applications */}
                    {topic._count && topic._count.registrations > 0 && (
                      <div className="flex items-center space-x-2 text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded">
                        <Tag className="h-4 w-4" />
                        <span>{topic._count.registrations} pending applications</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Button
                        onClick={() => handleViewDetails(topic)}
                        variant="secondary"
                        className="flex-1 flex items-center justify-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </Button>
                      <Button
                        onClick={() => handleApply(topic)}
                        className="flex-1"
                        disabled={!canApply(topic)}
                      >
                        {canApply(topic) ? 'Apply' : 'Full'}
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Application Modal */}
      {isModalOpen && selectedTopic && (
        <ApplicationModal
          topic={selectedTopic}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTopic(null);
          }}
        />
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && detailTopic && (
        <TopicDetailModal
          topic={detailTopic}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setDetailTopic(null);
          }}
          onApply={() => {
            setIsDetailModalOpen(false);
            handleApply(detailTopic);
          }}
        />
      )}
    </div>
  );
}
