import React from 'react';
import '../styles/RecordingNotification.css';

const RecordingNotification = ({ isRecording }) => {
  return (
    <div className={`recording-notification ${isRecording ? 'visible' : 'hidden'}`}>
      Recording...
    </div>
  );
};

export default RecordingNotification;
