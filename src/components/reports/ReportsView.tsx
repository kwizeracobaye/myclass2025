import React from 'react';
import { FileText, Download } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const reportTypes = [
    { name: 'Student Enrollment Report', description: 'Complete list of enrolled students by faculty and program' },
    { name: 'Medical Summary Report', description: 'Active medical cases and treatment statistics' },
    { name: 'Room Utilization Report', description: 'Lecture room usage and availability statistics' },
    { name: 'Materials Inventory Report', description: 'Stock levels and material distribution history' },
    { name: 'External Practice Report', description: 'Upcoming and completed field practice sessions' },
    { name: 'Weekly Activity Report', description: 'Comprehensive weekly summary of all activities' },
  ];

  const handleGenerate = (reportName: string) => {
    alert(`Generating ${reportName}... This feature will export data to PDF/Excel format.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-gray-600 mt-1">Generate and download system reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <div key={report.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{report.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                <button
                  onClick={() => handleGenerate(report.name)}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
