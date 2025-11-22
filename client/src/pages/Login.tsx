import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardBody } from '../components/common/Card';
import Button from '../components/common/Button';
import { BookOpen, Users, AlertCircle } from 'lucide-react';
import { mockStudents, mockInstructors, mockAdmins } from '../services/mockData';

export default function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, switchUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(userId, password);
      if (success) {
        // Get user from localStorage (set by authService)
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          // Redirect based on role (now normalized to lowercase)
          switch (user.role.toLowerCase()) {
            case 'student':
              navigate('/student');
              break;
            case 'instructor':
              navigate('/instructor');
              break;
            case 'admin':
            case 'department':
              navigate('/admin');
              break;
            default:
              navigate('/');
          }
        }
      } else {
        setError('Invalid user ID or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (userId: string) => {
    switchUser(userId);
    const allUsers = [...mockStudents, ...mockInstructors, ...mockAdmins];
    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      switch (user.role) {
        case 'student':
          navigate('/student');
          break;
        case 'instructor':
          navigate('/instructor');
          break;
        case 'admin':
          navigate('/admin');
          break;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Thesis Management System
          </h1>
          <p className="text-gray-600">
            Streamline your thesis registration and approval process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardBody>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Login
              </h2>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="userId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    User ID (Student ID or Employee ID)
                  </label>
                  <input
                    type="text"
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2052001 or 003282"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                </div>

                <Button type="submit" className="w-full" isLoading={loading}>
                  Sign In
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Demo Quick Login
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                For demonstration purposes, click any user below to quickly log
                in:
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-blue-600" />
                    Students
                  </h3>
                  <div className="space-y-2">
                    {mockStudents.map((student) => (
                      <button
                        key={student.id}
                        onClick={() => handleQuickLogin(student.id)}
                        className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        <p className="font-medium text-gray-900">
                          {student.fullName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {student.email}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-purple-600" />
                    Instructors
                  </h3>
                  <div className="space-y-2">
                    {mockInstructors.map((instructor) => (
                      <button
                        key={instructor.id}
                        onClick={() => handleQuickLogin(instructor.id)}
                        className="w-full text-left px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
                      >
                        <p className="font-medium text-gray-900">
                          {instructor.fullName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {instructor.email}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-green-600" />
                    Administrators
                  </h3>
                  <div className="space-y-2">
                    {mockAdmins.map((admin) => (
                      <button
                        key={admin.id}
                        onClick={() => handleQuickLogin(admin.id)}
                        className="w-full text-left px-3 py-2 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                      >
                        <p className="font-medium text-gray-900">
                          {admin.fullName}
                        </p>
                        <p className="text-xs text-gray-600">{admin.email}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
