import { format, addDays, isSameDay } from 'date-fns';

interface DaySelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}

export function DaySelector({ selectedDate, onDateChange, className }: DaySelectorProps) {
  // Get current date at the start of the day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate array of 7 days starting from today
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <button
        onClick={() => onDateChange(addDays(selectedDate, -1))}
        className="text-gray-400 hover:text-gray-600"
      >
        <span className="sr-only">Previous</span>
      </button>

      <div className="flex-1 grid grid-cols-7 gap-2">
        {days.map((day) => (
          <button
            key={day.toISOString()}
            onClick={() => onDateChange(day)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isSameDay(day, selectedDate)
              ? 'bg-[#0B8FAC] text-white'
              : 'hover:bg-gray-100'
              }`}
          >
            <span className="text-xs font-medium">
              {format(day, 'EEE')}
            </span>
            <span className="text-lg font-semibold">
              {format(day, 'd')}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={() => onDateChange(addDays(selectedDate, 1))}
        className="text-gray-400 hover:text-gray-600"
      >
        <span className="sr-only">Next</span>
      </button>
    </div>
  );
}