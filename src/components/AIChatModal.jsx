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
      {/* Draggable Chat Toggle Button */}
      <motion.button
        drag
        dragMomentum={false}
        dragConstraints={{
          top: -window.innerHeight + 40,
          left: -window.innerWidth + 40,
          right: window.innerWidth - 40,
          bottom: window.innerHeight - 40
        }}
        initial={{ x: position.x, y: position.y }}
        animate={{ x: position.x, y: position.y }}
        onDragEnd={(event, info) => {
          const newPosition = {
            x: position.x + info.offset.x,
            y: position.y + info.offset.y
          };
          setPosition(newPosition);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95, cursor: 'grabbing' }}
        onClick={() => dispatch(toggleChat())}
        className="fixed top-0 left-0 w-10 h-10 bg-[#9C6644]/90 hover:bg-[#7F5539] text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-colors duration-200 cursor-grab"
      >
        <MessageSquare size={20} />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-40"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-[#7F5539]">AI Assistant</h3>
              <button
                onClick={() => dispatch(toggleChat())}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
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

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#B08968]"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#B08968] text-white p-2 rounded-lg hover:bg-[#9C6644] transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatModal; 