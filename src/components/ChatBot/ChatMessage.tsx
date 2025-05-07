import React from 'react';
import { motion } from 'framer-motion';

export interface ChatMessageProps {
  type: 'bot' | 'user';
  text: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ type, text }) => {
  const isBot = type === 'bot';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`flex ${isBot ? 'flex-row' : 'flex-row-reverse'} items-end max-w-[80%] space-x-2`}>
        <div className={`flex-shrink-0 ${!isBot && 'ml-2'}`}>
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img
              src={isBot 
                ? '/assets/aze.png'
                : '/assets/s.png'
              }
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isBot
              ? 'bg-white text-gray-800 shadow-sm'
              : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
          }`}
        >
          <p className="text-sm">{text}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;