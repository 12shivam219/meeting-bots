// frontend/src/pages/Meetings.js
import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import api from '../services/api';

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await api.get('/meetings');
        setMeetings(response.data);
      } catch (error) {
        console.error('Failed to fetch meetings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Meetings</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Meeting History</h3>
        </div>
        {meetings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No meetings scheduled yet
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {meetings.map((meeting) => (
              <li key={meeting._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-md font-medium text-gray-800">
                      {meeting.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(meeting.scheduledTime), 'PPPpp')}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: <span className="font-medium">{meeting.status}</span>
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {meeting.duration} minutes
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Meetings;