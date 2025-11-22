import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

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
      case 'department':
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
      case 'department':
        return '/admin';
      default:
        return '/';
    }
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to={getHomeLink()} className="flex items-center space-x-3">
            <img
              src="/logo-vector-IU-01.png"
              alt="IU Logo"
              className="h-10 w-auto"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-[#7C2946]">
                Thesis Management
              </span>
              <span className="text-xs text-gray-500">
                International University
              </span>
            </div>
          </Link>

          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-[#7C2946] bg-[#7C2946]/10 px-3 py-1 rounded-full">
                {getRoleLabel()}
              </span>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">{user.fullName}</span>
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
              className="bg-[#7C2946] text-white px-4 py-2 rounded-md hover:bg-[#5a1f33] transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
