import React from 'react';
import { motion } from 'framer-motion';

// Update status labels to exactly match backend values
const statusLabels = {
  'Under Disscussion': 'Under Discussion',
  'In Progress': 'In Progress',
  'Completed': 'Completed'
};

const ProjectStatusTabs = ({ currentStatus, onStatusChange }) => {
  return (
    <div className="flex space-x-2 mb-4 bg-white p-2 rounded-lg">
      {Object.entries(statusLabels).map(([status, label]) => (
        <motion.button
          key={status}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStatusChange(status)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            currentStatus === status
              ? 'bg-[#B08968] text-white'
              : 'text-[#7F5539] hover:bg-[#B08968]/10'
          }`}
        >
          {label}
        </motion.button>
      ))}
    </div>
  );
};

export default ProjectStatusTabs;
