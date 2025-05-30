/* eslint-disable no-unused-vars */
// src/components/Kanban/TaskDetailView.js
import React from "react";
import PropTypes from "prop-types";
import { formatDeadlineDisplay } from "../../utils/dateUtils"; // Adjust path
// Assuming KANBAN_COLUMNS might be needed for status display styling, or pass status text directly
import { KANBAN_COLUMNS } from "../../utils/constants";
import Chip from "../common/Chip";
import { taskPropTypes } from "../../utils/types";

const TaskDetailView = ({ task, onToggleSubtaskComplete, isSaving }) => {
  if (!task)
    return <p className="text-olive-green-600">No task data available.</p>;

  const getStatusChipColor = (status) => {
    // You can expand this logic for more colors based on status
    if (status === "Done") return "bg-olive-green-200 text-olive-green-800";
    if (status === "In Progress")
      return "bg-misty-blue-200 text-misty-blue-800";
    return "bg-spearmint-200 text-olive-green-700";
  };

  return (
    <div className="space-y-4">
      {" "}
      {/* Increased spacing a bit */}
      {/* Status, Important, Urgent Chips */}
      <div className="flex items-center flex-wrap gap-2 mb-4">
        <Chip title={task.status} color={getStatusChipColor(task.status)} />

        {task.isImportant && (
          <Chip title="Important" color="bg-tangerine-100 text-tangerine-800" />
        )}
        {task.isUrgent && (
          <Chip title="Urgent" color="bg-red-100 text-red-700" />
        )}
      </div>
      {/* Description */}
      {task.description && (
        <div>
          <strong className="block text-sm font-medium text-olive-green-600 mb-1">
            Description:
          </strong>
          <p className="text-sm text-olive-green-700 whitespace-pre-wrap bg-spearmint-50 p-3 rounded-md">
            {task.description}
          </p>
        </div>
      )}
      {/* Checklist */}
      {task.checklist && task.checklist.length > 0 && (
        <div className="pt-2">
          <h3 className="text-sm font-medium text-olive-green-600 mb-1">
            Checklist ({task.checklist.filter((i) => i.isCompleted).length}/
            {task.checklist.length})
          </h3>
          <div className="space-y-1.5 pl-1">
            {task.checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-center p-1.5 hover:bg-spearmint-100 rounded group"
              >
                <input
                  type="checkbox"
                  id={`view-subtask-check-${task.id}-${item.id}`} // More unique ID
                  checked={item.isCompleted}
                  onChange={() => onToggleSubtaskComplete(item.id)}
                  className="h-4 w-4 text-misty-blue-600 border-spearmint-300 rounded focus:ring-misty-blue-500 cursor-pointer flex-shrink-0"
                  disabled={isSaving}
                />
                <label
                  htmlFor={`view-subtask-check-${task.id}-${item.id}`}
                  className={`ml-2.5 text-sm flex-grow cursor-pointer ${
                    item.isCompleted
                      ? "line-through text-olive-green-500"
                      : "text-olive-green-700"
                  }`}
                >
                  {item.text}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Meta Info Block */}
      <div className="mt-4 pt-4 border-t border-spearmint-200 space-y-1.5 text-xs text-olive-green-700">
        <p>
          <strong className="text-olive-green-600">Deadline:</strong>{" "}
          {formatDeadlineDisplay(task.deadline)}
        </p>
        <p>
          <strong className="text-olive-green-600">Created:</strong>{" "}
          {task.createdAt ? formatDeadlineDisplay(task.createdAt) : "N/A"}
        </p>
        <p>
          <strong className="text-olive-green-600">Author:</strong> You{" "}
          {task.authorId && typeof task.authorId === "string"
            ? `(ID: ${task.authorId.substring(0, 6)}...)`
            : ""}
        </p>
        <p>
          <strong className="text-olive-green-600">Assigned to:</strong> You
        </p>
      </div>
    </div>
  );
};

TaskDetailView.propTypes = {
  task: taskPropTypes,
  onToggleSubtaskComplete: PropTypes.func.isRequired,
  isSaving: PropTypes.bool, // To disable checkboxes while saving
};

export default TaskDetailView;
