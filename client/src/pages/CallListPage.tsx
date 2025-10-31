import React from 'react';
import CallList from '../components/CallList';

const CallListPage: React.FC = () => {
  return (
    <div className="flex justify-center items-start min-h-[calc(100vh-200px)] py-6">
      <CallList 
        apiKey={import.meta.env.VITE_VAPI_API_KEY_PRIVATE}
        onCallSelect={(call) => {
          console.log('Selected call:', call);
        }}
      />
    </div>
  );
};

export default CallListPage;
