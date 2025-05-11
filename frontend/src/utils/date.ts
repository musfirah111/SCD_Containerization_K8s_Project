import { format, isWeekend } from 'date-fns';

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.error('Invalid date:', dateString);
    return 'Invalid date';
  }
  return format(date, 'MMMM d, yyyy');
}

export const getAvailableSlots = (workingHours: string, date: string): string[] => {
  const [start, end] = workingHours.split('-');
  // Generate slots between start and end time
  // Example: "9AM-5PM" -> ["9:00 AM", "9:30 AM", ...]
  return generateTimeSlots(start, end);
};

function generateTimeSlots(start: string, end: string): string[] {
  const slots: string[] = [];
  const startTime = convertTo24Hour(start);
  const endTime = convertTo24Hour(end);
  
  let currentTime = startTime;
  while (currentTime < endTime) {
    slots.push(formatTime(currentTime));
    currentTime.setMinutes(currentTime.getMinutes() + 30);
  }
  
  return slots;
}

function convertTo24Hour(timeStr: string): Date {
  const today = new Date();
  const time = timeStr.match(/(\d+)([AP]M)/);
  if (!time) return today;
  
  let [_, hours, meridiem] = time;
  let hour = parseInt(hours);
  
  if (meridiem === 'PM' && hour !== 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;
  
  today.setHours(hour, 0, 0, 0);
  return today;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true 
  });
}