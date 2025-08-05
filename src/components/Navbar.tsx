import { Menu } from "lucide-react";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

const Navbar = ({ onToggleSidebar }: NavbarProps) => {
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Sidebar toggle */}
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Empty right side - all user functionality moved to sidebar */}
          <div className="flex items-center">
            {/* Spacer to balance the layout */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
