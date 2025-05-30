/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { Modal } from "../common";
import { KANBAN_COLUMNS } from "../../App";
import {
  Edit2 as EditIcon,
  Trash2 as DeleteIcon,
  XSquare as CloseIcon,
  Save as SaveIcon,
  Loader2 as SpinnerIcon,
} from "lucide-react";

import { formatDeadlineDisplay, isDeadlineUrgent } from "../../utils/dateUtils";

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

  // Populate form state when task changes or when entering edit mode
  useEffect(() => {
    if (task) {
      setEditTitle(task.title || "");
      setEditDescription(task.description || "");
      setEditStatus(task.status || KANBAN_COLUMNS[0]);

      const deadlineDateObj = task.deadline?.toDate
        ? task.deadline.toDate()
        : null;
      let deadlineString = "";
      if (deadlineDateObj) {
        const year = deadlineDateObj.getFullYear();
        const month = (deadlineDateObj.getMonth() + 1)
          .toString()
          .padStart(2, "0");
        const day = deadlineDateObj.getDate().toString().padStart(2, "0");
        deadlineString = `${year}-${month}-${day}`;
      }
      setEditDeadline(deadlineString);
      setOriginalDeadline(deadlineString); // Also update originalDeadline here

      setEditIsImportant(task.isImportant || false);
      setEditIsUrgent(task.isUrgent || false); // This will be updated by the deadline-watching effect if isEditing
      setEditHasManuallySetUrgency(task.hasManuallySetUrgency || false);
      setSaveError("");
    }
  }, [task]); // Depend only on the task prop

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

  // This effect makes isUrgent checkbox reactive to deadline changes
  // useEffect(() => {
  //   if (isEditing && editDeadline) {
  //     const [year, month, day] = editDeadline.split("-").map(Number);
  //     const deadlineDateForUrgencyCheck = {
  //       toDate: () => new Date(year, month - 1, day, 0, 0, 0, 0),
  //     };
  //     if (!isNaN(deadlineDateForUrgencyCheck.toDate().getTime())) {
  //       setEditIsUrgent(isDeadlineUrgent(deadlineDateForUrgencyCheck));
  //     } else {
  //       setEditIsUrgent(false);
  //     }
  //   } else if (isEditing && !editDeadline) {
  //     setEditIsUrgent(false);
  //   }
  // }, [editDeadline, isEditing]);

  // Function to handle changes to the deadline input
  const handleDeadlineChange = (e) => {
    const newDeadlineString = e.target.value;
    setEditDeadline(newDeadlineString);

    // Only auto-update urgency if it hasn't been manually set by the user FOR THIS TASK
    if (!editHasManuallySetUrgency) {
      if (newDeadlineString) {
        const [year, month, day] = newDeadlineString.split("-").map(Number);
        const deadlineDateForUrgencyCheck = {
          toDate: () => new Date(year, month - 1, day, 0, 0, 0, 0),
        };
        if (!isNaN(deadlineDateForUrgencyCheck.toDate().getTime())) {
          setEditIsUrgent(isDeadlineUrgent(deadlineDateForUrgencyCheck));
        } else {
          setEditIsUrgent(false);
        }
      } else {
        setEditIsUrgent(false);
      }
    }
  };

  // Handler for the 'isUrgent' checkbox
  const handleIsUrgentChange = (e) => {
    setEditIsUrgent(e.target.checked);
    setEditHasManuallySetUrgency(true); // User has manually interacted
  };

  // Switch to edit mode
  const handleEdit = () => {
    if (task) {
      // Ensure task data is loaded before populating edit fields
      setEditTitle(task.title || "");
      setEditDescription(task.description || "");
      setEditStatus(task.status || KANBAN_COLUMNS[0]);
      const deadlineDateObj = task.deadline?.toDate
        ? task.deadline.toDate()
        : null;
      let deadlineString = "";
      if (deadlineDateObj) {
        // 👇 Use the same robust local date part formatting here
        const year = deadlineDateObj.getFullYear();
        const month = (deadlineDateObj.getMonth() + 1)
          .toString()
          .padStart(2, "0");
        const day = deadlineDateObj.getDate().toString().padStart(2, "0");
        deadlineString = `${year}-${month}-${day}`;
      }
      setEditDeadline(deadlineString);
      setOriginalDeadline(deadlineString);
      setEditIsImportant(task.isImportant || false);
      setEditIsUrgent(task.isUrgent || false);
      setEditHasManuallySetUrgency(task.hasManuallySetUrgency || false); // Initialize this too
    }
    setIsEditing(true);
    setSaveError("");
  };

  // Handle cancel from edit mode
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveError("");
    // Reset form fields to original task values when cancelling edit
    if (task) {
      setEditTitle(task.title || "");
      setEditDescription(task.description || "");
      setEditStatus(task.status || KANBAN_COLUMNS[0]);
      const deadlineDate = task.deadline?.toDate
        ? task.deadline.toDate()
        : null;
      let deadlineString = "";
      if (deadlineDate) {
        const year = deadlineDate.getFullYear();
        const month = (deadlineDate.getMonth() + 1).toString().padStart(2, "0");
        const day = deadlineDate.getDate().toString().padStart(2, "0");
        deadlineString = `${year}-${month}-${day}`;
      }
      setEditDeadline(deadlineString);
      setEditIsImportant(task.isImportant || false);
      setEditIsUrgent(task.isUrgent || false);
      setEditHasManuallySetUrgency(task.hasManuallySetUrgency || false); // Reset this too
    }
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
    // ... (deadline change warning logic, e.g., simple console.warn for now)
    if (deadlineChanged && editDeadline !== "" && originalDeadline !== "") {
      console.warn("Reminder: Deadline for this task was changed.");
    }

    const updatedData = {
      title: editTitle,
      description: editDescription,
      status: editStatus,
      deadline: editDeadline, // "YYYY-MM-DD" string or empty string
      isImportant: editIsImportant,
      isUrgent: editIsUrgent,
      hasManuallySetUrgency: editHasManuallySetUrgency, // Pass this to be saved
    };
    try {
      const success = await onSave(task.id, updatedData); // onSave should return true on success
      if (success) {
        setIsEditing(false); // Switch to view mode
      } else {
        // If onSave returns false or doesn't throw, error was handled in App.js
        // but we might want a generic message here if no specific one came from App.js
        // For now, assume App.js sets a global error if onSave returns false.
        // If onSave throws, the catch block below will handle it.
        if (!saveError)
          setSaveError("Failed to save. Please check console or app errors.");
      }
    } catch (error) {
      // Should not happen if onSave returns boolean, but good practice
      console.error("Critical error during save operation:", error);
      setSaveError("A critical error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (task) {
      onDeleteRequest(task.id); // This will open ConfirmationModal from App.js
      // onClose(); // Confirmation modal will handle closing logic from App.js
    }
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

  const modalTitle = isEditing
    ? `Edit: ${task?.title || "Task"}`
    : task?.title || "Task Details";

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
          <span className={buttonTextSpanClass}>Cancel </span>
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
    // EDIT MODE FORM
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

        {/* Prevent default for direct button click too */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="editTaskTitle"
              className="block text-sm font-medium text-olive-green-700 mb-1"
            >
              Title{" "}
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
              Description{" "}
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
              Status{" "}
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
              Deadline{" "}
            </label>
            <input
              id="editTaskDeadline"
              type="date"
              value={editDeadline}
              onChange={handleDeadlineChange} // Use the new handler
              className="w-full p-3 border border-spearmint-300 rounded-lg focus:ring-2 focus:ring-misty-blue-400 focus:border-misty-blue-500"
              min={new Date().toISOString().split("T")[0]}
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
                Important{" "}
              </label>
            </div>
            <div className="flex items-center p-2 rounded-md hover:bg-spearmint-100">
              <input
                id="editTaskUrgent"
                type="checkbox"
                checked={editIsUrgent}
                onChange={handleIsUrgentChange} // Use the new handler for Urgent checkbox
                className="h-5 w-5 text-tangerine-500 border-spearmint-300 rounded focus:ring-tangerine-400 cursor-pointer"
              />
              <label
                htmlFor="editTaskUrgent"
                className="ml-2 text-sm font-medium text-olive-green-700 cursor-pointer"
              >
                Urgent{" "}
              </label>
            </div>
          </div>
          {/* Read-only fields displayed for context */}
          <div className="text-xs text-olive-green-500 mt-3">
            <p>Created: {formatDate(task.createdAt)} by You</p>
            {/* Simplified author */}
            {/* <p>Assigned to: You</p> */}
            {/* assigneeIds not directly editable for personal tasks */}
          </div>
        </div>
      </form>
    );
  } else if (task) {
    // VIEW MODE DISPLAY
    modalBody = (
      <div className="space-y-3 text-sm text-olive-green-700">
        {task.description && (
          <p>
            <strong className="text-olive-green-600">Description: </strong>
            <span className="whitespace-pre-wrap">{task.description}</span>
          </p>
        )}
        <p>
          <strong className="text-olive-green-600">Status: </strong>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              task.status === "Done"
                ? "bg-olive-green-100 text-olive-green-700"
                : "bg-spearmint-100 text-spearmint-700"
            }`}
          >
            {task.status}
          </span>
        </p>
        <p>
          <strong className="text-olive-green-600">Deadline: </strong>
          {formatDeadlineDisplay(task.deadline)}
        </p>
        <p>
          <strong className="text-olive-green-600">Important: </strong>
          {task.isImportant ? (
            <span className="text-tangerine-700 font-semibold">Yes</span>
          ) : (
            "No"
          )}
        </p>
        <p>
          <strong className="text-olive-green-600">Urgent: </strong>
          {task.isUrgent ? (
            <span className="text-red-700 font-semibold">Yes</span>
          ) : (
            "No"
          )}
        </p>
        <hr className="border-spearmint-200 my-2" />
        <p className="text-xs text-olive-green-500">
          <strong className="text-olive-green-600">Created: </strong>{" "}
          {formatDate(task.createdAt, true)}
        </p>
        <p className="text-xs text-olive-green-500">
          <strong className="text-olive-green-600">Author: </strong> You
        </p>
        <p className="text-xs text-olive-green-500">
          <strong className="text-olive-green-600">Assigned to: </strong> You
        </p>
      </div>
    );
  } else {
    modalBody = <p className="text-olive-green-600">No task data available.</p>;
  }

  // Determine modal size based on mobile view (full screen) vs desktop
  // The generic Modal 'size' prop can be 'full' for mobile, or 'lg'/'xl' for desktop
  // This logic can be enhanced in App.js when calling TaskDetailModal
  const [modalSize, setModalSize] = useState("lg");
  useEffect(() => {
    /* ... same responsive modal size logic ... */
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
      onClose={isEditing ? handleCancelEdit : onClose} // Cancel edit or just close
      title={modalTitle}
      size={modalSize} // Responsive size
      footerContent={task ? footer : null} // Only show footer if task is loaded
      // For mobile, the generic Modal's 'X' in header will act as close/cancel.
      // Footer buttons can be hidden on mobile if preferred, or styled to stack.
      // The current footer uses flex-col sm:flex-row to stack buttons on small screens.
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
    createdAt: PropTypes.object, // Firestore Timestamp
    authorId: PropTypes.string,
    deadline: PropTypes.object, // Firestore Timestamp or null
    isImportant: PropTypes.bool,
    isUrgent: PropTypes.bool,
    hasManuallySetUrgency: PropTypes.bool, // Add this to the shape
    assigneeIds: PropTypes.arrayOf(PropTypes.string),
  }), // Task can be null initially
  onSave: PropTypes.func.isRequired,
  onDeleteRequest: PropTypes.func.isRequired,
  initialEditMode: PropTypes.bool,
};

export default TaskDetailModal;
