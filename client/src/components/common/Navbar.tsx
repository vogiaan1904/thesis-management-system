import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, BookOpen } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = () => {
    if (!user) return '';
    switch (user.role) {
      case 'student':
        return 'Student Portal';
      case 'instructor':
        return 'Instructor Portal';
      case 'admin':
        return 'Admin Portal';
      default:
        return '';
    }
  };

  const getHomeLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'student':
        return '/student';
      case 'instructor':
        return '/instructor';
      case 'admin':
        return '/admin';
      default:
        return '/';
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to={getHomeLink()} className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              Thesis Management
            </span>
          </Link>

          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {getRoleLabel()}
              </span>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {!user && (
            <Link
              to="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
