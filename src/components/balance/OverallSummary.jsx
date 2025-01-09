import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOverallSummary } from '../../store/slice/balanceSheetSlice';

const OverallSummary = () => {
  const dispatch = useDispatch();
  const { overallSummary, loading } = useSelector((state) => state.balanceSheet);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchOverallSummary(user._id));
    }
  }, [dispatch, user]);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Overall Summary Card */}
      <div className="bg-gray-800/90 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Overall Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/20 p-4 rounded-lg">
            <h3 className="text-green-400 font-semibold">Total Income</h3>
            <p className="text-2xl text-white">${overallSummary.overall.totalIncome.toLocaleString()}</p>
          </div>
          <div className="bg-red-500/20 p-4 rounded-lg">
            <h3 className="text-red-400 font-semibold">Total Expenses</h3>
            <p className="text-2xl text-white">${overallSummary.overall.totalExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-blue-500/20 p-4 rounded-lg">
            <h3 className="text-blue-400 font-semibold">Net Balance</h3>
            <p className="text-2xl text-white">${overallSummary.overall.netBalance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Project-wise Breakdown */}
      <div className="bg-gray-800/90 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Project-wise Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">Project</th>
                <th className="text-right p-2">Income</th>
                <th className="text-right p-2">Expenses</th>
                <th className="text-right p-2">Balance</th>
              </tr>
            </thead>
            <tbody>
              {overallSummary.projectWise.map((project, index) => (
                <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="p-2">{project.projectName}</td>
                  <td className="text-right p-2 text-green-400">
                    ${project.income.toLocaleString()}
                  </td>
                  <td className="text-right p-2 text-red-400">
                    ${project.expenses.toLocaleString()}
                  </td>
                  <td className="text-right p-2">
                    <span className={project.balance >= 0 ? 'text-green-400' : 'text-red-400'}>
                      ${project.balance.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OverallSummary;