'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  ArrowLeft,
} from 'lucide-react';
import { mockConversations, mockMessages, mockCurrentProfile } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { Conversation, Message } from '@/types';

function ConversationItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}) {
  const otherMember = conversation.members?.find(
    (m) => m.id !== mockCurrentProfile.id
  );
  const displayName =
    conversation.type === 'group'
      ? conversation.name
      : otherMember?.display_name;
  const avatarUrl =
    conversation.type === 'group'
      ? null
      : otherMember?.avatar_url;
  const isOnline = otherMember?.is_online ?? false;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left',
        isActive
          ? 'bg-vc-red-500/10 border border-vc-red-500/20'
          : 'hover:bg-vc-dark-600/50 border border-transparent'
      )}
    >
      <div className="relative shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName || ''}
            className="w-11 h-11 rounded-full bg-vc-dark-600"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-vc-purple-500 to-vc-cyan-500 flex items-center justify-center text-xs font-bold">
            {(conversation.name || '?').charAt(0)}
          </div>
        )}
        {conversation.type === 'direct' && isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-vc-dark-800" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-200 truncate">
            {displayName}
          </p>
          <span className="text-[10px] text-gray-500 shrink-0">
            {formatDistanceToNow(new Date(conversation.last_message_at), {
              addSuffix: false,
            })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 truncate">
            {conversation.last_message?.content}
          </p>
          {(conversation.unread_count ?? 0) > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-vc-red-500 text-white rounded-full min-w-[18px] text-center shrink-0">
              {conversation.unread_count}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

function ChatBubble({
  message,
  isOwn,
}: {
  message: Message;
  isOwn: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-2 mb-3', isOwn ? 'justify-end' : 'justify-start')}
    >
      {!isOwn && (
        <img
          src={message.sender?.avatar_url || ''}
          alt={message.sender?.display_name}
          className="w-7 h-7 rounded-full bg-vc-dark-600 shrink-0 mt-1"
        />
      )}
      <div
        className={cn(
          'max-w-[70%] px-4 py-2.5 rounded-2xl text-sm',
          isOwn
            ? 'bg-gradient-to-r from-vc-red-500/80 to-vc-red-600/80 text-white rounded-br-md'
            : 'bg-vc-dark-700 text-gray-200 rounded-bl-md border border-white/5'
        )}
      >
        {!isOwn && message.sender && (
          <p className="text-[10px] font-medium text-vc-cyan-400 mb-1">
            {message.sender.display_name}
          </p>
        )}
        <p className="leading-relaxed">{message.content}</p>
        <p
          className={cn(
            'text-[10px] mt-1',
            isOwn ? 'text-white/50' : 'text-gray-500'
          )}
        >
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -4, 0] }}
            transition={{
              repeat: Infinity,
              duration: 0.6,
              delay: i * 0.15,
            }}
            className="w-1.5 h-1.5 rounded-full bg-gray-500"
          />
        ))}
      </div>
      <span className="text-xs text-gray-500">typing...</span>
    </div>
  );
}

export default function MessagesPage() {
  const [activeConvId, setActiveConvId] = useState<string | null>('conv-1');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = mockConversations.find(
    (c) => c.id === activeConvId
  );
  const conversationMessages = mockMessages.filter(
    (m) => m.conversation_id === activeConvId
  );

  const filteredConversations = mockConversations.filter((c) => {
    if (!searchQuery) return true;
    const name =
      c.type === 'group'
        ? c.name
        : c.members?.find((m) => m.id !== mockCurrentProfile.id)?.display_name;
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvId]);

  const handleSelectConversation = (id: string) => {
    setActiveConvId(id);
    setShowMobileChat(true);
  };

  const otherMember = activeConversation?.members?.find(
    (m) => m.id !== mockCurrentProfile.id
  );

  return (
    <div className="max-w-6xl mx-auto w-full h-[calc(100vh-5rem)]">
      <div className="glass rounded-2xl border border-white/5 h-full flex overflow-hidden">
        {/* Conversation List */}
        <div
          className={cn(
            'w-full md:w-[340px] border-r border-white/5 flex flex-col shrink-0',
            showMobileChat ? 'hidden md:flex' : 'flex'
          )}
        >
          <div className="p-4 border-b border-white/5">
            <h2 className="text-lg font-display font-bold text-gray-100 mb-3">
              Messages
            </h2>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-vc-dark-600/50 border border-white/5 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-vc-cyan-500/30"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeConvId}
                onClick={() => handleSelectConversation(conv.id)}
              />
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={cn(
            'flex-1 flex flex-col',
            !showMobileChat ? 'hidden md:flex' : 'flex'
          )}
        >
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden text-gray-400 hover:text-gray-200"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="relative">
                  {otherMember?.avatar_url ? (
                    <img
                      src={otherMember.avatar_url}
                      alt=""
                      className="w-9 h-9 rounded-full bg-vc-dark-600"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-vc-purple-500 to-vc-cyan-500 flex items-center justify-center text-xs font-bold">
                      {(activeConversation.name || '?').charAt(0)}
                    </div>
                  )}
                  {otherMember?.is_online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-vc-dark-700" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-200">
                    {activeConversation.type === 'group'
                      ? activeConversation.name
                      : otherMember?.display_name}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {otherMember?.is_online
                      ? 'Online'
                      : activeConversation.type === 'group'
                        ? `${activeConversation.members?.length} members`
                        : 'Offline'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-vc-dark-600/50 text-gray-400 hover:text-gray-200 transition-colors">
                    <Phone size={16} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-vc-dark-600/50 text-gray-400 hover:text-gray-200 transition-colors">
                    <Video size={16} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-vc-dark-600/50 text-gray-400 hover:text-gray-200 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {conversationMessages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.sender_id === mockCurrentProfile.id}
                  />
                ))}
                <TypingIndicator />
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-vc-dark-600/50 text-gray-400 hover:text-gray-200 transition-colors">
                    <Paperclip size={18} />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && messageInput.trim()) {
                          setMessageInput('');
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-vc-dark-600/50 border border-white/5 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-vc-cyan-500/30"
                    />
                  </div>
                  <button className="p-2 rounded-lg hover:bg-vc-dark-600/50 text-gray-400 hover:text-gray-200 transition-colors">
                    <Smile size={18} />
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 bg-gradient-to-r from-vc-red-500 to-vc-red-600 rounded-xl text-white hover:shadow-lg hover:shadow-vc-red-500/20 transition-shadow"
                  >
                    <Send size={16} />
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-vc-dark-700 flex items-center justify-center mx-auto mb-4">
                  <Send size={24} className="text-gray-600" />
                </div>
                <p className="text-gray-400 font-medium">Select a conversation</p>
                <p className="text-sm text-gray-500 mt-1">
                  Choose from your existing conversations
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
