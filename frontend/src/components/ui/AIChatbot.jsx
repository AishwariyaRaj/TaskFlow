import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleChat, addMessage, setLoading } from '../../store/aiSlice';
import api from '../../services/api';
import { useParams } from 'react-router-dom';

export default function AIChatbot() {
  const dispatch = useDispatch();
  const { workspaceId, projectId } = useParams();
  const currentWorkspace = useSelector(state => state.workspace.current);
  const { messages, isOpen, isLoading } = useSelector(state => state.ai);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    dispatch(addMessage({ text: userMsg, sender: 'user' }));
    dispatch(setLoading(true));

    try {
      // Logic to determine which AI action to take based on keywords
      let endpoint = '/ai/summarize';
      
      // Fallback mechanism for Projects:
      // 1. Check URL parameters (:projectId)
      // 2. Check local local storage/memory if possible or return empty string
      // We will also attempt to fetch projects if we have a workspace but no project ID
      let targetProjectId = projectId || '';

      if (!targetProjectId && workspaceId) {
        try {
          const { data: projects } = await api.get(`/workspaces/${workspaceId}/projects`);
          if (projects && projects.length > 0) {
            targetProjectId = projects[0]._id;
          }
        } catch (e) {
          console.error("Failed to fetch fallback projects for AI", e);
        }
      }

      let body = { projectId: targetProjectId };

      if (userMsg.toLowerCase().includes('create') || userMsg.toLowerCase().includes('generate')) {
        endpoint = '/ai/create-tasks';
        body = { 
          prompt: userMsg, 
          projectId: targetProjectId,
          workspaceId: workspaceId
        };
      } else if (userMsg.toLowerCase().includes('show') || userMsg.toLowerCase().includes('find')) {
        endpoint = '/ai/search-query';
        body = { 
          query: userMsg, 
          projectId: targetProjectId
        };
      }

      const { data } = await api.post(endpoint, body);
      
      let aiResponse = { sender: 'ai' };
      if (data.summary) {
        aiResponse.text = data.summary;
      } else if (data.tasks) {
        aiResponse.text = `Found/Created ${data.tasks.length} tasks matching your request.`;
        aiResponse.data = data.tasks;
      } else {
        aiResponse.text = "I've processed your request.";
      }

      dispatch(addMessage(aiResponse));
    } catch (err) {
      dispatch(addMessage({ 
        text: "Sorry, I encountered an error processing your request. Make sure your Gemini API key is valid.", 
        sender: 'ai' 
      }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => dispatch(toggleChat())}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-indigo-500 transition-all z-50 hover:scale-110 active:scale-95"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-h-[600px] h-[80vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-fade-in translate-y-0">
      <div className="p-4 bg-indigo-600 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">AI</div>
          <div>
            <h3 className="font-bold text-sm">TaskFlow AI</h3>
            <p className="text-[10px] text-white/70">Powered by Gemini</p>
          </div>
        </div>
        <button onClick={() => dispatch(toggleChat())} className="hover:bg-black/10 p-1 rounded-md transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
        {messages.length === 0 && (
          <div className="text-center py-10 px-6">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🤖</div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Try asking:<br/>
              "Create home page tasks"<br/>
              "Summarize my progress"<br/>
              "Show high priority bugs"
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
              m.sender === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
            }`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
              {m.data && (
                <div className="mt-3 space-y-2">
                  {m.data.map((t, idx) => (
                    <div key={idx} className="bg-slate-900 p-2 rounded-lg border border-slate-700 text-xs text-white">
                      {t.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-700">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI anything..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 w-9 h-9 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
