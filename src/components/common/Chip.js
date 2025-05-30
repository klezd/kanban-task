import React from 'react'
import PropTypes from 'prop-types'

const Chip =({title, color}) => {
  return (
    <span
      className={`px-3 py-1 text-sm font-semibold rounded-full ${color}`}
    >
      {title}
    </span>
  );
}

Chip.propTypes = {
  color: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default Chip