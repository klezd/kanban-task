import React, {useEffect, useRef } from "react";
import PropTypes from "prop-types"; 

import {
  X as XIcon,
} from "lucide-react";

const RightSidebar = ({ isOpen, onClose, user }) => {
  const sidebarRef = useRef(null); // 👈 1. Create a ref for the sidebar panel

  // 👈 2. Add useEffect to handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the sidebar panel
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

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onClose();
          }
        }}
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden"
        role="button" // Indicate it behaves like a button
        tabIndex={0} // Make it focusable
        aria-label="Close user menu" // Add an accessible label
      ></div>

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 right-0 w-64 h-full bg-spearmint-50 p-6 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        ref={sidebarRef}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-olive-green-700">
            User Profile
          </h2>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            aria-label="Close user menu"
          >
            <XIcon size={24} />
          </button>
        </div>

        {user && (
          <div className="text-center mb-4">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt="User"
                className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-misty-blue-500"
              />
            )}
            <p className="font-semibold text-olive-green-700">
              {user.displayName || "User"}
            </p>
            <p className="text-sm text-olive-green-600 truncate">
              {user.email}
            </p>
          </div>
        )}
        <p className="text-gray-600">
          User-specific content or settings can go here.
        </p>
        {/* Example: Account settings, preferences, etc. */}
      </div>
    </>
  );
};

RightSidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object, // Firebase user object
};

export default RightSidebar;