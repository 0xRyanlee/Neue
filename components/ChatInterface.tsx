import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../types';
import { Send, Camera, User, Bot, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  onGenerate: () => void;
  readyToGenerate: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isProcessing,
  onGenerate,
  readyToGenerate
}) => {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-[600px] border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      {/* Header */}
      <div className="p-4 border-b-2 border-black bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-bold uppercase tracking-wider text-sm">Studio Assistant</span>
        </div>
        {readyToGenerate && (
          <Button size="sm" onClick={onGenerate} className="animate-pulse bg-blue-600 text-white hover:bg-blue-700 border-none">
            <Camera className="w-4 h-4 mr-2" />
            SNAP PHOTO
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                <Bot size={48} className="mb-2"/>
                <p className="text-sm font-mono text-center max-w-xs">
                    Start a conversation to refine your photo settings. The assistant will guide your lighting and pose.
                </p>
            </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-black
              ${msg.role === 'user' ? 'bg-black text-white' : 'bg-white text-black'}
            `}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`
              max-w-[80%] p-3 text-sm leading-relaxed border border-gray-200
              ${msg.role === 'user' 
                ? 'bg-black text-white rounded-tr-none rounded-2xl' 
                : 'bg-gray-100 text-black rounded-tl-none rounded-2xl'
              }
            `}>
              {msg.content}
            </div>
          </div>
        ))}
        {isProcessing && (
           <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-white border border-black flex items-center justify-center">
               <Bot size={14} />
             </div>
             <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none flex items-center">
               <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
             </div>
           </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-black bg-gray-50 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Adjust lighting, change expression, or refine style..."
          className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm"
          disabled={isProcessing}
        />
        <Button 
            type="submit" 
            size="sm" 
            variant="primary" 
            disabled={isProcessing || !input.trim()}
            className="w-12 h-10 px-0 flex items-center justify-center"
        >
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
};