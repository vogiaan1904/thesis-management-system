import React, { useState, useEffect } from 'react';
import { topicService } from '../../services/api';
import { ThesisTopic } from '../../types';
import { Card, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import ApplicationModal from '../../components/student/ApplicationModal';
import { Search, Filter, Users, Mail } from 'lucide-react';

export default function TopicBrowser() {
  const [topics, setTopics] = useState<ThesisTopic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<ThesisTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<ThesisTopic | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {topic.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          topic.availableSlots > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {topic.availableSlots > 0
                          ? `${topic.availableSlots} slots`
                          : 'FULL'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {topic.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{topic.instructorName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <a
                        href={`mailto:${topic.instructorEmail}`}
                        className="text-blue-600 hover:underline"
                      >
                        Email
                      </a>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      RESEARCH AREA
                    </p>
                    <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded">
                      {topic.researchArea}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      REQUIRED SKILLS
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {topic.requiredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {topic.pendingApplications > 0 && (
                    <p className="text-xs text-yellow-600">
                      {topic.pendingApplications} pending application(s)
                    </p>
                  )}

                  <Button
                    onClick={() => handleApply(topic)}
                    disabled={topic.availableSlots === 0}
                    className="w-full"
                  >
                    {topic.availableSlots > 0
                      ? 'Apply for this Topic'
                      : 'Topic Full'}
                  </Button>
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
    </div>
  );
}
