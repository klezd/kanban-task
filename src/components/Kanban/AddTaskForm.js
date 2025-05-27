// In AddTaskForm.js
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types"; // 👈 Import PropTypes
import { Plus, XCircle } from "lucide-react";

const AddTaskForm = ({ onAddTask, isModalOpen, setIsModalOpen }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const modalRef = useRef();
  const titleInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      console.warn("Task title cannot be empty.");
      return;
    }
    onAddTask(title, description);
    setTitle("");
    setDescription("");
    setIsModalOpen(false);
  };
  const closeModal = () => {
    setTitle("");
    setDescription("");
    setIsModalOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target))
        closeModal();
    };
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") closeModal();
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
      titleInputRef.current?.focus(); // Programmatic focus after removing autoFocus prop
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[90] p-4 transition-opacity duration-300 ease-in-out">
      {" "}
      {/* Adjusted z-index */}
      <div
        ref={modalRef}
        className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="addTaskModalTitle"
      >
        <div className="flex justify-between items-center mb-6">
          <h2
            id="addTaskModalTitle"
            className="text-2xl font-semibold text-olive-green-700"
          >
            Add New Task
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <XCircle size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="taskTitleModal"
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-misty-blue-400 focus:border-misty-blue-500 transition-shadow"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="taskDescriptionModal"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description (Optional)
            </label>
            <textarea
              id="taskDescriptionModal"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-misty-blue-400 focus:border-misty-blue-500 transition-shadow h-28 resize-none"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={closeModal}
              className="py-2 px-4 bg-spearmint-200 text-olive-green-700 rounded-lg hover:bg-spearmint-300 transition duration-150 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-5 bg-tangerine-500 text-olive-green-950 rounded-lg hover:bg-tangerine-600 transition duration-150 flex items-center font-medium shadow-md hover:shadow-lg"
            >
              <Plus size={18} className="mr-2" /> Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AddTaskForm.propTypes = {
  onAddTask: PropTypes.func.isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
};

export default AddTaskForm;