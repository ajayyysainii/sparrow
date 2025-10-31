import React from 'react';
import VapiWidget from '../components/VapiWidget';

const CallPage: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <VapiWidget 
        apiKey={import.meta.env.VITE_VAPI_API_KEY} 
        assistantId={import.meta.env.VITE_ASSISTANT_ID} 
      />
    </div>
  );
};

export default CallPage;
