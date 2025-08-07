// frontend/src/components/MeetingList.js
import React from 'react';
import { format, parseISO } from 'date-fns';
import api from '../services/api';

const MeetingList = ({ meetings, refreshMeetings }) => {
  const handleDelete = async (id) => {
    try {
      await api.delete(`/meetings/${id}`);
      refreshMeetings();
    } catch (error) {
      console.error('Failed to delete meeting:', error);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Scheduled Meetings</h3>
      </div>
      <ul className="divide-y divide-gray-200">
        {meetings.map((meeting) => (
          <li key={meeting._id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-md font-medium text-gray-800">{meeting.title}</h4>
                <p className="text-sm text-gray-500">
                  {format(parseISO(meeting.scheduledTime), 'PPPpp')} • {meeting.duration} mins
                </p>
                <p className="text-sm text-gray-500">{meeting.platform}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDelete(meeting._id)}
                  className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-sm hover:bg-red-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MeetingList;