import { useState, useRef, useEffect } from 'react';
import API from '../api/axios';
import { FiSend, FiMessageSquare, FiUser, FiZap } from 'react-icons/fi';

export default function AiChat() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm your AI study assistant. Ask me anything about studying, time management, or exam preparation!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await API.post('/api/ai/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.aiResponse }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, AI service is unavailable right now.', error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'How do I improve my focus?',
    'Create a study plan for exams',
    'Tips for effective note-taking',
    'How to manage study stress?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiMessageSquare className="text-indigo-500" /> AI Study Assistant
        </h1>
        <p className="text-gray-500 text-sm mt-1">Powered by Gemini AI</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-gradient-to-br from-purple-500 to-indigo-500'}`}>
              {msg.role === 'user'
                ? <FiUser className="text-white text-sm" />
                : <FiZap className="text-white text-sm" />}
            </div>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : msg.error
                  ? 'bg-red-50 text-red-600 rounded-tl-none'
                  : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shrink-0">
              <FiZap className="text-white text-sm" />
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => setInput(s)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-3">
        <input
          className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          placeholder="Ask your study assistant..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}
          className="px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm">
          <FiSend />
        </button>
      </form>
    </div>
  );
}
