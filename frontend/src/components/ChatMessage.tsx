import { format } from 'date-fns';

interface ChatMessageProps {
    message: {
        id: string;
        content: string;
        sender: string;
        timestamp: Date;
        isDoctor: boolean;
    };
}

export default function ChatMessage({ message }: ChatMessageProps) {
    const isDoctor = message.isDoctor;

    return (
        <div
            className={`flex ${isDoctor ? 'justify-start' : 'justify-end'} mb-4`}
        >
            <div
                className={`max-w-[70%] ${isDoctor
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-blue-600 text-white'
                    } rounded-lg px-4 py-2`}
            >
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{message.sender}</span>
                    <span className="text-xs opacity-75">
                        {format(message.timestamp, 'HH:mm')}
                    </span>
                </div>
                <p className="text-sm">{message.content}</p>
            </div>
        </div>
    );
}