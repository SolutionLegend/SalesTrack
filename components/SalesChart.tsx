
import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Sale } from '../types';

interface SalesChartProps {
    data: Sale[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
    const chartData = useMemo(() => {
        const monthlySales: { [key: string]: number } = {};
        
        data.forEach(sale => {
            const month = new Date(sale.date).toLocaleString('default', { month: 'short', year: 'numeric' });
            if (!monthlySales[month]) {
                monthlySales[month] = 0;
            }
            monthlySales[month] += sale.totalAmount;
        });

        // Sort data by date
        const sortedMonths = Object.keys(monthlySales).sort((a, b) => {
            return new Date(a).getTime() - new Date(b).getTime();
        });

        return sortedMonths.map(month => ({
            name: month,
            Revenue: monthlySales[month]
        }));
    }, [data]);

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                No sales data to display.
            </div>
        );
    }
    
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#374151',
                        border: 'none',
                        borderRadius: '0.5rem'
                    }}
                    labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Bar dataKey="Revenue" fill="#3b82f6" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default SalesChart;