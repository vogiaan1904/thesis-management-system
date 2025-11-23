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
  GraduationCap,
  Eye,
  AlertCircle,
  Users,
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
      const response = await topicService.getAll();
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
        <h1 className="text-3xl font-bold text-gray-900">Thesis Topics</h1>
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
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

          {/* Header Row */}
          <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-lg text-xs font-medium text-gray-500 uppercase tracking-wide">
            <div className="flex-shrink-0 w-28 text-center">Code</div>
            <div className="flex-shrink-0 w-32 text-center">Type</div>
            <div className="flex-1 min-w-0">Title</div>
            <div className="flex-shrink-0 w-48">Instructor</div>
            <div className="flex-shrink-0 w-32 text-center">Department</div>
            <div className="flex-shrink-0 w-20 text-center">Slots</div>
            <div className="flex-shrink-0 w-24 text-center"></div>
          </div>

          <div className="space-y-3">
            {filteredTopics.map((topic) => (
              <Card key={topic.id} className="hover:shadow-md transition-shadow">
                <CardBody className="py-3">
                  <div className="flex items-center gap-4">
                    {/* Left: Topic Code */}
                    <div className="flex-shrink-0 w-28 text-center">
                      <span className="px-2 py-1 bg-[#7C2946] text-white text-xs font-mono rounded block">
                        {topic.topicCode}
                      </span>
                    </div>

                    {/* Type & Semester */}
                    <div className="flex-shrink-0 w-32 text-center text-xs text-gray-600">
                      <div>{topic.topicType}</div>
                      <div className="text-gray-400">{topic.semester}</div>
                    </div>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 line-clamp-2">
                        {topic.titleVn}
                      </h3>
                      {topic.titleEn && (
                        <p className="text-xs text-gray-500 italic line-clamp-1">{topic.titleEn}</p>
                      )}
                    </div>

                    {/* Instructor */}
                    <div className="flex-shrink-0 w-48">
                      <div className="flex items-center space-x-1">
                        <GraduationCap className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {topic.instructor?.fullName || 'N/A'}
                        </span>
                      </div>
                      {topic.instructor?.email && (
                        <a
                          href={`mailto:${topic.instructor.email}`}
                          className="text-xs text-blue-600 hover:underline flex items-center space-x-1 ml-5"
                        >
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{topic.instructor.email}</span>
                        </a>
                      )}
                    </div>

                    {/* Department */}
                    <div className="flex-shrink-0 w-32 text-center">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border inline-block truncate max-w-full">
                        {topic.department}
                      </span>
                    </div>

                    {/* Slots */}
                    <div className="flex-shrink-0 w-20 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className={`text-sm font-medium ${
                          topic.currentStudents >= topic.maxStudents ? 'text-red-600' : 'text-gray-700'
                        }`}>
                          {Math.max(0, topic.maxStudents - topic.currentStudents)}/{topic.maxStudents}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 w-24 flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(topic)}
                        className="p-2 text-gray-500 hover:text-[#7C2946] hover:bg-gray-100 rounded-full transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <Button
                        onClick={() => handleApply(topic)}
                        size="sm"
                        disabled={!canApply(topic)}
                      >
                        Apply
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
