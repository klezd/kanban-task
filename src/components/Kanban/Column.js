// In Column.js
import React from "react";
import PropTypes from "prop-types"; // 👈 Import PropTypes
import TaskCard from "./TaskCard"; // Assuming TaskCard is in the same folder or adjust path

const Column = ({
  title,
  tasks,
  onMoveTask,
  onDeleteTask,
  onEditTask,
  columns,
}) => {
  return (
    <div className="bg-gray-100 p-4 rounded-xl shadow-sm w-full md:w-1/4 flex-shrink-0">
      <h3 className="font-bold text-lg text-gray-700 mb-4 pb-2 border-b-2 border-gray-300">
        {title} ({tasks.length})
      </h3>
      <div className="h-[calc(100vh-280px)] md:h-[calc(100vh-250px)] overflow-y-auto pr-1 custom-scrollbar">
        {tasks.length === 0 && (
          <p className="text-sm text-gray-500">No tasks yet.</p>
        )}
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onMoveTask={onMoveTask}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
            columns={columns}
          />
        ))}
      </div>
    </div>
  );
};

// 👇 Define propTypes for Column
Column.propTypes = {
  title: PropTypes.string.isRequired,
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      status: PropTypes.string.isRequired,
      // Add other properties of a task object if they exist and are used
      // e.g., createdAt: PropTypes.object, // If it's a Firebase Timestamp object
    })
  ).isRequired,
  onMoveTask: PropTypes.func.isRequired,
  onDeleteTask: PropTypes.func.isRequired,
  onEditTask: PropTypes.func.isRequired,
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Column;
