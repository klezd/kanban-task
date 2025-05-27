// In AddTaskForm.js
import React, { useState } from "react";
import PropTypes from "prop-types"; // 👈 Import PropTypes
import { Plus } from "lucide-react"; // Or your Plus icon component

const AddTaskForm = ({ onAddTask }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Task title cannot be empty."); // Replace with modal
      return;
    }
    onAddTask(title, description);
    setTitle("");
    setDescription("");
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="mb-6 bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-150 flex items-center"
      >
        <Plus size={20} className="mr-2" /> Add New Task
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 p-4 bg-white rounded-lg shadow-md border border-gray-200"
    >
      <h2 className="text-xl font-semibold mb-3 text-gray-700">Add New Task</h2>
      <div className="mb-3">
        <label
          htmlFor="taskTitle"
          className="block text-sm font-medium text-gray-600 mb-1"
        >
          Title
        </label>
        <input
          id="taskTitle"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="taskDescription"
          className="block text-sm font-medium text-gray-600 mb-1"
        >
          Description (Optional)
        </label>
        <textarea
          id="taskDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 h-24"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setTitle("");
            setDescription("");
          }}
          className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-150"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 flex items-center"
        >
          <Plus size={18} className="mr-1" /> Add Task
        </button>
      </div>
    </form>
  );
};

// 👇 Define propTypes for AddTaskForm
AddTaskForm.propTypes = {
  onAddTask: PropTypes.func.isRequired,
};

export default AddTaskForm;
