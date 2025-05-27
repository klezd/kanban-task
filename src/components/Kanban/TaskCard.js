import React, { useState, } from "react";
import PropTypes from "prop-types";
import { Timestamp } from "firebase/firestore";  
import { ChevronDown,  Trash2, Edit3, Save, XCircle } from "lucide-react";

// --- Task Card Component ---
const TaskCard = ({ task, onMoveTask, onDeleteTask, onEditTask, columns }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);

  const handleSaveEdit = () => {
    if (editTitle.trim() === "") {
      // Basic validation: title should not be empty
      alert("Task title cannot be empty."); // Replace with a modal in a real app
      return;
    }
    onEditTask(task.id, { title: editTitle, description: editDescription });
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-3 mb-3 rounded-lg shadow-md border border-spearmint-200">
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Task Title"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 h-20"
            placeholder="Task Description"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleSaveEdit}
              className="p-2 bg-tangerine-500 text-white rounded-md hover:bg-tangerine-600 flex items-center"
            >
              <Save size={16} className="mr-1" /> Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 flex items-center"
            >
              <XCircle size={16} className="mr-1" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <h4 className="font-semibold text-olive-green-700 break-words">
            {task.title}
          </h4>
          <p className="text-sm text-olive-green-600 mt-1 break-words">
            {task.description}
          </p>
          <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between items-center">
            <div className="relative">
              <select
                value={task.status}
                onChange={(e) => onMoveTask(task.id, e.target.value)}
                className="text-xs bg-gray-100 p-1.5 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-misty-blue-400 pr-6"
              >
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-misty-blue-600 hover:text-misty-blue-700 hover:bg-blue-100 rounded-full"
                title="Edit Task"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => onDeleteTask(task.id)}
                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full"
                title="Delete Task"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// 👇 Define propTypes for TaskCard
TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string, // Assuming description can be optional
    status: PropTypes.string.isRequired,
    // Add other properties of task if they exist, e.g., createdAt
    createdAt: PropTypes.oneOfType([
      // Handle both Timestamp object and potential null/undefined before hydration
      PropTypes.instanceOf(Timestamp),
      PropTypes.object, // Could be a plain object before conversion or if not yet set
    ]),
  }).isRequired,
  onMoveTask: PropTypes.func.isRequired,
  onDeleteTask: PropTypes.func.isRequired,
  onEditTask: PropTypes.func.isRequired,
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default TaskCard;