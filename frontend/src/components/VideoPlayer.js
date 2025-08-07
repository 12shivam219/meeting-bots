
// frontend/src/components/VideoPlayer.js
import React, { useRef, useEffect } from 'react';

const VideoPlayer = ({ video, className = '' }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [video]);

  if (!video) return null;

  return (
    <div className={`bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        controls
        className="w-full h-full object-contain"
      >
        <source src={`/api/videos/${video._id}/stream`} type={video.mimeType} />
        Your browser does not support the video tag.
      </video>
      <div className="p-3 bg-gray-900">
        <h4 className="text-white font-medium">{video.name}</h4>
        <p className="text-gray-400 text-sm">
          Duration: {Math.floor(video.duration / 60)}m {video.duration % 60}s
        </p>
      </div>
    </div>
  );
};

export default VideoPlayer;