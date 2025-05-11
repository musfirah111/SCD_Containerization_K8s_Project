import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Mock data for Patient Overview
const mockPieData = [
  {
    name: 'Cardiology',
    percentage: 30,
    patients: 300,
    color: '#129820'
  },
  {
    name: 'Neurology',
    percentage: 25,
    patients: 250,
    color: '#7BC1B7'
  },
  {
    name: 'Orthopedics',
    percentage: 20,
    patients: 200,
    color: '#F89603'
  },
  {
    name: 'Pediatrics',
    percentage: 15,
    patients: 150,
    color: '#0B8FAC'
  },
  {
    name: 'Others',
    percentage: 10,
    patients: 100,
    color: '#F30000'
  }
];

// Mock data for Department Patient Distribution
const mockBarData = [
  { department: 'Cardiology', value: 300 },
  { department: 'Neurology', value: 250 },
  { department: 'Orthopedics', value: 200 },
  { department: 'Pediatrics', value: 150 },
  { department: 'Oncology', value: 180 },
  { department: 'Dermatology', value: 120 },
  { department: 'Others', value: 100 }
];

interface DepartmentChartProps {
  className?: string;
}

export function DepartmentChart({ className = '' }: DepartmentChartProps) {
  const [employeeData, setEmployeeData] = useState(mockBarData);
  const [loading, setLoading] = useState(false);

  const total = mockPieData.reduce((sum, item) => sum + item.patients, 0);

  return (
    <div className="space-y-4">
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-lg font-semibold">Patient Overview</h2>
            <p className="text-sm text-gray-500">by Departments</p>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div className="relative w-[120px] h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="95%"
                  paddingAngle={2}
                  dataKey="patients"
                >
                  {mockPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 pl-6 space-y-2">
            {mockPieData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-sm font-medium">
                  {total > 0 ? Math.round((item.patients / total) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Department Patient Distribution</h2>
        </div>

        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={employeeData} barSize={25}>
              <XAxis
                dataKey="department"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [`${value} patients`, 'Count']}
                labelStyle={{ color: '#666' }}
              />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
              >
                {employeeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index % 2 === 0 ? '#129820' : '#7BC1B7'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Calendar</h2>
        </div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            defaultValue={dayjs()}
            sx={{
              width: '320px',
              height: '260px',
              '& .MuiPickersCalendarHeader-root': {
                paddingTop: '4px',
                paddingBottom: '4px',
                minHeight: '32px',
              },
              '& .MuiDayCalendar-header': {
                paddingTop: '4px',
              },
              '& .MuiDayCalendar-monthContainer': {
                minHeight: '180px',
              },
              '& .MuiPickersDay-root': {
                width: '32px',
                height: '32px',
                fontSize: '0.875rem',
                margin: '2px',
                '&.Mui-selected': {
                  backgroundColor: '#129820',
                  '&:hover': {
                    backgroundColor: '#7BC1B7',
                  },
                },
                '&:hover': {
                  backgroundColor: '#7BC1B7',
                },
              },
              '& .MuiDayCalendar-weekDayLabel': {
                color: '#666',
                width: '32px',
                height: '32px',
                fontSize: '0.875rem',
              },
              '& .MuiPickersDay-dayOutsideMonth': {
                color: '#666',
              },
            }}
          />
        </LocalizationProvider>
      </div>
    </div>
  );
}