import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { ChevronRight, Trash2 } from 'lucide-react';
import { updateProjectStatus } from '../store/slice/projectSlice';

const STATUS_OPTIONS = [
  { value: 'Under Disscussion', label: 'Under Discussion' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' }
];

const ProjectList = ({ projects, onDelete, onSelect, selectedProject }) => {
  const dispatch = useDispatch();
  
  const handleStatusChange = async (projectId, newStatus) => {
    try {
      console.log('Updating status to:', newStatus); // Debug log
      await dispatch(updateProjectStatus({ projectId, status: newStatus })).unwrap();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Filter - simplified without "All" option */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_OPTIONS.map(option => (
          <button
            key={option.value}
            onClick={() => setStatusFilter(option.value)}
            className={`px-3 py-1 rounded-lg ${
              statusFilter === option.value ? 'bg-[#B08968] text-white' : 'bg-gray-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Projects List */}
      {projects.map((project) => (
        <motion.div
          key={project._id}
          layout
          className={`p-4 rounded-lg shadow-md ${
            selectedProject?._id === project._id
              ? "bg-[#B08968]/20 border-2 border-[#B08968]"
              : "bg-white"
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#7F5539]">{project.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{project.description}</p>
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Budget: ${project.budget.toLocaleString()}
                  </span>
                  <select
                    value={project.status}
                    onChange={(e) => handleStatusChange(project._id, e.target.value)}
                    className="px-2 py-1 text-sm border rounded-lg bg-white text-[#7F5539]"
                  >
                    {STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(project)}
                className="p-2 text-[#B08968] hover:text-[#7F5539]"
              >
                <ChevronRight size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(project._id)}
                className="p-2 text-red-500 hover:text-red-700"
              >
                <Trash2 size={20} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ProjectList;
