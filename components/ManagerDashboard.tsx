import React, { useMemo, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Sale, SaleItem } from '../types';
import StatCard from './ui/StatCard';
import SalesChart from './SalesChart';
import { DollarSignIcon, ShoppingCartIcon, UsersIcon, FileTextIcon, AlertTriangleIcon, TrendingUpIcon } from './ui/Icons';
import ReceiptModal from './ReceiptModal';

const HIGH_VALUE_THRESHOLD = 500;
const LOW_SALES_DAY_THRESHOLD = 100;

const ManagerDashboard: React.FC = () => {
    const { sales, importSales, exportSales } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [productFilter, setProductFilter] = useState('');
    const [staffFilter, setStaffFilter] = useState(''); // will store staffId
    const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<Sale | null>(null);


    const stats = useMemo(() => {
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalSales = sales.length;
        const uniqueStaff = new Set(sales.map(sale => sale.staffId)).size;
        return { totalRevenue, totalSales, uniqueStaff };
    }, [sales]);
    
    const uniqueStaffMembers = useMemo(() => {
        const staffMap = new Map<string, string>();
        sales.forEach(sale => {
            if (!staffMap.has(sale.staffId)) {
                staffMap.set(sale.staffId, sale.staffEmail);
            }
        });
        return Array.from(staffMap, ([id, email]) => ({ id, email }));
    }, [sales]);

    const alerts = useMemo(() => {
        const alerts: Array<{ type: 'high-value' | 'low-activity'; data: any; date: Date }> = [];
        
        // High-value sales alerts
        sales.forEach(sale => {
            if (sale.totalAmount > HIGH_VALUE_THRESHOLD) {
                alerts.push({ type: 'high-value', data: sale, date: new Date(sale.date) });
            }
        });

        // Low sales day alerts
        const salesByDay = sales.reduce((acc, sale) => {
            const day = new Date(sale.date).toISOString().split('T')[0];
            if (!acc[day]) {
                acc[day] = 0;
            }
            acc[day] += sale.totalAmount;
            return acc;
        }, {} as Record<string, number>);

        Object.entries(salesByDay).forEach(([day, total]) => {
            if (total < LOW_SALES_DAY_THRESHOLD) {
                alerts.push({ type: 'low-activity', data: { day, total }, date: new Date(day) });
            }
        });

        return alerts.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [sales]);

    const filteredSales = useMemo(() => {
        return sales.filter(sale => {
            const saleDate = new Date(sale.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            // Adjust start date to the beginning of the day
            if (start) start.setHours(0, 0, 0, 0);

            // Adjust end date to the end of the day for inclusive filtering
            if (end) end.setHours(23, 59, 59, 999);

            if (start && saleDate < start) return false;
            if (end && saleDate > end) return false;
            if (productFilter && !sale.items.some(item => item.productName.toLowerCase().includes(productFilter.toLowerCase()))) return false;
            if (staffFilter && sale.staffId !== staffFilter) return false;
            
            return true;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sales, startDate, endDate, productFilter, staffFilter]);

    const handleExport = () => {
        const csvData = exportSales();
        if (csvData) {
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'sales_data.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("No sales data to export.");
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    const lines = text.split('\n');
                    const headerLine = lines[0].trim();
                    const headers = headerLine.split(',');

                    const rows = lines.slice(1);
                    
                    const importedSales: Sale[] = rows
                        .filter(row => row.trim() !== '')
                        .map(row => {
                            const values = row.split(','); // simple split, assumes no commas in values except quoted items JSON
                            const rowData: { [key: string]: any } = {};
                            
                            // A more robust regex-based CSV parser to handle quoted JSON
                            const regex = /("([^"]|"")*"|[^,]*),/g;
                            let match;
                            let lastIndex = 0;
                            let i = 0;
                            while ((match = regex.exec(row + ',')) && i < headers.length) {
                                let value = match[1];
                                if (value.startsWith('"') && value.endsWith('"')) {
                                    value = value.slice(1, -1).replace(/""/g, '"');
                                }
                                rowData[headers[i]] = value;
                                i++;
                            }

                            const items: SaleItem[] = JSON.parse(rowData.items);

                            return { 
                                id: rowData.id,
                                items,
                                totalAmount: parseFloat(rowData.totalAmount),
                                date: rowData.date,
                                staffId: rowData.staffId,
                                staffEmail: rowData.staffEmail,
                                customerName: rowData.customerName,
                                customerPhone: rowData.customerPhone,
                                paymentMethod: rowData.paymentMethod as 'Cash' | 'Card' | 'Online',
                             };
                        });
                    importSales(importedSales);
                } catch(error) {
                    console.error("Error parsing CSV:", error);
                    alert("Failed to import CSV. Please check the file format.");
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={<DollarSignIcon className="w-8 h-8 text-green-500" />}
                />
                <StatCard
                    title="Total Sales"
                    value={stats.totalSales.toLocaleString()}
                    icon={<ShoppingCartIcon className="w-8 h-8 text-blue-500" />}
                />
                <StatCard
                    title="Active Staff"
                    value={stats.uniqueStaff.toLocaleString()}
                    icon={<UsersIcon className="w-8 h-8 text-purple-500" />}
                />
            </div>

             {/* Alerts */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Alerts & Notifications</h2>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                    {alerts.length > 0 ? (
                        alerts.map((alert, index) => (
                            <div key={index} className={`flex items-start p-3 rounded-lg ${
                                alert.type === 'high-value' 
                                ? 'bg-blue-50 dark:bg-blue-900/30' 
                                : 'bg-yellow-50 dark:bg-yellow-900/30'
                            }`}>
                                {alert.type === 'high-value' ? (
                                    <TrendingUpIcon className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0 mt-1" />
                                ) : (
                                    <AlertTriangleIcon className="w-5 h-5 mr-3 text-yellow-500 flex-shrink-0 mt-1" />
                                )}
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    {alert.type === 'high-value' ? (
                                        <p>
                                            <span className="font-semibold">High-Value Sale:</span> {alert.data.staffEmail} completed a sale for <span className="font-bold">${alert.data.totalAmount.toFixed(2)}</span> on {new Date(alert.data.date).toLocaleDateString()}.
                                        </p>
                                    ) : (
                                        <p>
                                            <span className="font-semibold">Low Sales Day:</span> Total sales on {new Date(alert.data.day).toLocaleDateString(undefined, { timeZone: 'UTC' })} were only <span className="font-bold">${alert.data.total.toFixed(2)}</span>.
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent alerts.</p>
                    )}
                </div>
            </div>


            {/* Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Sales Over Time</h2>
                <div className="h-96">
                    <SalesChart data={sales} />
                </div>
            </div>

            {/* Data Management */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Data Management</h2>
                <div className="flex space-x-4">
                    <button onClick={handleExport} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Export as CSV</button>
                    <button onClick={handleImportClick} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Import from CSV</button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv" />
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Filter Sales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="productFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
                        <input
                            type="text"
                            id="productFilter"
                            value={productFilter}
                            onChange={e => setProductFilter(e.target.value)}
                            placeholder="Filter by product..."
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="staffFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Staff Member</label>
                        <select
                            id="staffFilter"
                            value={staffFilter}
                            onChange={e => setStaffFilter(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">All Staff</option>
                            {uniqueStaffMembers.map(staff => (
                                <option key={staff.id} value={staff.id}>{staff.email}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>


            {/* Sales Table */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                 <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">All Sales Records</h2>
                 <div className="overflow-x-auto relative">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="py-3 px-6">Products</th>
                                <th scope="col" className="py-3 px-6">Total Amount</th>
                                <th scope="col" className="py-3 px-6">Date</th>
                                <th scope="col" className="py-3 px-6">Staff</th>
                                <th scope="col" className="py-3 px-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.map(sale => (
                                <tr key={sale.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {sale.items[0]?.productName}
                                        {sale.items.length > 1 && <span className="text-xs text-gray-500 ml-1">(+{sale.items.length - 1} more)</span>}
                                    </td>
                                    <td className="py-4 px-6">${sale.totalAmount.toFixed(2)}</td>
                                    <td className="py-4 px-6">{new Date(sale.date).toLocaleDateString()}</td>
                                    <td className="py-4 px-6">{sale.staffEmail}</td>
                                    <td className="py-4 px-6">
                                        <button onClick={() => setSelectedSaleForReceipt(sale)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline flex items-center">
                                            <FileTextIcon className="w-4 h-4 mr-1" />
                                            Receipt
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredSales.length === 0 && <p className="text-center py-4">No sales data found for the selected filters.</p>}
                 </div>
            </div>

            {selectedSaleForReceipt && (
                <ReceiptModal 
                    sale={selectedSaleForReceipt} 
                    onClose={() => setSelectedSaleForReceipt(null)} 
                />
            )}
        </div>
    );
};

export default ManagerDashboard;