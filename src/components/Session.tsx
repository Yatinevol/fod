import React from 'react';

interface Participant {
  id: string;
  username: string;
  progress: number;
  goal: number;
  online: boolean;
}

interface SessionProps {
  participants: Participant[];
  isActive: boolean;
}

const Session: React.FC<SessionProps> = ({ participants, isActive }) => {
  if (!isActive || participants.length === 0) {
    return null; // Don't show when no session or no participants
  }

  return (
    <div className='bg-white rounded-lg border border-gray-200 p-6'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-lg font-semibold'>Participants</h2>
        <span className='text-sm text-gray-600'>{participants.filter(p => p.online).length} online</span>
      </div>
      
      <div className='space-y-4'>
        {participants.map((participant) => (
          <div key={participant.id} className='flex items-center justify-between p-3 border border-gray-100 rounded-lg'>
            <div className='flex items-center space-x-3'>
              <div className='relative'>
                <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center'>
                  <span className='text-purple-600 font-semibold text-sm'>
                    {participant.username.charAt(0)}
                  </span>
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  participant.online ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
              <span className='font-medium text-gray-900'>{participant.username}</span>
            </div>
            
            <div className='flex items-center space-x-4'>
              <div className='text-right'>
                <div className='text-sm font-semibold text-gray-900'>
                  {participant.progress} / {participant.goal} hours
                </div>
                <div className='text-xs text-gray-500'>
                  {Math.round((participant.progress / participant.goal) * 100)}% complete
                </div>
              </div>
              <div className='w-24 h-2 bg-gray-200 rounded-full'>
                <div 
                  className='h-2 bg-purple-500 rounded-full transition-all duration-300'
                  style={{ width: `${Math.min((participant.progress / participant.goal) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Session;