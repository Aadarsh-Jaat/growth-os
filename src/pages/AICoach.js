// pages/AICoach.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bot, Send, Sparkles, Loader } from 'lucide-react';

export default function AICoach() {
  const { userData } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${userData?.name || 'there'}! 👋 I'm your AI Coach. I can help you with daily planning, motivation, business ideas, fitness consistency, and more. What would you like to focus on today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestions = [
    "What should I focus on today?",
    "Review my week",
    "I missed gym 3 days, what should I do?",
    "How can I improve Wildcore this week?",
    "What should I study for my job this week?",
    "How can I save more money?",
    "Give me motivation to stay consistent",
    "Help me plan my career growth"
  ];

  const generateAIResponse = async (userMessage) => {
    // This is a mock AI response system
    // In production, you would integrate OpenAI or Google's Gemini API here
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const responses = {
      default: "Great question! Based on your goals, I recommend breaking down your tasks into smaller, manageable chunks. Start with the highest priority task and use the Pomodoro technique (25 min work, 5 min break). Remember, consistency beats intensity! 🎯",
      gym: "Missing the gym happens to everyone! Don't be too hard on yourself. Here's what you can do: 1) Start small - just do 10 minutes today 2) Schedule your workout at the same time daily 3) Find an accountability partner 4) Remember why you started. You've got this! 💪",
      wildcore: "For Wildcore this week, focus on: 1) Post 3 Instagram reels showing product benefits 2) Respond to all customer messages within 2 hours 3) Run a small giveaway to boost engagement 4) Collect testimonials from happy customers. Small consistent actions lead to big results! 🚀",
      money: "To save more money, try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Also track every expense for 7 days - you'll be surprised where money goes. Consider automating your savings transfer right after salary credit! 💰",
      career: "For job preparation, focus on: 1) Complete 1 project this week to showcase 2) Solve 2 LeetCode problems daily 3) Update LinkedIn with your latest skills 4) Apply to 5 relevant positions. Quality over quantity in applications! 📈"
    };
    
    const lowerMsg = userMessage.toLowerCase();
    if (lowerMsg.includes('gym') || lowerMsg.includes('workout') || lowerMsg.includes('fitness')) {
      return responses.gym;
    } else if (lowerMsg.includes('wildcore') || lowerMsg.includes('perfume') || lowerMsg.includes('brand')) {
      return responses.wildcore;
    } else if (lowerMsg.includes('money') || lowerMsg.includes('save') || lowerMsg.includes('savings')) {
      return responses.money;
    } else if (lowerMsg.includes('career') || lowerMsg.includes('job') || lowerMsg.includes('interview')) {
      return responses.career;
    } else {
      return responses.default;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);
    
    const aiResponse = await generateAIResponse(userMessage);
    setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-3">
          <Bot size={32} />
          <div>
            <h1 className="text-2xl font-bold">AI Coach</h1>
            <p className="opacity-90">Your personal AI assistant for growth and success</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <Bot size={16} className="text-purple-500" />
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">AI Coach</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader size={18} className="animate-spin text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
          <Sparkles size={14} />
          Suggested questions:
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInput(suggestion)}
              className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about your growth journey..."
          className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          rows="2"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}