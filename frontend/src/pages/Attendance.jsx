import React, { useEffect, useState } from 'react';
import { getEmployees, markAttendance, getAllAttendance } from '../services/api';
import { CalendarCheck, Search, Plus, Filter, X } from 'lucide-react';
import Swal from 'sweetalert2';

const Attendance = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Present');
  const [formError, setFormError] = useState('');

  // Filter State
  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, attRes] = await Promise.all([getEmployees(), getAllAttendance()]);
      setEmployees(empRes.data);
      setAttendanceRecords(attRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const today = new Date().toISOString().split('T')[0];
    if (date > today) {
        setFormError('Cannot mark attendance for future dates.');
        return;
    }

    try {
      await markAttendance({
        employee_id: selectedEmployee,
        date: date,
        status: status
      });
      
      setIsModalOpen(false);
      resetForm();
      fetchData();
      
      Swal.fire({
        icon: 'success',
        title: 'Attendance Marked',
        text: 'Attendance has been recorded successfully.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      setFormError('Failed to mark attendance. Please try again.');
    }
  };

  const resetForm = () => {
    setSelectedEmployee('');
    setDate(new Date().toISOString().split('T')[0]);
    setStatus('Present');
    setFormError('');
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Helper to get employee name from ID
  const getEmployeeName = (id) => {
    const emp = employees.find(e => e.employee_id === id);
    return emp ? emp.full_name : id;
  };

  // Filter logic
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesDate = filterDate ? record.date === filterDate : true;
    const empName = getEmployeeName(record.employee_id).toLowerCase();
    const matchesSearch = searchTerm 
        ? empName.includes(searchTerm.toLowerCase()) || record.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
    return matchesDate && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Attendance Management</h1>
        <button 
            onClick={openModal}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition shadow-sm"
        >
            <Plus className="w-4 h-4 mr-2" />
            Mark Attendance
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                className="pl-10 block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                placeholder="Search by employee name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-sm text-gray-500 whitespace-nowrap">Filter Date:</span>
            <input 
                type="date" 
                className="block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
            />
            {filterDate && (
                <button 
                    onClick={() => setFilterDate('')}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Clear Date Filter"
                >
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr>
                            <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">Loading records...</td>
                        </tr>
                    ) : filteredRecords.length > 0 ? (
                        filteredRecords.map((record, index) => (
                            <tr key={`${record.employee_id}-${record.date}-${index}`} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {getEmployeeName(record.employee_id)}
                                    <span className="ml-2 text-xs text-gray-500 font-normal">({record.employee_id})</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        record.status === 'Present' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {record.status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                <CalendarCheck className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                <p>No attendance records found matching your filters.</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 transition-opacity">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-900">Mark Attendance</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                
                <form onSubmit={handleMarkAttendance} className="p-6 space-y-4">
                    {formError && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{formError}</div>}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                        <select 
                            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            value={selectedEmployee}
                            onChange={(e) => { setSelectedEmployee(e.target.value); setFormError(''); }}
                            required
                        >
                            <option value="">Select an Employee...</option>
                            {employees.map(emp => (
                                <option key={emp.employee_id} value={emp.employee_id}>
                                    {emp.full_name} ({emp.employee_id})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input 
                            type="date" 
                            required
                            max={new Date().toISOString().split('T')[0]}
                            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select 
                            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            Save Record
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
