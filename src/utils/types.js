import PropTypes from "prop-types";

export const taskPropTypes = PropTypes.shape({
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
}).isRequired;

export const conciseTaskPropTypes = PropTypes.shape({
  // Use your shared taskPropTypes here if available
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  isUrgent: PropTypes.bool,
  isImportant: PropTypes.bool,
  deadline: PropTypes.object,
});