// src/components/Matrix/Quadrant.js
import React from "react";
import PropTypes from "prop-types";
// Assuming your date utility function is here, adjust path as needed
import { formatDeadlineDisplay } from "../../utils/dateUtils";

// Define the shape of a task specifically for the Quadrant's needs
// Or import your shared taskPropTypes if it's suitable
const taskShapeForQuadrant = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  deadline: PropTypes.object, // Firestore Timestamp or null
  // Add other fields if your compact task display in Quadrant uses them
});

const Quadrant = ({
  actionText,
  tasksInQuadrant,
  quadrantStyle,
  onViewTask,
}) => {
  return (
    <div
      className={`p-4 flex flex-col min-h-[250px] md:min-h-[300px] ${quadrantStyle} rounded-lg shadow-md`} // Added shadow-md here
    >
      <h3 className="font-bold text-xl text-olive-green-800 mb-3 text-center">
        {actionText}
      </h3>
      {tasksInQuadrant.length === 0 ? (
        <p className="text-sm text-olive-green-600 text-center italic mt-4 flex-grow flex items-center justify-center">
          No tasks here.
        </p>
      ) : (
        <div className="space-y-2 overflow-y-auto custom-scrollbar flex-grow ">
          {tasksInQuadrant.map((task) => (
            <div
              key={task.id}
              className="p-2.5 bg-white rounded-md shadow border border-spearmint-200 text-sm text-olive-green-700 cursor-pointer hover:shadow-lg hover:border-misty-blue-300 transition-all"
              onClick={() => onViewTask(task)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onViewTask(task);
              }}
              tabIndex={0}
              role="button"
              aria-label={`View task: ${task.title}`}
            >
              <p className="font-medium truncate">{task.title}</p>
              {task.deadline && (
                <p className="text-xs text-tangerine-600 mt-0.5">
                  {formatDeadlineDisplay(task.deadline)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

Quadrant.propTypes = {
  actionText: PropTypes.string.isRequired,
  tasksInQuadrant: PropTypes.arrayOf(taskShapeForQuadrant).isRequired,
  quadrantStyle: PropTypes.string.isRequired,
  onViewTask: PropTypes.func.isRequired,
};

export default Quadrant;
