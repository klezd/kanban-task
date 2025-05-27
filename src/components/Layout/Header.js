import React from "react";
import PropTypes from "prop-types"; 

const Header = ({
  userId
}) => {
   return (
    <header className="mb-6">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
        Kanban Task Tracker
      </h1>
      {userId && (
        <p className="text-center text-xs text-gray-500 mt-1">
          User ID:{" "}
          <span className="font-mono bg-gray-200 px-1 py-0.5 rounded">
            {userId}
          </span>
        </p>
      )}
    </header>
   )
}


Header.propTypes = {
  userId: PropTypes.string.isRequired,
};
export default Header