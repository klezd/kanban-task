// src/components/common/ConfirmationModal.js
// Imports:
// import React from 'react';
// import PropTypes from 'prop-types';
// import Modal from './Modal'; // Assuming Modal.js is in the same 'common' folder

import React from "react";
import PropTypes from "prop-types";
import Modal from "./Modal"; // Adjust path if your Modal.js is elsewhere

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonColor = "bg-red-600 hover:bg-red-700", // Default to a destructive action color
  isConfirming = false, // Optional: for showing loading state on confirm button
}) => {
  const modalFooter = (
    <div className="flex justify-end space-x-3">
      <button
        type="button"
        onClick={onClose}
        disabled={isConfirming}
        className="py-2 px-4 bg-spearmint-200 text-olive-green-700 rounded-lg hover:bg-spearmint-300 transition duration-150 font-medium disabled:opacity-50"
      >
        {cancelText}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isConfirming}
        className={`py-2 px-4 text-white rounded-lg transition duration-150 font-medium shadow-md disabled:opacity-50 ${confirmButtonColor}`}
      >
        {isConfirming ? "Processing..." : confirmText}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm" // Confirmation modals are usually smaller
      footerContent={modalFooter}
      hideCloseButton={isConfirming} // Optionally hide 'X' if action is in progress
    >
      <p className="text-sm text-olive-green-600">{message}</p>
    </Modal>
  );
};

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmButtonColor: PropTypes.string,
  isConfirming: PropTypes.bool,
};

export default ConfirmationModal;
