import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { exportEntries, downloadAllEntriesAsBill } from '../../store/slice/entrySlice';

const BillExportButton = () => {
  const dispatch = useDispatch();
  const selectedProject = useSelector(state => state.projects.selectedProject);
  const status = useSelector(state => state.entries.status);
  const [showOptions, setShowOptions] = useState(false);

  const handleExcelExport = async () => {
    if (!selectedProject?._id) {
      alert('Please select a project first');
      return;
    }
    
    try {
      await dispatch(exportEntries(selectedProject._id)).unwrap();
    } catch (error) {
      console.error('Failed to export to Excel:', error);
    }
  };

  const handleBillExport = async () => {
    if (!selectedProject?._id) {
      alert('Please select a project first');
      return;
    }
    
    try {
      await dispatch(downloadAllEntriesAsBill(selectedProject._id)).unwrap();
    } catch (error) {
      console.error('Failed to export as bill:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={status === 'loading' || !selectedProject}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download size={16} />
        {status === 'loading' ? 'Exporting...' : 'Export'}
      </button>
      
      {showOptions && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
          <button
            onClick={() => {
              handleExcelExport();
              setShowOptions(false);
            }}
            disabled={status === 'loading' || !selectedProject}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md"
          >
            <FileSpreadsheet size={16} />
            Export to Excel
          </button>
          <button
            onClick={() => {
              handleBillExport();
              setShowOptions(false);
            }}
            disabled={status === 'loading' || !selectedProject}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-md border-t border-gray-200"
          >
            <FileText size={16} />
            Export as Bill
          </button>
        </div>
      )}
    </div>
  );
};

export default BillExportButton;