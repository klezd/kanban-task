// In Column.js
import React from "react";
import PropTypes from "prop-types"; // 👈 Import PropTypes
import TaskCard from "./TaskCard"; // Assuming TaskCard is in the same folder or adjust path

const Column = ({
  title,
  tasks,
  onViewTask,
  onEditRequest,
  onDeleteRequest,
}) => {
  return (
    <div className="bg-spearmint-100 p-4 rounded-xl shadow-sm w-full">
      <h3 className="font-bold text-lg text-olive-green-700 mb-4 pb-2 border-b-2 border-spearmint-300 ">
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
            onViewTask={onViewTask}
            onEditRequest={onEditRequest}
            onDeleteRequest={onDeleteRequest}
          />
        ))}
      </div>
    </div>
  );
};

const taskShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  status: PropTypes.string.isRequired,
  createdAt: PropTypes.object, // Firestore Timestamp
  authorId: PropTypes.string,
  deadline: PropTypes.object, // Firestore Timestamp or null
  isImportant: PropTypes.bool,
  isUrgent: PropTypes.bool,
  assigneeIds: PropTypes.arrayOf(PropTypes.string),
});

Column.propTypes = {
  title: PropTypes.string.isRequired,
  tasks: PropTypes.arrayOf(taskShape).isRequired,
  onViewTask: PropTypes.func.isRequired,
  onEditRequest: PropTypes.func.isRequired,
  onDeleteRequest: PropTypes.func.isRequired,
};

export default Column;
