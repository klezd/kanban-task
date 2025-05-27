import React, { useState } from "react";
import PropTypes from "prop-types";

import { Menu as MenuIcon, User as UserIcon } from "lucide-react";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

const Header = ({ user, handleSignOut }) => {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  return (
    <>
      <header className="mb-6 p-4 bg-spearmint-50 shadow-md sticky top-0 z-40">
        {/* Added sticky, z-index, bg, padding */}
        <div className="w-full mx-auto flex justify-between items-center">
          {/* Left Side: Hamburger Menu for Left Sidebar */}
          {user && ( // Only show if user is logged in
            <button
              onClick={() => setIsLeftSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100 text-misty-blue-600 hover:text-misty-blue-700  focus:outline-none focus:ring-2 focus:ring-inset focus:text-misty-blue-950"
              aria-label="Open navigation menu"
            >
              <MenuIcon size={24} />
            </button>
          )}
          {!user && <div />}{" "}
          {/* Placeholder to keep title centered if no user */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-olive-green-700 text-center flex-grow">
            Kanban Task Tracker
          </h1>{" "}
          {/* Right Side: User Icon for Right Sidebar */}
          {user && ( // Only show if user is logged in
            <button
              onClick={() => setIsRightSidebarOpen(true)}
              className="p-2 rounded-full text-misty-blue-600 hover:text-misty-blue-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:text-misty-blue-950"
              aria-label="Open user menu"
            >
              {/* Display user initial or a generic icon if no photoURL */}
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="User"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <UserIcon size={24} />
              )}
            </button>
          )}
          {!user && <div />} {/* Placeholder */}
        </div>
        {/* Old user info and sign out button previously here is now removed/moved */}
      </header>
      <LeftSidebar
        isOpen={isLeftSidebarOpen}
        onClose={() => setIsLeftSidebarOpen(false)}
        onSignOut={handleSignOut} // Pass your existing handleSignOut function
        user={user}
      />
      <RightSidebar
        isOpen={isRightSidebarOpen}
        onClose={() => setIsRightSidebarOpen(false)}
        user={user}
      />
    </>
  );
};

Header.propTypes = {
  user: PropTypes.object.isRequired,
  handleSignOut: PropTypes.func.isRequired,
};
export default Header;
