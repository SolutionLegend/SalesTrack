import React, { useState, useMemo, FormEvent, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import ReceiptModal from './ReceiptModal';
import { Sale, SaleItem } from '../types';
import { FileTextIcon } from './ui/Icons';

const StaffDashboard: React.FC = () => {
    const { currentUser, sales, addSale } = useAppContext();
    const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<Sale | null>(null);

    // State for current sale items
    const [items, setItems] = useState<SaleItem[]>([]);
    
    // State for customer details
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Online'>('Card');

    // State for the item entry form
    const [productName, setProductName] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [unitPrice, setUnitPrice] = useState('');
    const productNameInputRef = useRef<HTMLInputElement>(null);

    const mySales = useMemo(() => {
        return sales
            .filter(sale => sale.staffId === currentUser?.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sales, currentUser]);
    
    const currentSaleTotal = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    }, [items]);

    const handleAddItem = (e: FormEvent) => {
        e.preventDefault();
        const qty = parseInt(quantity, 10);
        const price = parseFloat(unitPrice);

        if (productName.trim() && !isNaN(qty) && qty > 0 && !isNaN(price) && price >= 0) {
            setItems([...items, { productName, quantity: qty, unitPrice: price }]);
            // Reset form for next item
            setProductName('');
            setQuantity('1');
            setUnitPrice('');
            productNameInputRef.current?.focus();
        } else {
            alert('Please enter a valid product name, quantity, and price.');
        }
    };
    
    const handleRemoveItem = (indexToRemove: number) => {
        setItems(items.filter((_, index) => index !== indexToRemove));
    };

    const handleLogSale = () => {
        if (items.length === 0) {
            alert('Please add at least one item to the sale.');
            return;
        }
        if (!customerName.trim()) {
            alert('Please enter a customer name.');
            return;
        }
        addSale(items, customerName, customerPhone, paymentMethod);
        setItems([]);
        setCustomerName('');
        setCustomerPhone('');
        setPaymentMethod('Card');
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sales Entry Form */}
            <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Log a New Sale</h2>
                    
                    {/* Item Entry Form */}
                    <form onSubmit={handleAddItem} className="space-y-4 border-b dark:border-gray-700 pb-4 mb-4">
                         <fieldset className="space-y-4">
                            <legend className="text-lg font-medium text-gray-900 dark:text-white mb-2">Item Details</legend>
                            <div>
                                <label htmlFor="productName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Product Name</label>
                                <input
                                    type="text"
                                    id="productName"
                                    ref={productNameInputRef}
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="e.g. Pro Software License"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="quantity" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Quantity</label>
                                    <input
                                        type="number"
                                        id="quantity"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="1"
                                        min="1"
                                        step="1"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="unitPrice" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Unit Price ($)</label>
                                    <input
                                        type="number"
                                        id="unitPrice"
                                        value={unitPrice}
                                        onChange={(e) => setUnitPrice(e.target.value)}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="499.99"
                                        min="0.00"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                             <button type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add Item</button>
                        </fieldset>
                    </form>

                    {/* Current Sale Items */}
                    <div className="space-y-2 my-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Current Sale</h3>
                        {items.length > 0 ? (
                            <ul className="divide-y dark:divide-gray-700">
                                {items.map((item, index) => (
                                    <li key={index} className="py-2 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{item.productName}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.quantity} x ${item.unitPrice.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <p className="font-semibold text-gray-900 dark:text-white mr-4">${(item.quantity * item.unitPrice).toFixed(2)}</p>
                                            <button onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700">&times;</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No items added yet.</p>
                        )}
                        {items.length > 0 && (
                            <div className="pt-2 border-t dark:border-gray-700 flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                                <span>Total</span>
                                <span>${currentSaleTotal.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    {/* Customer Details & Checkout */}
                    {items.length > 0 && (
                        <div className="space-y-4 border-t dark:border-gray-700 pt-4">
                            <fieldset className="space-y-4">
                                <legend className="text-lg font-medium text-gray-900 dark:text-white mb-2">Customer & Payment</legend>
                                <div>
                                    <label htmlFor="customerName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Customer Name</label>
                                    <input
                                        type="text"
                                        id="customerName"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="customerPhone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Customer Phone (Optional)</label>
                                    <input
                                        type="tel"
                                        id="customerPhone"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="555-123-4567"
                                    />
                                </div>
                                 <div>
                                    <label htmlFor="paymentMethod" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Payment Method</label>
                                    <select
                                        id="paymentMethod"
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value as 'Cash' | 'Card' | 'Online')}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    >
                                        <option>Card</option>
                                        <option>Cash</option>
                                        <option>Online</option>
                                    </select>
                                </div>
                            </fieldset>
                             <button onClick={handleLogSale} className="w-full text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
                                Log Sale (${currentSaleTotal.toFixed(2)})
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* My Sales History */}
            <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">My Sales History</h2>
                     <div className="overflow-x-auto relative max-h-[calc(100vh-250px)]">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                <tr>
                                    <th scope="col" className="py-3 px-6">Products</th>
                                    <th scope="col" className="py-3 px-6">Amount</th>
                                    <th scope="col" className="py-3 px-6">Date</th>
                                    <th scope="col" className="py-3 px-6">Customer</th>
                                    <th scope="col" className="py-3 px-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mySales.map(sale => (
                                    <tr key={sale.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {sale.items[0]?.productName}
                                            {sale.items.length > 1 && <span className="text-xs text-gray-500 ml-1">(+{sale.items.length - 1} more)</span>}
                                        </td>
                                        <td className="py-4 px-6">${sale.totalAmount.toFixed(2)}</td>
                                        <td className="py-4 px-6">{new Date(sale.date).toLocaleDateString()}</td>
                                        <td className="py-4 px-6">{sale.customerName}</td>
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
                        {mySales.length === 0 && <p className="text-center py-4">You haven't logged any sales yet.</p>}
                    </div>
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

export default StaffDashboard;
