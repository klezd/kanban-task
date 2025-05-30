import React from "react";
import PropTypes from "prop-types";
import { Trash2 as DeleteIcon, Edit3 as EditIcon } from "lucide-react";
import { taskPropTypes } from "../../utils/types";

// --- Task Card Component ---
const TaskCard = ({ task, onViewTask, onEditRequest, onDeleteRequest }) => {
  if (!task) {
    return null;
  }

  const handleCardClick = (e) => {
    let targetElement = e.target;
    while (targetElement && targetElement !== e.currentTarget) {
      if (targetElement.tagName === "BUTTON") {
        return;
      }
      targetElement = targetElement.parentElement;
    }
    onViewTask(task);
  };

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return "N/A";
    return timestamp.toDate().toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className="bg-white p-3 mb-3 rounded-lg shadow-md border border-spearmint-200 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleCardClick(e);
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for task: ${task.title}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-olive-green-700 break-words mr-2 flex-grow">
          {task.title}
        </h4>
        <div className="flex space-x-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditRequest(task);
            }}
            className="p-1.5 text-misty-blue-600 hover:text-misty-blue-700 hover:bg-misty-blue-100 rounded-full"
            title="Edit Task"
            aria-label={`Edit task: ${task.title}`}
          >
            <EditIcon size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRequest(task.id);
            }}
            className="p-1.5 text-tangerine-600 hover:text-tangerine-700 hover:bg-tangerine-100 rounded-full"
            title="Delete Task"
            aria-label={`Delete task: ${task.title}`}
          >
            <DeleteIcon size={16} />
          </button>
        </div>
      </div>

      {task.deadline && (
        <p className="text-xs text-tangerine-700 mt-1">
          Deadline: {formatDate(task.deadline)}
        </p>
      )}
      <p className="text-xs text-olive-green-600/80 mt-1">
        Created: {formatDate(task.createdAt)}
      </p>
      {task.assigneeIds && task.assigneeIds.length > 0 && (
        <p className="text-xs text-misty-blue-700 mt-1">Assigned to: You</p>
      )}
      <div className="mt-2 flex space-x-2">
        {task.isImportant && (
          <span className="text-xs px-2 py-0.5 bg-tangerine-100 text-tangerine-700 rounded-full">
            Important
          </span>
        )}
        {task.isUrgent && (
          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
            Urgent
          </span>
        )}
      </div>
    </div>
  );
};

TaskCard.propTypes = {
  task: taskPropTypes,
  onViewTask: PropTypes.func.isRequired,
  onEditRequest: PropTypes.func.isRequired,
  onDeleteRequest: PropTypes.func.isRequired,
};

export default TaskCard;
