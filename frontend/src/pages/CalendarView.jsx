import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, parseISO } from 'date-fns';
import api from '../services/api';
import AppLayout from '../components/layout/AppLayout';

export default function CalendarView() {
  const { workspaceId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendarTasks = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/workspaces/${workspaceId}/calendar`);
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching calendar tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      fetchCalendarTasks();
    }
  }, [workspaceId]);

  const tasksOnSelectedDate = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = format(parseISO(task.dueDate), 'yyyy-MM-dd');
    const clickedDate = format(selectedDate, 'yyyy-MM-dd');
    return taskDate === clickedDate;
  });

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayTasks = tasks.filter(t => t.dueDate && format(parseISO(t.dueDate), 'yyyy-MM-dd') === dateStr);
      
      if (dayTasks.length > 0) {
        return (
          <div className="flex justify-center mt-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <AppLayout title="Calendar">
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={tileContent}
              className="w-full border-none shadow-none dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Tasks for {format(selectedDate, 'MMMM do, yyyy')}
            </h3>
            
            {loading ? (
              <p className="text-gray-500">Loading tasks...</p>
            ) : tasksOnSelectedDate.length > 0 ? (
              <ul className="space-y-4">
                {tasksOnSelectedDate.map(task => (
                  <li key={task._id} className="p-3 border dark:border-gray-700 rounded-md">
                    <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Project: {task.project?.name || 'No Project'}
                    </p>
                    <div className="mt-2 flex items-center">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        task.status === 'done' ? 'bg-green-100 text-green-800' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">No tasks due on this day.</p>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        .react-calendar {
          width: 100% !important;
          background: transparent !important;
          border: none !important;
          font-family: inherit !important;
        }
        .dark .react-calendar__tile {
          color: white !important;
        }
        .dark .react-calendar__month-view__days__day--neighboringMonth {
          color: #4b5563 !important;
        }
        .react-calendar__tile--now {
          background: #e5e7eb !important;
          border-radius: 0.375rem;
        }
        .dark .react-calendar__tile--now {
          background: #374151 !important;
        }
        .react-calendar__tile--active {
          background: #3b82f6 !important;
          color: white !important;
          border-radius: 0.375rem;
        }
        .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus {
          background-color: #f3f4f6 !important;
          border-radius: 0.375rem;
        }
        .dark .react-calendar__tile:enabled:hover, .dark .react-calendar__tile:enabled:focus {
          background-color: #4b5563 !important;
        }
      `}</style>
    </AppLayout>
  );
}
