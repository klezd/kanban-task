/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { Modal } from "../common";
import {
  Edit2 as EditIcon,
  Trash2 as DeleteIcon,
  XSquare as CloseIcon,
  Save as SaveIcon,
  Loader2 as SpinnerIcon,
  PlusCircle as AddSubtaskIcon,
  Trash2 as DeleteSubtaskIcon,
} from "lucide-react";

import {
  formatDeadlineDisplay,
  getLocalDateInputString,
  isDeadlineUrgent,
  parseDateStringToTimestamp,
} from "../../utils/dateUtils";
import { KANBAN_COLUMNS, MAX_CHECKLIST_ITEMS } from "../../utils/constants";

const TaskDetailModal = ({
  isOpen,
  onClose,
  task,
  onSave, // Expects (taskId, updatedData)
  onDeleteRequest, // Expects (taskId)
  initialEditMode = false,
}) => {
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [isSaving, setIsSaving] = useState(false); // state for saving indicator
  const [saveError, setSaveError] = useState(""); // state for local save error message

  // Form state - initialized when task prop changes or when editing starts
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editDeadline, setEditDeadline] = useState(""); // Store as YYYY-MM-DD string for input
  const [editIsImportant, setEditIsImportant] = useState(false);
  const [editIsUrgent, setEditIsUrgent] = useState(false);
  const [editHasManuallySetUrgency, setEditHasManuallySetUrgency] =
    useState(false);

  const [originalDeadline, setOriginalDeadline] = useState("");
  // State for checklist items in edit mode
  const [editChecklist, setEditChecklist] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState("");

  // Populate form state when task changes or when entering edit mode
  useEffect(() => {
    if (task) {
      setEditTitle(task.title || "");
      setEditDescription(task.description || "");
      setEditStatus(task.status || KANBAN_COLUMNS[0]);
      const dlStr = getLocalDateInputString(task.deadline);
      setEditDeadline(dlStr);
      setOriginalDeadline(dlStr);
      setEditIsImportant(task.isImportant || false);
      setEditIsUrgent(task.isUrgent || false);
      setEditHasManuallySetUrgency(task.hasManuallySetUrgency || false);
      setEditChecklist(
        task.checklist ? JSON.parse(JSON.stringify(task.checklist)) : []
      );
      setSaveError("");
    }
  }, [task]);

  // Effect to set initial edit mode when the modal is opened
  useEffect(() => {
    setIsEditing(initialEditMode);
    if (initialEditMode && task) {
      // If opening directly in edit mode, ensure `editHasManuallySetUrgency` reflects the task's state
      setEditHasManuallySetUrgency(task.hasManuallySetUrgency || false);
      // And if not manually set, check if deadline makes it urgent by default
      if (!(task.hasManuallySetUrgency || false) && task.deadline?.toDate) {
        setEditIsUrgent(isDeadlineUrgent(task.deadline));
      } else {
        setEditIsUrgent(task.isUrgent || false);
      }
    }
  }, [initialEditMode, task]);

  // Function to handle changes to the deadline input
  const handleDeadlineChange = (e) => {
    const newDeadlineString = e.target.value;
    setEditDeadline(newDeadlineString);
    if (!editHasManuallySetUrgency) {
      if (newDeadlineString) {
        const dlTs = parseDateStringToTimestamp(newDeadlineString);
        if (dlTs) setEditIsUrgent(isDeadlineUrgent(dlTs));
        else setEditIsUrgent(false);
      } else {
        setEditIsUrgent(false);
      }
    }
  };

  const handleIsUrgentChange = (e) => {
    setEditIsUrgent(e.target.checked);
    setEditHasManuallySetUrgency(true);
  };

  const handleEdit = () => {
    if (task) {
      setEditTitle(task.title || "");
      setEditDescription(task.description || "");
      setEditStatus(task.status || KANBAN_COLUMNS[0]);
      const dlStr = getLocalDateInputString(task.deadline);
      setEditDeadline(dlStr);
      setOriginalDeadline(dlStr);
      setEditIsImportant(task.isImportant || false);
      setEditIsUrgent(task.isUrgent || false);
      setEditHasManuallySetUrgency(task.hasManuallySetUrgency || false);
      setEditChecklist(
        task.checklist ? JSON.parse(JSON.stringify(task.checklist)) : []
      );
    }
    setIsEditing(true);
    setSaveError("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveError("");
    if (task) {
      setEditTitle(task.title || "");
      setEditDescription(task.description || "");
      setEditStatus(task.status || KANBAN_COLUMNS[0]);
      const dlStr = getLocalDateInputString(task.deadline);
      setEditDeadline(dlStr);
      setEditIsImportant(task.isImportant || false);
      setEditIsUrgent(task.isUrgent || false);
      setEditHasManuallySetUrgency(task.hasManuallySetUrgency || false);
      setEditChecklist(
        task.checklist ? JSON.parse(JSON.stringify(task.checklist)) : []
      );
    }
  };

  const handleAddSubtaskItem = () => {
    if (newSubtaskText.trim() && editChecklist.length < MAX_CHECKLIST_ITEMS) {
      setEditChecklist([
        ...editChecklist,
        {
          id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          text: newSubtaskText.trim(),
          isCompleted: false,
        },
      ]);
      setNewSubtaskText("");
    } else if (editChecklist.length >= MAX_CHECKLIST_ITEMS) {
      console.warn("Max checklist items reached");
    }
  };
  const handleDeleteSubtaskItem = (subtaskId) => {
    setEditChecklist(editChecklist.filter((item) => item.id !== subtaskId));
  };
  const handleToggleSubtaskComplete = async (subtaskId) => {
    let updatedChecklist;
    if (isEditing) {
      updatedChecklist = editChecklist.map((item) =>
        item.id === subtaskId
          ? { ...item, isCompleted: !item.isCompleted }
          : item
      );
      setEditChecklist(updatedChecklist);
    } else {
      if (!task || !task.checklist) return;
      updatedChecklist = task.checklist.map((item) =>
        item.id === subtaskId
          ? { ...item, isCompleted: !item.isCompleted }
          : item
      );
      setIsSaving(true);
      try {
        await onSave(task.id, { checklist: updatedChecklist });
      } catch (error) {
        console.error("Error updating subtask status:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };
  const handleSubtaskTextChange = (subtaskId, newText) => {
    setEditChecklist(
      editChecklist.map((item) =>
        item.id === subtaskId ? { ...item, text: newText } : item
      )
    );
  };

  const handleSaveChanges = async () => {
    if (!task) return;
    if (!editTitle.trim()) {
      setSaveError("Title cannot be empty.");
      return;
    }
    setSaveError("");
    setIsSaving(true);
    const deadlineChanged = editDeadline !== originalDeadline;
    if (deadlineChanged && editDeadline !== "" && originalDeadline !== "") {
      console.warn("Reminder: Deadline was changed.");
    }
    const updatedData = {
      title: editTitle,
      description: editDescription,
      status: editStatus,
      deadline: editDeadline,
      isImportant: editIsImportant,
      isUrgent: editIsUrgent,
      hasManuallySetUrgency: editHasManuallySetUrgency,
      checklist: editChecklist,
    };
    try {
      const success = await onSave(task.id, updatedData);
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving task:", error);
      setSaveError("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (task) onDeleteRequest(task.id);
  };

  const formatDate = (timestamp, includeTime = false) => {
    if (!timestamp || !timestamp.toDate) return "N/A";
    const date = timestamp.toDate();
    const options = { year: "numeric", month: "long", day: "numeric" };
    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }
    return date.toLocaleDateString(undefined, options);
  };

  const modalTitle = isEditing ? `Edit Task` : task?.title || "Task Details";

  // ---- MODAL FOOTER BUTTONS ----
  let footer;

  const footerClass = "flex w-full items-center gap-2 sm:gap-3";
  const baseButtonClass =
    "flex-1 py-2 px-3 sm:px-4 text-sm rounded-lg font-medium flex items-center justify-center transition-colors duration-150 ease-in-out border focus:outline-none focus:ring-2 focus:ring-opacity-50";
  const buttonTextSpanClass = "hidden sm:ml-2 sm:inline";
  const iconSize = 16;

  if (isEditing) {
    footer = (
      <div className={footerClass}>
        <button
          type="button"
          disabled={isSaving}
          onClick={handleDelete}
          className={`${baseButtonClass} sm:order-1 bg-red-100 text-red-700 border-red-300 hover:bg-red-200 focus:ring-red-400`}
        >
          <DeleteIcon size={16} className="mr-0 sm:mr-2" />
          <span className={buttonTextSpanClass}>Delete</span>
        </button>

        <button
          type="button"
          disabled={isSaving}
          onClick={handleCancelEdit}
          className={`${baseButtonClass} sm:order-2  bg-spearmint-100 text-olive-green-700 border-spearmint-300 hover:bg-spearmint-200 focus:ring-spearmint-400`}
        >
          <CloseIcon size={16} className="mr-0 sm:mr-" />
          <span className={buttonTextSpanClass}>Cancel</span>
        </button>
        <button
          type="button"
          onClick={handleSaveChanges}
          disabled={isSaving}
          className={`${baseButtonClass} sm:order-3 bg-misty-blue-500 text-white border-misty-blue-500 hover:bg-misty-blue-600 focus:ring-misty-blue-400 shadow-sm`}
          aria-label="Save changes"
        >
          {isSaving ? (
            <SpinnerIcon size={iconSize} className="animate-spin" />
          ) : (
            <SaveIcon size={iconSize} />
          )}
          <span className="hidden sm:ml-2 sm:inline">
            {isSaving ? "Saving..." : "Save"}
          </span>
        </button>
      </div>
    );
  } else {
    // View mode footer
    footer = (
      <div className={footerClass}>
        <button
          type="button"
          onClick={handleDelete}
          className={`${baseButtonClass} sm:order-1 bg-red-100 text-red-700 border-red-300 hover:bg-red-200 focus:ring-red-400`}
        >
          <DeleteIcon size={16} className="mr-0 sm:mr-2" />
          <span className={buttonTextSpanClass}>Delete</span>
        </button>

        <button
          type="button"
          onClick={onClose} // Simple close in view mode
          className={`${baseButtonClass} sm:order-2  bg-spearmint-100 text-olive-green-700 border-spearmint-300 hover:bg-spearmint-200 focus:ring-spearmint-400`}
        >
          <CloseIcon size={16} className="mr-0 sm:mr-2" />
          <span className={buttonTextSpanClass}>Close </span>
        </button>
        <button
          type="button"
          onClick={handleEdit}
          className={`${baseButtonClass} sm:order-3 bg-tangerine-500 text-olive-green-950 border-tangerine-500 hover:bg-tangerine-600 focus:ring-tangerine-400 shadow-sm`}
        >
          <EditIcon size={16} className="mr-0 sm:mr-2" />
          <span className={buttonTextSpanClass}>Edit</span>
        </button>
      </div>
    );
  }

  // ---- MODAL BODY CONTENT ----
  let modalBody;
  if (!task && isOpen) {
    modalBody = <p className="text-olive-green-600">Loading task details...</p>;
  } else if (isEditing) {
    // Edit mode
    modalBody = (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSaveChanges();
        }}
        id="editTaskForm"
      >
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
            {editChecklist.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center mb-2 space-x-2 p-1.5 bg-spearmint-50 rounded"
              >
                <input
                  type="checkbox"
                  id={`edit-subtask-check-${item.id}`}
                  checked={item.isCompleted}
                  onChange={() => handleToggleSubtaskComplete(item.id)}
                  className="h-5 w-5 text-misty-blue-600 border-spearmint-300 rounded focus:ring-misty-blue-500 cursor-pointer flex-shrink-0"
                />
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) =>
                    handleSubtaskTextChange(item.id, e.target.value)
                  }
                  className={`flex-grow p-1 text-sm rounded border ${
                    item.isCompleted
                      ? "line-through text-gray-500"
                      : "text-olive-green-700"
                  } border-transparent hover:border-spearmint-300 focus:border-misty-blue-300 focus:ring-1 focus:ring-misty-blue-300`}
                  placeholder="Subtask description"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteSubtaskItem(item.id)}
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
                      handleAddSubtaskItem();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSubtaskItem}
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
              {task?.createdAt ? formatDeadlineDisplay(task.createdAt) : "N/A"}{" "}
              by You
            </p>
          </div>
        </div>
      </form>
    );
  } else if (task) {
    // View mode
    modalBody = (
      <div className="space-y-3">
        <div className="flex items-center space-x-3 mb-3">
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full ${
              task.status === "Done"
                ? "bg-olive-green-200 text-olive-green-800"
                : "bg-spearmint-200 text-olive-green-700"
            }`}
          >
            {task.status}
          </span>
          {(task.isImportant || task.isUrgent) && (
            <>
              {" "}
              {task.isImportant && (
                <span className="font-semibold px-3 py-1 rounded-full bg-tangerine-100 text-tangerine-800">
                  Important
                </span>
              )}{" "}
              {task.isUrgent && (
                <span className="font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700">
                  Urgent
                </span>
              )}
            </>
          )}
        </div>
        {task.description && (
          <p className="text-sm text-olive-green-700 whitespace-pre-wrap">
            <strong className="text-olive-green-600 block mb-1">
              Description:
            </strong>
            {task.description}
          </p>
        )}
        {task.checklist && task.checklist.length > 0 && (
          <div className="mt-3">
            <h3 className="text-sm font-medium text-olive-green-700 mb-1">
              Checklist ({task.checklist.filter((i) => i.isCompleted).length}/
              {task.checklist.length})
            </h3>
            <div className="space-y-1">
              {task.checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center p-1.5 hover:bg-spearmint-100 rounded group"
                >
                  <input
                    type="checkbox"
                    id={`view-subtask-check-${item.id}`}
                    checked={item.isCompleted}
                    onChange={() => handleToggleSubtaskComplete(item.id)}
                    className="h-4 w-4 text-misty-blue-600 border-spearmint-300 rounded focus:ring-misty-blue-500 cursor-pointer flex-shrink-0"
                    disabled={isSaving}
                  />
                  <label
                    htmlFor={`view-subtask-check-${item.id}`}
                    className={`ml-2 text-sm flex-grow cursor-pointer ${
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
        <div className="p-3 bg-spearmint-50 rounded-lg space-y-1 text-xs text-olive-green-700">
          <p>
            <strong className="text-olive-green-600">Deadline:</strong>{" "}
            {formatDeadlineDisplay(task.deadline)}
          </p>
          <hr className="border-spearmint-200 my-1.5" />
          <p>
            <strong className="text-olive-green-600">Created:</strong>{" "}
            {task.createdAt ? formatDeadlineDisplay(task.createdAt) : "N/A"}
          </p>{" "}
          <p>
            <strong className="text-olive-green-600">Author:</strong> You{" "}
          </p>
          <p>
            <strong className="text-olive-green-600">Assigned to:</strong> You
          </p>
        </div>
      </div>
    );
  } else {
    modalBody = <p className="text-olive-green-600">No task data available.</p>;
  }

  const [modalSize, setModalSize] = useState("lg");
  useEffect(() => {
    const updateSize = () => {
      setModalSize(window.innerWidth < 768 ? "full" : "lg");
    };
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return (
    <Modal
      isOpen={isOpen}
      onClose={isEditing ? handleCancelEdit : onClose}
      title={modalTitle}
      size={modalSize}
      footerContent={task ? footer : null}
      hideCloseButton={true}
    >
      {modalBody}
    </Modal>
  );
};

TaskDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.string,
    createdAt: PropTypes.object,
    authorId: PropTypes.string,
    deadline: PropTypes.object,
    isImportant: PropTypes.bool,
    isUrgent: PropTypes.bool,
    assigneeIds: PropTypes.arrayOf(PropTypes.string),
    hasManuallySetUrgency: PropTypes.bool,
    checklist: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        isCompleted: PropTypes.bool.isRequired,
      })
    ),
  }),
  onSave: PropTypes.func.isRequired,
  onDeleteRequest: PropTypes.func.isRequired,
  initialEditMode: PropTypes.bool,
};

export default TaskDetailModal;
