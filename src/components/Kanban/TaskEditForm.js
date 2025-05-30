/* eslint-disable no-unused-vars */
// src/components/Kanban/TaskEditForm.js
import React from "react";
import PropTypes from "prop-types";
import { KANBAN_COLUMNS } from "../../utils/constants";
import {
  getLocalDateInputString,
  formatDeadlineDisplay,
} from "../../utils/dateUtils"; // Adjust path
import {
  PlusCircle as AddSubtaskIcon,
  Trash2 as DeleteSubtaskIcon,
} from "lucide-react";

const MAX_CHECKLIST_ITEMS = 10; // Define or import

const TaskEditForm = ({
  task, // The original task for read-only fields like createdAt
  editTitle,
  setEditTitle,
  editDescription,
  setEditDescription,
  editStatus,
  setEditStatus,
  editDeadline,
  handleDeadlineChange, // Pass the specific handler
  editIsImportant,
  setEditIsImportant,
  editIsUrgent,
  handleIsUrgentChange, // Pass the specific handler
  editChecklist,
  setEditChecklist,
  newSubtaskText,
  setNewSubtaskText,
  onAddSubtaskItem,
  onDeleteSubtaskItem,
  onToggleSubtaskCompleteInEdit,
  onSubtaskTextChange,
  saveError,
}) => {
  return (
    <form onSubmit={(e) => e.preventDefault()} id="editTaskForm">
      {" "}
      {/* onSubmit handled by footer button */}
      {saveError && (
        <p className="mb-3 text-sm text-red-600 bg-red-100 p-2 rounded-md">
          {saveError}
        </p>
      )}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="editTaskTitle"
            className="block text-sm font-medium text-olive-green-700 mb-1"
          >
            Title
          </label>
          <input
            id="editTaskTitle"
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full p-3 border border-spearmint-300 rounded-lg focus:ring-2 focus:ring-misty-blue-400 focus:border-misty-blue-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="editTaskDescription"
            className="block text-sm font-medium text-olive-green-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="editTaskDescription"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full p-3 border border-spearmint-300 rounded-lg focus:ring-2 focus:ring-misty-blue-400 focus:border-misty-blue-500 h-24 resize-none"
          />
        </div>
        <div>
          <label
            htmlFor="editTaskStatus"
            className="block text-sm font-medium text-olive-green-700 mb-1"
          >
            Status
          </label>
          <select
            id="editTaskStatus"
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
            className="w-full p-3 border border-spearmint-300 rounded-lg focus:ring-2 focus:ring-misty-blue-400 focus:border-misty-blue-500 bg-white"
          >
            {KANBAN_COLUMNS.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="editTaskDeadline"
            className="block text-sm font-medium text-olive-green-700 mb-1"
          >
            Deadline
          </label>
          <input
            id="editTaskDeadline"
            type="date"
            value={editDeadline}
            onChange={handleDeadlineChange}
            className="w-full p-3 border border-spearmint-300 rounded-lg focus:ring-2 focus:ring-misty-blue-400 focus:border-misty-blue-500"
            min={getLocalDateInputString(new Date())}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center p-2 rounded-md hover:bg-spearmint-100">
            <input
              id="editTaskImportant"
              type="checkbox"
              checked={editIsImportant}
              onChange={(e) => setEditIsImportant(e.target.checked)}
              className="h-5 w-5 text-tangerine-500 border-spearmint-300 rounded focus:ring-tangerine-400 cursor-pointer"
            />
            <label
              htmlFor="editTaskImportant"
              className="ml-2 text-sm font-medium text-olive-green-700 cursor-pointer"
            >
              Important
            </label>
          </div>
          <div className="flex items-center p-2 rounded-md hover:bg-spearmint-100">
            <input
              id="editTaskUrgent"
              type="checkbox"
              checked={editIsUrgent}
              onChange={handleIsUrgentChange}
              className="h-5 w-5 text-tangerine-500 border-spearmint-300 rounded focus:ring-tangerine-400 cursor-pointer"
            />
            <label
              htmlFor="editTaskUrgent"
              className="ml-2 text-sm font-medium text-olive-green-700 cursor-pointer"
            >
              Urgent
            </label>
          </div>
        </div>

        <hr className="border-spearmint-200 my-3" />
        <div>
          <h3 className="text-sm font-medium text-olive-green-700 mb-2">
            Checklist Items
          </h3>
          {editChecklist.map((item) => (
            <div
              key={item.id}
              className="flex items-center mb-2 space-x-2 p-1.5 bg-spearmint-50 rounded"
            >
              <input
                type="checkbox"
                id={`edit-subtask-check-${item.id}`}
                checked={item.isCompleted}
                onChange={() => onToggleSubtaskCompleteInEdit(item.id)}
                className="h-5 w-5 text-misty-blue-600 border-spearmint-300 rounded focus:ring-misty-blue-500 cursor-pointer flex-shrink-0"
              />
              <input
                type="text"
                value={item.text}
                onChange={(e) => onSubtaskTextChange(item.id, e.target.value)}
                className={`flex-grow p-1 text-sm rounded border ${
                  item.isCompleted
                    ? "line-through text-gray-500"
                    : "text-olive-green-700"
                } border-transparent hover:border-spearmint-300 focus:border-misty-blue-300 focus:ring-1 focus:ring-misty-blue-300`}
                placeholder="Subtask description"
              />
              <button
                type="button"
                onClick={() => onDeleteSubtaskItem(item.id)}
                className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 flex-shrink-0"
                aria-label="Delete subtask item"
              >
                <DeleteSubtaskIcon size={16} />
              </button>
            </div>
          ))}
          {editChecklist.length < MAX_CHECKLIST_ITEMS && (
            <div className="flex items-center mt-2 space-x-2">
              <input
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                placeholder="Add new item..."
                className="w-full flex-grow p-2 border border-spearmint-300 rounded-lg focus:ring-2 focus:ring-misty-blue-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onAddSubtaskItem();
                  }
                }}
              />
              <button
                type="button"
                onClick={onAddSubtaskItem}
                className="p-2 bg-misty-blue-400 text-white rounded-lg hover:bg-misty-blue-500 transition-colors flex-shrink-0"
                aria-label="Add subtask item"
              >
                <AddSubtaskIcon size={20} />
              </button>
            </div>
          )}
          {editChecklist.length >= MAX_CHECKLIST_ITEMS && (
            <p className="text-xs text-tangerine-600 mt-1">
              Max checklist items reached.
            </p>
          )}
        </div>
        <div className="text-xs text-olive-green-500 mt-3">
          <p>
            Created:{" "}
            {task?.createdAt ? formatDeadlineDisplay(task.createdAt) : "N/A"} by
            You
          </p>
        </div>
      </div>
    </form>
  );
};

TaskEditForm.propTypes = {
  task: PropTypes.object,
  editTitle: PropTypes.string.isRequired,
  setEditTitle: PropTypes.func.isRequired,
  editDescription: PropTypes.string.isRequired,
  setEditDescription: PropTypes.func.isRequired,
  editStatus: PropTypes.string.isRequired,
  setEditStatus: PropTypes.func.isRequired,
  editDeadline: PropTypes.string.isRequired,
  handleDeadlineChange: PropTypes.func.isRequired,
  editIsImportant: PropTypes.bool.isRequired,
  setEditIsImportant: PropTypes.func.isRequired,
  editIsUrgent: PropTypes.bool.isRequired,
  handleIsUrgentChange: PropTypes.func.isRequired,
  editChecklist: PropTypes.array.isRequired,
  setEditChecklist: PropTypes.func.isRequired,
  newSubtaskText: PropTypes.string.isRequired,
  setNewSubtaskText: PropTypes.func.isRequired,
  onAddSubtaskItem: PropTypes.func.isRequired,
  onDeleteSubtaskItem: PropTypes.func.isRequired,
  onToggleSubtaskCompleteInEdit: PropTypes.func.isRequired,
  onSubtaskTextChange: PropTypes.func.isRequired,
  saveError: PropTypes.string,
};

export default TaskEditForm;
