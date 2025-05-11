import { useState } from 'react';
import { Send } from 'lucide-react';
import ChatList from '../../components/doctor/ChatList';
import ChatMessage from '../../components/doctor/ChatMessage';
import { Layout } from '../../components/doctor/Layout';

const mockContacts = [
  {
    id: '1',
    name: 'John Doe',
    lastMessage: 'Thank you for the prescription, doctor',
    timestamp: new Date(),
    unread: 2,
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    lastMessage: 'When should I take the medication?',
    timestamp: new Date(),
    unread: 1,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  },
];

const mockMessages = [
  {
    id: '1',
    content: 'Good morning Dr. Smith, I\'ve been experiencing some side effects.',
    sender: 'John Doe',
    timestamp: new Date(Date.now() - 3600000),
    isDoctor: false,
  },
  {
    id: '2',
    content: 'Hello John, can you please describe the side effects you\'re experiencing?',
    sender: 'Dr. Smith',
    timestamp: new Date(Date.now() - 3300000),
    isDoctor: true,
  },
];

export default function Chat() {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Here you would typically send the message to your backend
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-2rem)] bg-[#D2EBE7] p-4">
        <div className="flex w-full bg-white rounded-lg shadow-lg overflow-hidden">
          <ChatList
            contacts={mockContacts}
            selectedContact={selectedContact}
            onSelectContact={setSelectedContact}
          />

          {selectedContact ? (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">
                  {mockContacts.find(c => c.id === selectedContact)?.name}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {mockMessages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}