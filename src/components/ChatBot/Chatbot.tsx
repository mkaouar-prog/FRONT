import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { useChat } from '../../hooks/useChat';
import { FaPaperPlane, FaRobot } from 'react-icons/fa';

const Chatbot: React.FC = () => {
  const { messages, loading, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  return (

    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-lg ">
      {/* Header */}
      <div className="flex items-center space-x-4 p-4 border-b">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-2 rounded-lg">
          <FaRobot className="text-white text-xl" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">AI Assistant</h2>
          <p className="text-sm text-gray-500">Always here to help</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} type={msg.type} text={msg.text} />
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            disabled={loading}
          >
            <FaPaperPlane className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  
  );
};

export default Chatbot;