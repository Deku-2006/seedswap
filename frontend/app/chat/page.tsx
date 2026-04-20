'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Send, MessageSquare, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/context/authStore';
import { connectSocket } from '@/lib/socket';
import { getInitials, timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Message {
  _id: string;
  text: string;
  sender: { _id: string; name: string; avatar: string | null };
  createdAt: string;
}

interface Chat {
  _id: string;
  participants: { _id: string; name: string; avatar: string | null; location: string }[];
  lastMessage: string;
  lastMessageAt: string;
}

export default function ChatPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('id');
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  const typingTimeout = useRef<any>(null);

  useEffect(() => {
    if (!user) { router.push('/auth'); return; }
    fetchChats();
    const s = connectSocket(token!);
    socketRef.current = s;

    s.on('new:message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });
    s.on('typing:start', ({ userName }: { userName: string }) => setTyping(userName));
    s.on('typing:stop', () => setTyping(null));
    s.on('chat:updated', () => fetchChats());

    return () => {
      s.off('new:message');
      s.off('typing:start');
      s.off('typing:stop');
      s.off('chat:updated');
    };
  }, [user, token]);

  useEffect(() => {
    if (chatId && chats.length > 0) {
      const c = chats.find((c) => c._id === chatId);
      if (c) selectChat(c);
    }
  }, [chatId, chats]);

  const fetchChats = async () => {
    try {
      const res = await api.get('/chat');
      setChats(res.data.chats);
    } catch {}
    setLoading(false);
  };

  const selectChat = async (chat: Chat) => {
    if (activeChat?._id === chat._id) return;
    if (activeChat) socketRef.current?.emit('leave:chat', activeChat._id);
    setActiveChat(chat);
    socketRef.current?.emit('join:chat', chat._id);
    try {
      const res = await api.get(`/chat/${chat._id}/messages`);
      setMessages(res.data.messages);
      scrollToBottom();
    } catch { toast.error('Failed to load messages'); }
  };

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeChat) return;
    setSending(true);
    const msgText = text.trim();
    setText('');
    socketRef.current?.emit('send:message', { chatId: activeChat._id, text: msgText });
    setSending(false);
  };

  const handleTyping = (val: string) => {
    setText(val);
    if (!activeChat) return;
    socketRef.current?.emit('typing:start', { chatId: activeChat._id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit('typing:stop', { chatId: activeChat._id });
    }, 1500);
  };

  const getOtherParticipant = (chat: Chat) =>
    chat.participants.find((p) => p._id !== user?._id) || chat.participants[0];

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-0px)] md:h-screen bg-[#f6f9f4]">
      {/* Sidebar: chat list */}
      <div className={cn(
        'w-full md:w-72 bg-white border-r border-sage-100 flex flex-col',
        activeChat && 'hidden md:flex'
      )}>
        <div className="p-4 border-b border-sage-100">
          <h2 className="font-display text-lg font-semibold text-sage-900">Messages</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center p-6">
            <MessageSquare className="w-10 h-10 text-sage-300 mb-3" />
            <p className="font-medium text-sage-600 text-sm">No conversations yet</p>
            <p className="text-sage-400 text-xs mt-1">Browse listings and click "Chat to Swap"</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {chats.map((chat) => {
              const other = getOtherParticipant(chat);
              return (
                <button
                  key={chat._id}
                  onClick={() => selectChat(chat)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3.5 hover:bg-sage-50 transition-colors border-b border-sage-50 text-left',
                    activeChat?._id === chat._id && 'bg-brand-50'
                  )}
                >
                  {other.avatar ? (
                    <img src={other.avatar} alt={other.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-medium text-sm shrink-0">
                      {getInitials(other.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sage-800 text-sm truncate">{other.name}</p>
                    <p className="text-sage-400 text-xs truncate">{chat.lastMessage || 'Start chatting...'}</p>
                  </div>
                  {chat.lastMessageAt && (
                    <span className="text-xs text-sage-400 shrink-0">{timeAgo(chat.lastMessageAt)}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className={cn(
        'flex-1 flex flex-col',
        !activeChat && 'hidden md:flex'
      )}>
        {activeChat ? (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-sage-100 px-5 py-3.5 flex items-center gap-3">
              <button onClick={() => setActiveChat(null)} className="md:hidden p-1 rounded hover:bg-sage-50">
                <ArrowLeft className="w-5 h-5 text-sage-600" />
              </button>
              {(() => {
                const other = getOtherParticipant(activeChat);
                return (
                  <>
                    {other.avatar ? (
                      <img src={other.avatar} alt={other.name} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-medium text-sm">
                        {getInitials(other.name)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sage-800 text-sm">{other.name}</p>
                      <p className="text-sage-400 text-xs">{other.location || 'Earth'}</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMine = msg.sender._id === user._id;
                return (
                  <div key={msg._id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      'max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                      isMine
                        ? 'bg-brand-500 text-white rounded-br-sm'
                        : 'bg-white border border-sage-100 text-sage-800 rounded-bl-sm'
                    )}>
                      <p>{msg.text}</p>
                      <p className={cn('text-xs mt-1', isMine ? 'text-white/60' : 'text-sage-400')}>
                        {timeAgo(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-sage-100 px-4 py-2.5 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="bg-white border-t border-sage-100 p-4 flex items-center gap-3">
              <input
                type="text"
                value={text}
                onChange={(e) => handleTyping(e.target.value)}
                placeholder="Type a message..."
                className="input-field flex-1"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!text.trim() || sending}
                className="w-10 h-10 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white rounded-full flex items-center justify-center transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <MessageSquare className="w-14 h-14 text-sage-200 mb-4" />
            <h3 className="font-display text-xl text-sage-700 mb-2">Please log in</h3>
            <p className="text-sage-500 text-sm">You need to be logged in to view your messages.</p>
          </div>
        )}
      </div>
    </div>
  );
}
