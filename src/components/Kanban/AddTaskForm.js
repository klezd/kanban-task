// // In AddTaskForm.js
// import React, { useState, useEffect, useRef, useCallback } from "react";
// import PropTypes from "prop-types";
// import { Plus, XCircle } from "lucide-react";

// const AddTaskForm = ({ onAddTask, isModalOpen, setIsModalOpen }) => {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const modalRef = useRef();
//   const titleInputRef = useRef(null);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!title.trim()) {
//       console.warn("Task title cannot be empty.");
//       return;
//     }
//     onAddTask(title, description);
//     setTitle("");
//     setDescription("");
//     setIsModalOpen(false);
//   };
//   const closeModal = useCallback(() => {
//     setTitle("");
//     setDescription("");
//     setIsModalOpen(false);
//   }, [setIsModalOpen]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (modalRef.current && !modalRef.current.contains(event.target))
//         closeModal();
//     };
//     const handleEscapeKey = (event) => {
//       if (event.key === "Escape") closeModal();
//     };

//     if (isModalOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//       document.addEventListener("keydown", handleEscapeKey);
//       titleInputRef.current?.focus(); // Programmatic focus after removing autoFocus prop
//     }
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//       document.removeEventListener("keydown", handleEscapeKey);
//     };
//   }, [isModalOpen, closeModal]);

//   if (!isModalOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[90] p-4 transition-opacity duration-300 ease-in-out">
//       {/* Adjusted z-index */}
//       <div
//         ref={modalRef}
//         className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100"
//         role="dialog"
//         aria-modal="true"
//         aria-labelledby="addTaskModalTitle"
//       >
//         <div className="flex justify-between items-center mb-6">
//           <h2
//             id="addTaskModalTitle"
//             className="text-2xl font-semibold text-olive-green-700"
//           >
//             Add New Task
//           </h2>
//           <button
//             onClick={closeModal}
//             className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
//             aria-label="Close modal"
//           >
//             <XCircle size={24} />
//           </button>
//         </div>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label
//               htmlFor="taskTitleModal"
//               className="block text-sm font-medium text-gray-700 mb-1"
//             >
//               Title
//             </label>
//             <input
//               ref={titleInputRef}
//               id="taskTitleModal"
//               type="text"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               placeholder="Enter task title"
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-misty-blue-400 focus:border-misty-blue-500 transition-shadow"
//               required
//             />
//           </div>
//           <div className="mb-6">
//             <label
//               htmlFor="taskDescriptionModal"
//               className="block text-sm font-medium text-gray-700 mb-1"
//             >
//               Description (Optional)
//             </label>
//             <textarea
//               id="taskDescriptionModal"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               placeholder="Enter task description"
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-misty-blue-400 focus:border-misty-blue-500 transition-shadow h-28 resize-none"
//             />
//           </div>
//           <div className="flex justify-end space-x-3">
//             <button
//               type="button"
//               onClick={closeModal}
//               className="py-2 px-4 bg-spearmint-200 text-olive-green-700 rounded-lg hover:bg-spearmint-300 transition duration-150 font-medium"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="py-2 px-5 bg-tangerine-500 text-olive-green-950 rounded-lg hover:bg-tangerine-600 transition duration-150 flex items-center font-medium shadow-md hover:shadow-lg"
//             >
//               <Plus size={18} className="mr-2" /> Add Task
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// AddTaskForm.propTypes = {
//   onAddTask: PropTypes.func.isRequired,
//   isModalOpen: PropTypes.bool.isRequired,
//   setIsModalOpen: PropTypes.func.isRequired,
// };

// export default AddTaskForm;

// src/components/AddTaskForm.js
// Imports:
// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import PropTypes from 'prop-types';
// import Modal from './common/Modal'; // Assuming Modal.js is in src/components/common/
// import { Plus as PlusIcon } from 'lucide-react';

import React, { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { Plus as PlusIcon } from "lucide-react";
import { Modal } from "../common";

const AddTaskForm = ({ onAddTask, isModalOpen, setIsModalOpen }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(""); // For <input type="date">
  const [isImportant, setIsImportant] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  const titleInputRef = useRef(null);

  const clearForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setDeadline("");
    setIsImportant(false);
    setIsUrgent(false);
  }, []);

  const handleClose = useCallback(() => {
    clearForm();
    setIsModalOpen(false);
  }, [clearForm, setIsModalOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      // In a real app, you might show a more user-friendly error message
      console.warn("Task title cannot be empty.");
      return;
    }
    // Pass the new fields to the onAddTask function
    // The onAddTask function in App.js will need to be updated to accept these
    onAddTask({
      title,
      description,
      deadline, // Will be a string like "YYYY-MM-DD"
      isImportant,
      isUrgent,
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
            // For HTML5 date input, min could be today's date
            min={new Date().toISOString().split("T")[0]}
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
