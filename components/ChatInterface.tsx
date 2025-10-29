
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  isChatting: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatHistory, onSendMessage, isChatting }) => {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isChatting) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const isShoppingLinksRequest = (text: string) => {
    const keywords = ['shop', 'buy', 'link', 'find', 'item'];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col h-[60vh]">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6">
          {chatHistory.map((message, index) => (
            <div key={index} className={`flex gap-3 ${message.author === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.author === 'ai' && <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">AI</div>}
              <div className={`max-w-md p-4 rounded-xl ${message.author === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.shoppingLinks && message.shoppingLinks.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h4 className="font-bold">Suggested Items:</h4>
                    {message.shoppingLinks.map((link, linkIndex) => (
                      <a 
                        key={linkIndex} 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block p-3 bg-white dark:bg-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                      >
                        <p className="font-semibold text-indigo-600 dark:text-indigo-400">{link.itemName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{link.description}</p>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isChatting && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">AI</div>
              <div className="max-w-md p-4 rounded-xl bg-gray-200 dark:bg-gray-700">
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-0"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., 'Make the walls light blue' or 'Find a similar sofa'"
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isChatting}
          />
          <button
            type="submit"
            disabled={isChatting || !input.trim()}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
