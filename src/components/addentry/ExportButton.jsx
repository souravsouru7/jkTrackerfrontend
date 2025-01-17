import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Download } from 'lucide-react';
import { exportEntries } from '../../store/slice/entrySlice';

const ExportButton = () => {
  const dispatch = useDispatch();
  const selectedProject = useSelector(state => state.projects.selectedProject);
  const status = useSelector(state => state.entries.status);

  const handleExport = async () => {
    if (!selectedProject?._id) {
      alert('Please select a project first');
      return;
    }
    
    try {
      await dispatch(exportEntries(selectedProject._id)).unwrap();
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={status === 'loading' || !selectedProject}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download size={16} />
      {status === 'loading' ? 'Exporting...' : 'Export to Excel'}
    </button>
  );
};

export default ExportButton;
