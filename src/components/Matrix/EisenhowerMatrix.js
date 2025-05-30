// src/components/Matrix/EisenhowerMatrix.js
// Imports:
import React from "react";
import PropTypes from "prop-types";
import Quadrant from "./Quadrant"; // 👈 Import the new Quadrant component
import { QUADRANTS } from "../../utils/constants";
import { conciseTaskPropTypes } from "../../utils/types";

const EisenhowerMatrix = ({
  tasks,
  onViewTask /*, onEditRequest, onDeleteRequest */,
}) => {
  // Filter tasks into quadrants (this logic remains the same)
  const doTasks = tasks.filter((task) => task.isUrgent && task.isImportant);
  const scheduleTasks = tasks.filter(
    (task) => !task.isUrgent && task.isImportant
  );
  const delegateTasks = tasks.filter(
    (task) => task.isUrgent && !task.isImportant
  );
  const eliminateTasks = tasks.filter(
    (task) => !task.isUrgent && !task.isImportant
  );

  const labelContentBaseStyle = "font-semibold text-sm text-olive-green-700";
  const horizontalLabelCellStyle = `flex items-center justify-center p-3 ${labelContentBaseStyle} bg-spearmint-50 rounded-lg shadow-md`;
  const verticalLabelCellStyle = `flex items-center justify-center py-4 px-1 sm:px-2 ${labelContentBaseStyle} bg-spearmint-50 rounded-lg shadow-md h-full`;
  const emptyCornerStyle = "bg-transparent rounded-lg";

  // The Quadrant component definition is now removed from here

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-olive-green-800 mb-6 text-center">
        Eisenhower Matrix
      </h2>

      <div className="grid grid-cols-[theme(spacing.12)_1fr_1fr] grid-rows-[max-content_1fr_1fr] gap-3 md:gap-4">
        {/* Row 1: Top Labels */}
        <div className={`${emptyCornerStyle}`}></div>
        <div className={`${horizontalLabelCellStyle}`}>URGENT</div>
        <div className={`${horizontalLabelCellStyle}`}>NOT URGENT</div>
        {/* Row 2: Important Tasks */}
        <div className={`${verticalLabelCellStyle}`}>
          <span className="transform -rotate-90 whitespace-nowrap p-2">
            IMPORTANT
          </span>
        </div>
        <Quadrant
          actionText={QUADRANTS.DO.actionText}
          tasksInQuadrant={doTasks}
          quadrantStyle={QUADRANTS.DO.style} // Just background style
          onViewTask={onViewTask}
        />
        <Quadrant
          actionText={QUADRANTS.SCHEDULE.actionText}
          tasksInQuadrant={scheduleTasks}
          quadrantStyle={QUADRANTS.SCHEDULE.style}
          onViewTask={onViewTask}
        />
        {/* Row 3: Not Important Tasks */}
        <div className={`${verticalLabelCellStyle}`}>
          <span className="transform -rotate-90 whitespace-nowrap p-2">
            NOT IMPORTANT
          </span>
        </div>
        <Quadrant
          actionText={QUADRANTS.DELEGATE.actionText}
          tasksInQuadrant={delegateTasks}
          quadrantStyle={QUADRANTS.DELEGATE.style}
          onViewTask={onViewTask}
        />
        <Quadrant
          actionText={QUADRANTS.ELIMINATE.actionText}
          tasksInQuadrant={eliminateTasks}
          quadrantStyle={QUADRANTS.ELIMINATE.style}
          onViewTask={onViewTask}
        />
      </div>
    </div>
  );
};

EisenhowerMatrix.propTypes = {
  tasks: PropTypes.arrayOf(conciseTaskPropTypes).isRequired,
  onViewTask: PropTypes.func.isRequired,
  // onEditRequest: PropTypes.func.isRequired,
  // onDeleteRequest: PropTypes.func.isRequired,
};

export default EisenhowerMatrix;
