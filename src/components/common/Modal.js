// src/components/common/Modal.js
import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { X as XIcon } from "lucide-react"; // Icon for the close button

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footerContent,
  size = "md", // Default size: 'sm', 'md', 'lg'
  hideCloseButton = false,
}) => {
  const modalRef = useRef(null);

  // Handle Escape key press
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Handle click outside modal panel to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      // Timeout to prevent immediate close if modal opens due to a click
      // that might also be on the document
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, modalRef]);

  if (!isOpen) {
    return null;
  }

  let maxWidthClass = "max-w-lg"; // Default for 'md'
  if (size === "sm") maxWidthClass = "max-w-sm";
  if (size === "lg") maxWidthClass = "max-w-2xl"; // Example for 'lg', adjust as needed
  if (size === "xl") maxWidthClass = "max-w-4xl";
  if (size === "full")
    maxWidthClass = "w-full h-full rounded-none md:rounded-xl"; // For full screen on mobile

  return (
    <div
      className="fixed inset-0 bg-olive-green-900 bg-opacity-75 backdrop-blur-sm flex justify-center items-center z-[80] p-4 transition-opacity duration-300 ease-in-out" // Slightly lower z-index than AddTaskForm used to have, can be adjusted
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-xl shadow-2xl w-full ${maxWidthClass} flex flex-col overflow-hidden transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh]`}
      >
        {/* Modal Header */}
        {(title || !hideCloseButton) && (
          <div className="flex justify-between items-center p-4 md:p-6 border-b border-spearmint-200">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-semibold text-olive-green-700"
              >
                {title}
              </h2>
            )}
            {!hideCloseButton && (
              <button
                onClick={onClose}
                className={`p-1 rounded-full text-olive-green-500 hover:text-olive-green-700 hover:bg-spearmint-100 ${
                  title ? "" : "ml-auto"
                }`} // ml-auto if no title
                aria-label="Close modal"
              >
                <XIcon size={24} />
              </button>
            )}
          </div>
        )}

        {/* Modal Body (Content) */}
        <div className="p-4 md:p-6 overflow-y-auto flex-grow">{children}</div>

        {/* Modal Footer */}
        {footerContent && (
          <div className="p-4 md:p-6 border-t border-spearmint-200 bg-gray-50 rounded-b-xl">
            {" "}
            {/* Added bg-gray-50 for footer distinction */}
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  footerContent: PropTypes.node,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl", "full"]),
  hideCloseButton: PropTypes.bool,
};

export default Modal;
