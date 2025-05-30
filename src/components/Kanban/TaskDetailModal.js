// src/components/Kanban/TaskDetailModal.js
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Modal from "../common/Modal";
import TaskDetailView from "./TaskDetailView"; // Import new view component
import TaskEditForm from "./TaskEditForm"; // Import new edit form component
import {
  isDeadlineUrgent,
  parseDateStringToTimestamp,
  getLocalDateInputString,
} from "../../utils/dateUtils"; // Adjust path
// Icons for footer
import {
  Edit2 as EditIcon,
  Trash2 as DeleteIcon,
  // XSquare as CloseIcon,
  Save as SaveIcon,
  X as CancelIcon,
  Loader2 as SpinnerIcon,
} from "lucide-react";
import { MAX_CHECKLIST_ITEMS } from "../../utils/constants";

const TaskDetailModal = ({
  isOpen,
  onClose,
  task,
  onSave,
  onDeleteRequest,
  initialEditMode = false,
}) => {
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Form state for editing - managed by this parent modal
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editIsImportant, setEditIsImportant] = useState(false);
  const [editIsUrgent, setEditIsUrgent] = useState(false);
  const [editHasManuallySetUrgency, setEditHasManuallySetUrgency] =
    useState(false);
  const [editChecklist, setEditChecklist] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState(""); // For adding new subtasks

  const [originalDeadline, setOriginalDeadline] = useState("");

  // Populate/reset form state when task prop changes or when initialEditMode changes
  useEffect(() => {
    if (task) {
      setEditTitle(task.title || "");
      setEditDescription(task.description || "");
      setEditStatus(task.status || ""); // KANBAN_COLUMNS[0] if KANBAN_COLUMNS is available
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

  useEffect(() => {
    setIsEditing(initialEditMode);
    // If opening directly in edit mode, and urgency wasn't manually set, calculate from deadline
    if (
      initialEditMode &&
      task &&
      !(task.hasManuallySetUrgency || false) &&
      task.deadline
    ) {
      setEditIsUrgent(isDeadlineUrgent(task.deadline));
    } else if (initialEditMode && task) {
      setEditIsUrgent(task.isUrgent || false); // Respect saved urgency
    }
  }, [initialEditMode, task]);

  // Passed to TaskEditForm for its deadline input's onChange
  const handleDeadlineChangeInForm = (e) => {
    const newDeadlineString = e.target.value;
    setEditDeadline(newDeadlineString);
    if (!editHasManuallySetUrgency) {
      if (newDeadlineString) {
        const dlTs = parseDateStringToTimestamp(newDeadlineString);
        setEditIsUrgent(dlTs ? isDeadlineUrgent(dlTs) : false);
      } else {
        setEditIsUrgent(false);
      }
    }
  };

  // Passed to TaskEditForm for its isUrgent checkbox's onChange
  const handleIsUrgentChangeInForm = (e) => {
    setEditIsUrgent(e.target.checked);
    setEditHasManuallySetUrgency(true);
  };

  // Checklist handlers passed to TaskEditForm
  const handleAddSubtaskItem = () => {
    /* ... same as before, updates editChecklist ... */ if (
      newSubtaskText.trim() &&
      editChecklist.length < MAX_CHECKLIST_ITEMS
    ) {
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
    setEditChecklist((current) =>
      current.filter((item) => item.id !== subtaskId)
    );
  };
  const handleToggleSubtaskCompleteInEdit = (subtaskId) => {
    setEditChecklist((current) =>
      current.map((item) =>
        item.id === subtaskId
          ? { ...item, isCompleted: !item.isCompleted }
          : item
      )
    );
  };
  const handleSubtaskTextChange = (subtaskId, newText) => {
    setEditChecklist((current) =>
      current.map((item) =>
        item.id === subtaskId ? { ...item, text: newText } : item
      )
    );
  };

  // Toggle subtask completion directly from View mode (triggers immediate save)
  const handleToggleSubtaskCompleteInView = async (subtaskId) => {
    if (!task || !task.checklist) return;
    const updatedChecklist = task.checklist.map((item) =>
      item.id === subtaskId ? { ...item, isCompleted: !item.isCompleted } : item
    );
    setIsSaving(true); // Show global saving indicator if needed, or local to subtask
    try {
      await onSave(task.id, { checklist: updatedChecklist });
      // Optimistic update for selectedTaskForDetail in App.js will refresh this modal's task prop
    } catch (error) {
      console.error("Error updating subtask status from view:", error);
      // Potentially set a dbError in App.js
    } finally {
      setIsSaving(false);
    }
  };

  const switchToEditMode = () => {
    // Ensure form is populated with current task data before switching
    if (task) {
      setEditTitle(task.title || "");
      setEditDescription(task.description || "");
      setEditStatus(task.status || "");
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

  const cancelEditMode = () => {
    setIsEditing(false);
    setSaveError("");
    // Form will re-populate from `task` prop via useEffect if needed
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

  const handleDeleteRequest = () => {
    if (task) onDeleteRequest(task.id);
  };

  const modalTitle = isEditing
    ? `Edit Task: ${task?.title || ""}`
    : task?.title || "Task Details";

  let footer;
  const baseButtonClass =
    "py-2 px-3 sm:px-4 text-sm rounded-lg font-medium flex items-center justify-center transition-colors duration-150 ease-in-out border focus:outline-none focus:ring-2 focus:ring-opacity-50";
  const iconSize = 16;

  if (isEditing) {
    footer = (
      <div className="flex w-full items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={handleDeleteRequest}
          disabled={isSaving}
          className={`${baseButtonClass} flex-1 bg-red-100 text-red-700 border-red-300 hover:bg-red-200 focus:ring-red-400 disabled:opacity-50`}
          aria-label="Delete task"
        >
          <DeleteIcon size={iconSize} />
          <span className="hidden sm:ml-2 sm:inline">Delete</span>
        </button>
        <button
          type="button"
          onClick={cancelEditMode}
          disabled={isSaving}
          className={`${baseButtonClass} flex-1 bg-spearmint-100 text-olive-green-700 border-spearmint-300 hover:bg-spearmint-200 focus:ring-spearmint-400 disabled:opacity-50`}
          aria-label="Cancel editing"
        >
          <CancelIcon size={iconSize} />
          <span className="hidden sm:ml-2 sm:inline">Cancel</span>
        </button>
        <button
          type="button"
          onClick={handleSaveChanges}
          disabled={isSaving}
          className={`${baseButtonClass} flex-1 bg-misty-blue-500 text-white border-misty-blue-500 hover:bg-misty-blue-600 focus:ring-misty-blue-400 shadow-sm disabled:opacity-50`}
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
    footer = (
      <div className="flex w-full items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={handleDeleteRequest}
          className={`${baseButtonClass} flex-1 bg-red-100 text-red-700 border-red-300 hover:bg-red-200 focus:ring-red-400`}
          aria-label="Delete task"
        >
          <DeleteIcon size={iconSize} />
          <span className="hidden sm:ml-2 sm:inline">Delete</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className={`${baseButtonClass} flex-1 bg-spearmint-100 text-olive-green-700 border-spearmint-300 hover:bg-spearmint-200 focus:ring-spearmint-400`}
          aria-label="Cancel and close modal"
        >
          <CancelIcon size={iconSize} />
          <span className="hidden sm:ml-2 sm:inline">Cancel</span>
        </button>
        <button
          type="button"
          onClick={switchToEditMode}
          className={`${baseButtonClass} flex-1 bg-tangerine-500 text-olive-green-950 border-tangerine-500 hover:bg-tangerine-600 focus:ring-tangerine-400 shadow-sm`}
          aria-label="Edit task"
        >
          <EditIcon size={iconSize} />
          <span className="hidden sm:ml-2 sm:inline">Edit</span>
        </button>
      </div>
    );
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
      onClose={isEditing ? cancelEditMode : onClose}
      title={modalTitle}
      size={modalSize}
      footerContent={task ? footer : null}
      hideCloseButton={true} // As per requirement
    >
      {isEditing ? (
        <TaskEditForm
          task={task} // Pass original task for read-only info like createdAt
          editTitle={editTitle}
          setEditTitle={setEditTitle}
          editDescription={editDescription}
          setEditDescription={setEditDescription}
          editStatus={editStatus}
          setEditStatus={setEditStatus}
          editDeadline={editDeadline}
          handleDeadlineChange={handleDeadlineChangeInForm}
          editIsImportant={editIsImportant}
          setEditIsImportant={setEditIsImportant}
          editIsUrgent={editIsUrgent}
          handleIsUrgentChange={handleIsUrgentChangeInForm}
          // editHasManuallySetUrgency is managed internally by handleIsUrgentChangeInForm
          editChecklist={editChecklist}
          setEditChecklist={setEditChecklist}
          newSubtaskText={newSubtaskText}
          setNewSubtaskText={setNewSubtaskText}
          onAddSubtaskItem={handleAddSubtaskItem}
          onDeleteSubtaskItem={handleDeleteSubtaskItem}
          onToggleSubtaskCompleteInEdit={handleToggleSubtaskCompleteInEdit} // Pass the main toggle, it checks isEditing
          onSubtaskTextChange={handleSubtaskTextChange}
          saveError={saveError}
        />
      ) : task ? ( // Only render TaskDetailView if task is loaded
        <TaskDetailView
          task={task}
          onToggleSubtaskComplete={handleToggleSubtaskCompleteInView}
          isSaving={isSaving}
        />
      ) : (
        <p className="text-olive-green-600">
          Loading task details or no task selected...
        </p>
      )}
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
