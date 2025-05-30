import React, { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { Plus as PlusIcon, Trash2 as DeleteIcon } from "lucide-react";
import { Modal } from "../common";
import { MAX_CHECKLIST_ITEMS } from "../../utils/constants";
import { getLocalDateInputString } from "../../utils/dateUtils";

const AddTaskForm = ({ onAddTask, isModalOpen, setIsModalOpen }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(""); // For <input type="date">
  const [isImportant, setIsImportant] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  // State for checklist
  const [checklistItems, setChecklistItems] = useState([]);
  const [newChecklistItemText, setNewChecklistItemText] = useState("");

  const titleInputRef = useRef(null);

  const clearForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setDeadline("");
    setIsImportant(false);
    setIsUrgent(false);
    setChecklistItems([]);
    setNewChecklistItemText("");
  }, []);

  const handleClose = useCallback(() => {
    clearForm();
    setIsModalOpen(false);
  }, [clearForm, setIsModalOpen]);

  const handleAddChecklistItem = () => {
    if (
      newChecklistItemText.trim() &&
      checklistItems.length < MAX_CHECKLIST_ITEMS
    ) {
      setChecklistItems([
        ...checklistItems,
        {
          id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Temporary unique ID
          text: newChecklistItemText.trim(),
          isCompleted: false,
        },
      ]);
      setNewChecklistItemText(""); // Clear input after adding
    } else if (checklistItems.length >= MAX_CHECKLIST_ITEMS) {
      // Optionally, show a message to the user that they've reached the limit
      console.warn(
        `Maximum of ${MAX_CHECKLIST_ITEMS} checklist items reached.`
      );
    }
  };

  const handleRemoveChecklistItem = (itemIdToRemove) => {
    setChecklistItems(
      checklistItems.filter((item) => item.id !== itemIdToRemove)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      console.warn("Task title cannot be empty.");
      return;
    }
    onAddTask({
      title,
      description,
      deadline,
      isImportant,
      isUrgent,
      checklist: checklistItems, // Pass the checklist items
    });
    handleClose();
  };

  // Focus title input when modal opens
  useEffect(() => {
    if (isModalOpen && titleInputRef.current) {
      // Timeout helps ensure the element is visible and focusable after modal animation
      const timer = setTimeout(() => {
        titleInputRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
    // When modal opens, if it's not for editing, ensure checklistItems is empty
    if (isModalOpen) {
      setChecklistItems([]); // Reset checklist when modal opens for a new task
      setNewChecklistItemText("");
    }
  }, [isModalOpen]);

  const modalFooter = (
    <div className="flex justify-end space-x-3">
      <button
        type="button"
        onClick={handleClose}
        className="py-2 px-4 bg-spearmint-200 text-olive-green-700 rounded-lg hover:bg-spearmint-300 transition duration-150 font-medium"
      >
        Cancel
      </button>
      <button
        type="submit" // This button is now part of the form, so it will trigger onSubmit
        form="addTaskFormInternal" // Link to the form via ID
        className="py-2 px-5 bg-tangerine-500 text-olive-green-950 rounded-lg hover:bg-tangerine-600 transition duration-150 flex items-center font-medium shadow-md hover:shadow-lg"
      >
        <PlusIcon size={18} className="mr-2" /> Add Task
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={handleClose}
      title="Add New Task"
      size="lg" // Or 'md' depending on your preference
      footerContent={modalFooter}
    >
      <form onSubmit={handleSubmit} id="addTaskFormInternal">
        <div className="mb-4">
          <label
            htmlFor="taskTitleModal"
            className="block text-sm font-medium text-olive-green-700 mb-1"
          >
            Title
          </label>
          <input
            ref={titleInputRef}
            id="taskTitleModal"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            className="w-full p-3 border border-spearmint-300 rounded-lg focus:ring-2 focus:ring-misty-blue-400 focus:border-misty-blue-500 transition-shadow"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="taskDescriptionModal"
            className="block text-sm font-medium text-olive-green-700 mb-1"
          >
            Description (Optional)
          </label>
          <textarea
            id="taskDescriptionModal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            className="w-full p-3 border border-spearmint-300 rounded-lg focus:ring-2 focus:ring-misty-blue-400 focus:border-misty-blue-500 transition-shadow h-28 resize-none"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="taskDeadlineModal"
            className="block text-sm font-medium text-olive-green-700 mb-1"
          >
            Deadline (Optional)
          </label>
          <input
            id="taskDeadlineModal"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full p-3 border border-spearmint-300 rounded-lg focus:ring-2 focus:ring-misty-blue-400 focus:border-misty-blue-500 transition-shadow"
            min={getLocalDateInputString(new Date())}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-1">
          {/* Adjusted mb */}
          <div className="flex items-center p-2 rounded-md hover:bg-spearmint-100">
            <input
              id="taskImportantModal"
              type="checkbox"
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
              className="h-5 w-5 text-tangerine-500 border-spearmint-300 rounded focus:ring-tangerine-400 cursor-pointer"
            />
            <label
              htmlFor="taskImportantModal"
              className="ml-2 block text-sm font-medium text-olive-green-700 cursor-pointer"
            >
              Mark as Important
            </label>
          </div>
          <div className="flex items-center p-2 rounded-md hover:bg-spearmint-100">
            <input
              id="taskUrgentModal"
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="h-5 w-5 text-tangerine-500 border-spearmint-300 rounded focus:ring-tangerine-400 cursor-pointer"
            />
            <label
              htmlFor="taskUrgentModal"
              className="ml-2 block text-sm font-medium text-olive-green-700 cursor-pointer"
            >
              Mark as Urgent
            </label>
          </div>
        </div>

        {/* Checklist Section */}
        <hr className="border-spearmint-200 my-4" />
        <div>
          <label className="block text-sm font-medium text-olive-green-700 mb-2">
            Checklist (up to {MAX_CHECKLIST_ITEMS} items)
          </label>
          {checklistItems.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center mb-2 bg-spearmint-50 p-2 rounded-md"
            >
              <span className="text-sm text-olive-green-700 flex-grow">
                {index + 1}. {item.text}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveChecklistItem(item.id)}
                className="ml-2 p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100"
                aria-label="Remove checklist item"
              >
                <DeleteIcon size={16} />
              </button>
            </div>
          ))}
          {checklistItems.length < MAX_CHECKLIST_ITEMS && (
            <div className="flex items-center mt-2 space-x-2">
              <input
                type="text"
                value={newChecklistItemText}
                onChange={(e) => setNewChecklistItemText(e.target.value)}
                placeholder="Add new checklist item..."
                className="w-full flex-grow p-2 border border-spearmint-300 rounded-lg focus:ring-2 focus:ring-misty-blue-400 focus:border-misty-blue-500 transition-shadow"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="p-2 bg-misty-blue-400 text-white rounded-lg hover:bg-misty-blue-500 transition-colors flex-shrink-0"
                aria-label="Add item to checklist"
              >
                <PlusIcon size={20} />
              </button>
            </div>
          )}
          {checklistItems.length >= MAX_CHECKLIST_ITEMS && (
            <p className="text-xs text-tangerine-600 mt-1">
              Maximum checklist items reached.
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
};

AddTaskForm.propTypes = {
  onAddTask: PropTypes.func.isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
};

export default AddTaskForm;
