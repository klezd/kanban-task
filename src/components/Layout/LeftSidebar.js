import React, {useEffect, useRef } from "react";
import PropTypes from "prop-types"; 

import {
  X as XIcon,
  LogOut,
} from "lucide-react";

const LeftSidebar = ({ isOpen, onClose, onSignOut, user }) => {
  const sidebarRef = useRef(null); // 👈 1. Create a ref for the sidebar panel

  // 👈 2. Add useEffect to handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the sidebar panel
      // Also check if the click is not on the menu button that opens this sidebar (optional, but good UX)
      // For this, you might need to pass the menu button ref or a specific class/id to ignore.
      // For simplicity here, we'll just check if the click is outside the sidebar panel itself.
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      // Add event listener when the sidebar is open
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // Remove event listener when the sidebar is closed
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup function to remove the event listener when the component unmounts or before the effect re-runs
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]); // Effect depends on isOpen and onClose

  if (!isOpen) return null;

  const handleSignOut = () => {
    try {
      onSignOut();
    } catch (e) {
      console.error(e);
    } finally {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleSignOut}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleSignOut();
          }
        }}
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden"
        role="button" // Indicate it behaves like a button
        tabIndex={0} // Make it focusable
        aria-label="Close menu" // Add an accessible label
      ></div>

      {/* Sidebar Panel */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 w-64 h-full bg-olive-green-800 text-spearmint-100 p-6 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-spearmint-50">Menu</h2>{" "}
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-700"
            aria-label="Close menu"
          >
            <XIcon size={24} />
          </button>
        </div>
        <nav>
          <ul>{/* Add other navigation items here if needed */}</ul>
        </nav>
        <div className="mt-auto absolute bottom-6 left-6 right-6">
          {" "}
          {/* This outer div still positions the block at the bottom */}
          {user && (
            // This single div now contains both user info and the sign-out button
            <div className="flex items-center justify-between p-3 rounded-lg bg-olive-green-700 hover:bg-olive-green-600 transition-colors">
              {/* User Info Part (will be on the left) */}
              <div className="overflow-hidden">
                {/* Added for text truncation if needed */}
                <p className="text-sm font-medium truncate text-spearmint-100">
                  {user.displayName || user.email}
                </p>
              </div>

              {/* Sign Out Icon Button Part (will be on the right due to justify-between) */}
              <button
                onClick={onSignOut}
                className="p-2 -mr-1 bg-transparent text-spearmint-200 hover:bg-tangerine-500 hover:text-olive-green-900 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-tangerine-400 focus:ring-opacity-75"
                aria-label="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
          {/* If no user, this section will be empty due to the {user && ...} condition */}
        </div>
      </div>
    </>
  );
};

LeftSidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSignOut: PropTypes.func.isRequired,
  user: PropTypes.object, // Firebase user object
};

export default LeftSidebar