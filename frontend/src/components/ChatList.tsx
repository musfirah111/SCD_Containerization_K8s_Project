interface ChatContact {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: Date;
    unread: number;
    avatar: string;
}

interface ChatListProps {
    contacts: ChatContact[];
    selectedContact: string | null;
    onSelectContact: (contactId: string) => void;
}

export default function ChatList({ contacts, selectedContact, onSelectContact }: ChatListProps) {
    return (
        <div className="w-80 border-r border-gray-200 h-full overflow-y-auto">
            <div className="p-4 border-b">
                <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="divide-y">
                {contacts.map((contact) => (
                    <div
                        key={contact.id}
                        onClick={() => onSelectContact(contact.id)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedContact === contact.id ? 'bg-blue-50' : ''
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <img
                                src={contact.avatar}
                                alt={contact.name}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                                        {contact.name}
                                    </h3>
                                    <span className="text-xs text-gray-500">
                                        {contact.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                            </div>
                            {contact.unread > 0 && (
                                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                    {contact.unread}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}