import React, { useEffect, useState } from 'react';
import { getDashboardSummary } from '../services/api';
import { Users, UserCheck } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ total_employees: 0, present_today: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await getDashboardSummary();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <Users className="w-8 h-8" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_employees}</p>
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <UserCheck className="w-8 h-8" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">Present Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.present_today}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
