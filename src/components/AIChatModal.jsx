import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageSquare } from 'lucide-react';
import { sendMessage, fetchChatHistory, toggleChat } from '../store/slice/chatSlice';

const AIChatModal = () => {
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);
  const { messages, loading, isOpen } = useSelector((state) => state.chat);

  // Get initial position from localStorage or use default
  const [position, setPosition] = useState(() => {
    const savedPosition = localStorage.getItem('chatButtonPosition');
    return savedPosition ? JSON.parse(savedPosition) : { x: 0, y: 0 };
  });

  // Save position to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chatButtonPosition', JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchChatHistory());
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    dispatch(sendMessage(input));
    setInput('');
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 }
  };

  return (
    <>
      {/* Chat Toggle Button - Moved higher up */}
      {!isOpen && (
        <div className="fixed bottom-40 right-4 z-[9999]">
          <motion.button
            drag
            dragMomentum={false}
            dragConstraints={{
              top: -window.innerHeight + 40,
              left: -window.innerWidth + 40,
              right: 0,
              bottom: 0
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(toggleChat())}
            className="w-9 h-9 bg-[#B08968] hover:bg-[#9C6644] text-white rounded-full shadow-lg flex items-center justify-center transition-colors duration-200"
          >
            <MessageSquare size={16} />
          </motion.button>
        </div>
      )}

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-96 md:h-[500px] bg-white flex flex-col rounded-lg shadow-lg"
            style={{ zIndex: 9998 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b bg-white sticky top-0 z-10">
              <h3 className="text-lg font-semibold text-[#7F5539]">AI Assistant</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => dispatch(toggleChat())}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-end">
                    <div className="bg-[#B08968] text-white rounded-lg py-2 px-4 max-w-[80%]">
                      {msg.message}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg py-2 px-4 max-w-[80%]">
                      {msg.response}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg py-2 px-4 max-w-[80%]">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Box - Fixed at bottom */}
            <div className="border-t bg-white p-4 sticky bottom-0 z-10">
              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full pr-12 pl-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-[#B08968]"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#B08968] text-white p-2 rounded-lg hover:bg-[#9C6644] transition-colors"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatModal; 