import { Menu } from "lucide-react";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

const Navbar = ({ onToggleSidebar }: NavbarProps) => {
  return (
    <nav className="bg-white dark:bg-neutral-800 shadow-lg border-b border-gray-200 dark:border-neutral-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Sidebar toggle */}
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className="p-2 text-gray-600 dark:text-neutral-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200"
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
