import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { ThesisTopic, TopicFormData, TopicType } from '../../types';
import { topicService } from '../../services/api';
import Button from '../common/Button';

interface TopicFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic?: ThesisTopic | null;
  onSuccess: () => void;
}

const TOPIC_TYPES: { value: TopicType; label: string }[] = [
  { value: 'DCLV', label: 'Đồ án chuyên ngành (DCLV)' },
  { value: 'DACN', label: 'Đồ án cơ sở (DACN)' },
  { value: 'DAMHKTMT', label: 'Đồ án MHKTMT' },
  { value: 'LVTN', label: 'Luận văn tốt nghiệp (LVTN)' },
  { value: 'DATN', label: 'Đồ án tốt nghiệp (DATN)' },
];

const PROGRAM_TYPES = [
  { value: 'CQ', label: 'Chính quy (CQ)' },
  { value: 'CN', label: 'Cử nhân (CN)' },
  { value: 'B2', label: 'Bằng 2 (B2)' },
  { value: 'SN', label: 'Song ngữ (SN)' },
  { value: 'VLVH', label: 'Vừa làm vừa học (VLVH)' },
  { value: 'TX', label: 'Từ xa (TX)' },
];

const DEPARTMENTS = [
  'Information Technology',
  'Computer Science',
  'Software Engineering',
  'Computer Networks',
  'Data Science',
  'Artificial Intelligence',
];

export default function TopicFormModal({
  isOpen,
  onClose,
  topic,
  onSuccess,
}: TopicFormModalProps) {
  const isEditing = !!topic;

  const [formData, setFormData] = useState<TopicFormData>({
    topicCode: '',
    semester: '',
    topicType: 'DCLV',
    titleVn: '',
    titleEn: '',
    description: '',
    phase1Requirements: '',
    phase2Requirements: '',
    references: [],
    prerequisites: '',
    programTypes: ['CQ'],
    department: 'Information Technology',
    maxStudents: 1,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (topic) {
      setFormData({
        topicCode: topic.topicCode,
        semester: topic.semester,
        topicType: topic.topicType,
        titleVn: topic.titleVn,
        titleEn: topic.titleEn || '',
        description: topic.description,
        phase1Requirements: topic.phase1Requirements || '',
        phase2Requirements: topic.phase2Requirements || '',
        references: topic.references || [],
        prerequisites: topic.prerequisites || '',
        programTypes: topic.programTypes,
        department: topic.department,
        maxStudents: topic.maxStudents,
      });
    } else {
      // Reset form for new topic
      setFormData({
        topicCode: '',
        semester: getCurrentSemester(),
        topicType: 'DCLV',
        titleVn: '',
        titleEn: '',
        description: '',
        phase1Requirements: '',
        phase2Requirements: '',
        references: [],
        prerequisites: '',
        programTypes: ['CQ'],
        department: 'Information Technology',
        maxStudents: 1,
      });
    }
    setErrors({});
  }, [topic, isOpen]);

  const getCurrentSemester = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    // HK1: Sep-Jan, HK2: Feb-Jun, HK3: Jun-Aug
    if (month >= 9 || month <= 1) {
      return `HK${year}1`;
    } else if (month >= 2 && month <= 6) {
      return `HK${year}2`;
    } else {
      return `HK${year}3`;
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.topicCode.trim()) {
      newErrors.topicCode = 'Topic code is required';
    }
    if (!formData.semester.trim()) {
      newErrors.semester = 'Semester is required';
    }
    if (!formData.titleVn.trim()) {
      newErrors.titleVn = 'Vietnamese title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.programTypes.length === 0) {
      newErrors.programTypes = 'At least one program type is required';
    }
    if (formData.maxStudents < 1) {
      newErrors.maxStudents = 'Max students must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      if (isEditing && topic) {
        await topicService.update(topic.id, formData);
      } else {
        await topicService.create(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProgramTypeChange = (programType: string) => {
    setFormData((prev) => ({
      ...prev,
      programTypes: prev.programTypes.includes(programType)
        ? prev.programTypes.filter((p) => p !== programType)
        : [...prev.programTypes, programType],
    }));
  };

  const addReference = () => {
    setFormData((prev) => ({
      ...prev,
      references: [...(prev.references || []), { text: '', url: '' }],
    }));
  };

  const updateReference = (index: number, field: 'text' | 'url', value: string) => {
    setFormData((prev) => ({
      ...prev,
      references: prev.references?.map((ref, i) =>
        i === index ? { ...ref, [field]: value } : ref
      ),
    }));
  };

  const removeReference = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      references: prev.references?.filter((_, i) => i !== index),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Topic' : 'Create New Topic'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Topic Code and Semester */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.topicCode}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, topicCode: e.target.value }))
                  }
                  placeholder="e.g., HK251-DCLV-010"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7C2946] focus:border-transparent ${
                    errors.topicCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.topicCode && (
                  <p className="mt-1 text-sm text-red-500">{errors.topicCode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.semester}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, semester: e.target.value }))
                  }
                  placeholder="e.g., HK20251"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7C2946] focus:border-transparent ${
                    errors.semester ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.semester && (
                  <p className="mt-1 text-sm text-red-500">{errors.semester}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.topicType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      topicType: e.target.value as TopicType,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C2946] focus:border-transparent"
                >
                  {TOPIC_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vietnamese Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.titleVn}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, titleVn: e.target.value }))
                  }
                  placeholder="Tiêu đề tiếng Việt"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7C2946] focus:border-transparent ${
                    errors.titleVn ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.titleVn && (
                  <p className="mt-1 text-sm text-red-500">{errors.titleVn}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  English Title
                </label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, titleEn: e.target.value }))
                  }
                  placeholder="English title (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C2946] focus:border-transparent"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={4}
                placeholder="Detailed description of the thesis topic..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7C2946] focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Department and Max Students */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, department: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C2946] focus:border-transparent"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Students <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.maxStudents}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxStudents: parseInt(e.target.value) || 1,
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7C2946] focus:border-transparent ${
                    errors.maxStudents ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.maxStudents && (
                  <p className="mt-1 text-sm text-red-500">{errors.maxStudents}</p>
                )}
              </div>
            </div>

            {/* Program Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Eligible Programs <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {PROGRAM_TYPES.map((program) => (
                  <label
                    key={program.value}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.programTypes.includes(program.value)}
                      onChange={() => handleProgramTypeChange(program.value)}
                      className="w-4 h-4 text-[#7C2946] border-gray-300 rounded focus:ring-[#7C2946]"
                    />
                    <span className="text-sm text-gray-700">{program.label}</span>
                  </label>
                ))}
              </div>
              {errors.programTypes && (
                <p className="mt-1 text-sm text-red-500">{errors.programTypes}</p>
              )}
            </div>

            {/* Prerequisites */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prerequisites
              </label>
              <textarea
                value={formData.prerequisites}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, prerequisites: e.target.value }))
                }
                rows={2}
                placeholder="Required skills and knowledge..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C2946] focus:border-transparent"
              />
            </div>

            {/* Phase Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phase 1 Requirements
                </label>
                <textarea
                  value={formData.phase1Requirements}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phase1Requirements: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Preliminary research requirements..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C2946] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phase 2 Requirements
                </label>
                <textarea
                  value={formData.phase2Requirements}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phase2Requirements: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Implementation requirements..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C2946] focus:border-transparent"
                />
              </div>
            </div>

            {/* References */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  References
                </label>
                <button
                  type="button"
                  onClick={addReference}
                  className="flex items-center space-x-1 text-sm text-[#7C2946] hover:text-[#5a1f33]"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Reference</span>
                </button>
              </div>
              <div className="space-y-3">
                {formData.references?.map((ref, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={ref.text}
                        onChange={(e) => updateReference(index, 'text', e.target.value)}
                        placeholder="Reference text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C2946] focus:border-transparent"
                      />
                      <input
                        type="url"
                        value={ref.url || ''}
                        onChange={(e) => updateReference(index, 'url', e.target.value)}
                        placeholder="URL (optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C2946] focus:border-transparent"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeReference(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? 'Saving...'
                : isEditing
                ? 'Update Topic'
                : 'Create Topic'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
