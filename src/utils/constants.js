export const KANBAN_COLUMNS = ["Backlog", "To Do", "In Progress", "Done"];
export const URGENCY_THRESHOLD_DAYS = 3;
export const MAX_CHECKLIST_ITEMS = 10;
export const QUADRANTS = {
  DO: {
    actionText: "DO",
    style: "bg-misty-blue-100", // Example: Blueish for "Do"
    description: "Urgent & Important",
  },
  SCHEDULE: {
    actionText: "DECIDE", // Or "SCHEDULE"
    style: "bg-spearmint-100", // Example: Greenish for "Schedule"
    description: "Not Urgent & Important",
  },
  DELEGATE: {
    actionText: "DELEGATE",
    style: "bg-tangerine-100", // Example: Orangish for "Delegate"
    description: "Urgent & Not Important",
  },
  ELIMINATE: {
    actionText: "DELETE", // Or "ELIMINATE"
    style: "bg-red-100", // Example: Reddish for "Delete"
    description: "Not Urgent & Not Important",
  },
};
