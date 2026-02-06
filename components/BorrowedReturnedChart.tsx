'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChevronDown } from 'lucide-react';

interface ChartDataPoint {
  name: string;
  borrowed: number;
  returned: number;
}

interface BorrowedReturnedChartProps {
  graphData?: ChartDataPoint[];
}

const defaultData = [
  { name: 'Monday', borrowed: 30, returned: 24 },
  { name: 'Tuesday', borrowed: 20, returned: 7 },
  { name: 'Wednesday', borrowed: 9, returned: 1 },
  { name: 'Thursday', borrowed: 35, returned: 33 },
  { name: 'Friday', borrowed: 16, returned: 10 },
  { name: 'Saturday', borrowed: 31, returned: 4 },
  { name: 'Sunday', borrowed: 35, returned: 14 },
];

export default function BorrowedReturnedChart({ graphData }: BorrowedReturnedChartProps) {
  // Transform graphData to match chart format if provided
  const chartData = graphData && graphData.length > 0 
    ? graphData.map(item => ({
        name: item.name,
        Borrowed: item.borrowed,
        Returned: item.returned,
      }))
    : defaultData;

  return (
    <div className="bg-white rounded-2xl p-4 md:p-8 border border-gray-200 shadow-sm w-full min-w-0 overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-8 gap-3 md:gap-4">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="text-lg md:text-2xl shrink-0">📊</div>
          <h3 className="text-sm md:text-lg font-bold text-gray-900 truncate">Borrowed & Returned books</h3>
        </div>
        <button className="bg-slate-900 text-white px-4 md:px-8 py-2 rounded-[5px] text-xs md:text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 shrink-0">
          weekly
          <ChevronDown className="h-3 md:h-4 w-3 md:w-4" />
        </button>
      </div>

      <div className="w-full min-w-0 overflow-hidden">
        <ResponsiveContainer width="100%" height={250} minHeight={200}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="0" stroke="#f0f0f0" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '15px', paddingLeft: '0', fontSize: '12px' }}
              iconType="square"
              align="left"
            />
            <Bar dataKey="Borrowed" fill="#001240" />
            <Bar dataKey="Returned" fill="#00378B" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
