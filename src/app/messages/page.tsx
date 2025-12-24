'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { getConversations, getMessages, sendMessage } from '@/lib/firestore';
import { Message } from '@/lib/types';

const MessagesPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const unsub = getConversations(user.uid, (conversations) => {
        // Here you would fetch the user details for each conversation
        // For now, we will just use the participantId as the name
        const conversationsWithNames = conversations.map(conv => ({
          ...conv,
          participant: conv.participantId
        }));
        setConversations(conversationsWithNames);
        setLoading(false);
      });
      return () => unsub();
    }
  }, [user]);





  useEffect(() => {
    if (selectedConversation && user) {
      const unsub = getMessages(user.uid, selectedConversation.participantId, (messages) => {
        setMessages(messages);
      });
      return () => unsub();
    }
  }, [selectedConversation, user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedConversation) return;

    try {
      await sendMessage({
        senderId: user.uid,
        receiverId: selectedConversation.participantId,
        content: newMessage,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="flex h-[70vh] bg-white rounded-lg shadow">
                {/* Conversations List */}
                <div className="w-1/3 border-r border-gray-200 flex flex-col">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                          selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex justify-between">
                          <h3 className="font-medium text-gray-900">{conversation.participant}</h3>
                          <span className="text-xs text-gray-500">
                            {conversation.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                        {conversation.unread > 0 && (
                          <span className="inline-flex items-center justify-center mt-1 px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                  {selectedConversation ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">{selectedConversation.participant}</h2>
                        <p className="text-sm text-gray-500">Online</p>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex mb-4 ${
                              message.senderId === user?.uid ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.senderId === user?.uid
                                  ? 'bg-indigo-500 text-white'
                                  : 'bg-white text-gray-800 border border-gray-200'
                              }`}
                            >
                              <p>{message.content}</p>
                              <div
                                className={`text-xs mt-1 ${
                                  message.senderId === user?.uid ? 'text-indigo-200' : 'text-gray-500'
                                }`}
                              >
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      <div className="p-4 border-t border-gray-200">
                        <div className="flex">
                          <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="flex-1 border border-gray-300 rounded-l-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            rows={2}
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 disabled:opacity-50"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="text-5xl mb-4">💬</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
                        <p className="text-gray-500">Select a conversation from the list to start messaging</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default MessagesPage;