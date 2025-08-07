
// frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import MeetingList from '../components/MeetingList';
import VideoUpload from '../components/VideoUpload';
import VideoPlayer from '../components/VideoPlayer';
import api from '../services/api';

const Dashboard = () => {
  const [meetings, setMeetings] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meetingsRes, videosRes] = await Promise.all([
          api.get('/meetings'),
          api.get('/videos')
        ]);
        setMeetings(meetingsRes.data);
        setVideos(videosRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const handleUploadSuccess = (newVideo) => {
    setVideos([...videos, newVideo]);
  };

  const refreshMeetings = async () => {
    try {
      const res = await api.get('/meetings');
      setMeetings(res.data);
    } catch (error) {
      console.error('Failed to refresh meetings:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Meeting Bot Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <MeetingList meetings={meetings} refreshMeetings={refreshMeetings} />
        </div>
        <div className="space-y-6">
          <VideoUpload onUploadSuccess={handleUploadSuccess} />
          {selectedVideo && (
            <VideoPlayer video={selectedVideo} className="h-64" />
          )}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">Your Videos</h3>
            <div className="grid grid-cols-2 gap-2">
              {videos.map((video) => (
                <div
                  key={video._id}
                  onClick={() => setSelectedVideo(video)}
                  className={`p-2 rounded cursor-pointer ${
                    selectedVideo?._id === video._id
                      ? 'bg-blue-100'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <p className="text-sm truncate">{video.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;