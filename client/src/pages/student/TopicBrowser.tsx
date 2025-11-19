import { useState, useEffect } from 'react';
import { topicService } from '../../services/api';
import { ThesisTopic } from '../../types';
import { Card, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import ApplicationModal from '../../components/student/ApplicationModal';
import TopicDetailModal from '../../components/student/TopicDetailModal';
import { Search, Filter, Mail, BookOpen, Tag, Building2, GraduationCap, Eye } from 'lucide-react';

export default function TopicBrowser() {
  const [topics, setTopics] = useState<ThesisTopic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<ThesisTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<ThesisTopic | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailTopic, setDetailTopic] = useState<ThesisTopic | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await topicService.getAll();
        setTopics(data);
        setFilteredTopics(data);
      } catch (error) {
        console.error('Failed to fetch topics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  useEffect(() => {
    let filtered = topics;

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedArea) {
      filtered = filtered.filter((t) => t.researchArea === selectedArea);
    }

    setFilteredTopics(filtered);
  }, [searchTerm, selectedArea, topics]);

  const researchAreas = [...new Set(topics.map((t) => t.researchArea))];

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
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Full':
        return 'bg-red-100 text-red-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Available Thesis Topics
        </h1>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search topics, instructors, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7C2946] focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#7C2946] focus:border-transparent"
              >
                <option value="">All Research Areas</option>
                {researchAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C2946] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading topics...</p>
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No topics found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTopics.map((topic) => (
            <Card key={topic.id} className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-[#7C2946] text-white text-xs font-mono rounded">
                          {topic.topicCode}
                        </span>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                          {topic.topicType}
                        </span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(topic.status)}`}>
                        {topic.status === 'Full' ? 'FULL' : `${topic.availableSlots}/${topic.totalSlots} slots`}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {topic.title}
                    </h3>
                    {topic.titleEn && (
                      <p className="text-sm text-gray-500 italic">
                        {topic.titleEn}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                      {topic.description}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-md space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-[#7C2946]" />
                      <span className="font-medium">
                        {topic.instructorTitle} {topic.instructorName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Building2 className="h-4 w-4" />
                      <span>{topic.instructorDepartment}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4" />
                      <a
                        href={`mailto:${topic.instructorEmail}`}
                        className="text-[#7C2946] hover:underline"
                      >
                        {topic.instructorEmail}
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded">
                        {topic.researchArea}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 text-sm rounded">
                        {topic.department}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      PROGRAM TYPES
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

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      REQUIRED SKILLS
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {topic.requiredSkills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {topic.requiredSkills.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                          +{topic.requiredSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {topic.pendingApplications > 0 && (
                    <p className="text-xs text-yellow-600">
                      {topic.pendingApplications} pending application(s)
                    </p>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleViewDetails(topic)}
                      className="flex-1 flex items-center justify-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </Button>
                    <Button
                      onClick={() => handleApply(topic)}
                      disabled={topic.availableSlots === 0}
                      className="flex-1"
                    >
                      {topic.availableSlots > 0 ? 'Apply' : 'Full'}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {selectedTopic && (
        <ApplicationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTopic(null);
          }}
          topic={selectedTopic}
        />
      )}

      {detailTopic && (
        <TopicDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setDetailTopic(null);
          }}
          topic={detailTopic}
          onApply={() => {
            setIsDetailModalOpen(false);
            setDetailTopic(null);
            handleApply(detailTopic);
          }}
        />
      )}
    </div>
  );
}
