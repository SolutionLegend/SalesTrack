import React, { useState } from 'react';
import { Sale } from '../types';

interface ExportModalProps {
    onClose: () => void;
    allSales: Sale[];
    staffMembers: { id: string; email: string; }[];
}

const ExportModal: React.FC<ExportModalProps> = ({ onClose, allSales, staffMembers }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [staffId, setStaffId] = useState('');

    const handleExport = () => {
        const filteredSales = allSales.filter(sale => {
            const saleDate = new Date(sale.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (start) start.setHours(0, 0, 0, 0);
            if (end) end.setHours(23, 59, 59, 999);

            if (start && saleDate < start) return false;
            if (end && saleDate > end) return false;
            if (staffId && sale.staffId !== staffId) return false;
            
            return true;
        });

        if (filteredSales.length === 0) {
            alert('No sales data matches the selected filters.');
            return;
        }

        const header = ['id', 'items', 'totalAmount', 'date', 'staffId', 'staffEmail', 'customerName', 'customerPhone', 'paymentMethod'].join(',');
        const rows = filteredSales.map(sale => {
            const itemsJson = `"${JSON.stringify(sale.items).replace(/"/g, '""')}"`;
            return [sale.id, itemsJson, sale.totalAmount, sale.date, sale.staffId, sale.staffEmail, sale.customerName, sale.customerPhone || '', sale.paymentMethod].join(',');
        });
        const csvContent = [header, ...rows].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'filtered_sales_export.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Export Sales Data</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select filters to export a custom CSV file.</p>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="exportStartDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                        <input type="date" id="exportStartDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                    </div>
                    <div>
                        <label htmlFor="exportEndDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                        <input type="date" id="exportEndDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                    </div>
                    <div>
                        <label htmlFor="exportStaff" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Staff Member</label>
                        <select id="exportStaff" value={staffId} onChange={e => setStaffId(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option value="">All Staff</option>
                            {staffMembers.map(staff => (
                                <option key={staff.id} value={staff.id}>{staff.email}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end space-x-3 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-100 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500">
                        Cancel
                    </button>
                    <button onClick={handleExport} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        Download CSV
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
