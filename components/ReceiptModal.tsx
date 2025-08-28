import React, { useRef } from 'react';
import { Sale } from '../types';
import { ChartBarIcon, PrintIcon } from './ui/Icons';

// Declare external libraries to prevent TypeScript errors
declare const jspdf: any;
declare const html2canvas: any;

interface ReceiptModalProps {
    sale: Sale;
    onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
    const receiptRef = useRef<HTMLDivElement>(null);

    const handleDownloadPdf = () => {
        const input = receiptRef.current;
        if (!input) return;

        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'pt', // Use points for better scaling with canvas
                format: [canvas.width, canvas.height],
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`receipt-${sale.id}.pdf`);
        });
    };
    
    const getReceiptAsText = () => {
        const itemsText = sale.items.map(item => 
            `${item.productName} (Qty: ${item.quantity}) @ $${item.unitPrice.toFixed(2)} each .... $${(item.quantity * item.unitPrice).toFixed(2)}`
        ).join('\n');

        return `
Thank you for your business!

RECEIPT DETAILS
----------------------------------
Receipt ID: ${sale.id}
Date: ${new Date(sale.date).toLocaleString()}
Sold By: ${sale.staffEmail}
Payment Method: ${sale.paymentMethod}

BILL TO
----------------------------------
${sale.customerName}
${sale.customerPhone || ''}

SALE SUMMARY
----------------------------------
${itemsText}
----------------------------------
Subtotal: $${sale.totalAmount.toFixed(2)}
Discount: $0.00
Tax: $0.00
TOTAL: $${sale.totalAmount.toFixed(2)}
----------------------------------
SalesTrack - Your reliable sales partner.
        `;
    }


    const handleEmailReceipt = () => {
        const subject = `Your receipt for sale #${sale.id}`;
        const body = getReceiptAsText();
        window.location.href = `mailto:${sale.customerName}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.trim())}`;
    };
    
    const handlePrint = () => {
        const node = receiptRef.current;
        if (!node) return;

        const style = document.createElement('style');
        style.innerHTML = `
            @media print {
              body * {
                visibility: hidden;
              }
              .receipt-print-area, .receipt-print-area * {
                visibility: visible;
              }
              .receipt-print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
              }
              .no-print {
                  display: none !important;
              }
            }
        `;
        document.head.appendChild(style);
        node.classList.add('receipt-print-area');

        window.print();

        document.head.removeChild(style);
        node.classList.remove('receipt-print-area');
    };


    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="max-h-[85vh] overflow-y-auto">
                    <div ref={receiptRef} className="p-6 sm:p-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200">
                        {/* Header */}
                        <div className="flex justify-between items-start pb-4 border-b dark:border-gray-700">
                            <div className="flex items-center space-x-3">
                                <ChartBarIcon className="h-10 w-10 text-blue-500" />
                                <div>
                                    <h1 className="text-2xl font-bold">SalesTrack</h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Your Trusted Sales Partner</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-2xl font-semibold uppercase text-gray-500 dark:text-gray-400">Receipt</h2>
                                <p className="text-sm"># {sale.id.replace('sale-','')}</p>
                            </div>
                        </div>

                        {/* Bill To & Details */}
                        <div className="flex flex-col md:flex-row justify-between mt-8">
                             <div>
                                <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">Bill To</h3>
                                <p className="font-medium text-lg">{sale.customerName}</p>
                                {sale.customerPhone && <p className="text-sm text-gray-600 dark:text-gray-300">{sale.customerPhone}</p>}
                            </div>
                            <div className="mt-4 md:mt-0 md:text-right text-sm">
                                <div className="space-y-1">
                                    <p><span className="font-semibold text-gray-600 dark:text-gray-400">Date: </span>{new Date(sale.date).toLocaleDateString()}</p>
                                    <p><span className="font-semibold text-gray-600 dark:text-gray-400">Time: </span>{new Date(sale.date).toLocaleTimeString()}</p>
                                    <p><span className="font-semibold text-gray-600 dark:text-gray-400">Sold By: </span>{sale.staffEmail}</p>
                                    <p><span className="font-semibold text-gray-600 dark:text-gray-400">Payment: </span><span className="font-medium">{sale.paymentMethod}</span></p>
                                </div>
                            </div>
                        </div>


                        {/* Sales Table */}
                        <div className="mt-8 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b-2 border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="p-3 text-sm font-semibold uppercase">Item</th>
                                        <th className="p-3 text-sm font-semibold uppercase text-center">Qty</th>
                                        <th className="p-3 text-sm font-semibold uppercase text-right">Unit Price</th>
                                        <th className="p-3 text-sm font-semibold uppercase text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sale.items.map((item, index) => (
                                        <tr key={index} className="border-b dark:border-gray-700">
                                            <td className="p-3 font-medium">{item.productName}</td>
                                            <td className="p-3 text-center">{item.quantity}</td>
                                            <td className="p-3 text-right">${item.unitPrice.toFixed(2)}</td>
                                            <td className="p-3 text-right font-medium">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end mt-8">
                            <div className="w-full max-w-sm text-gray-700 dark:text-gray-300">
                                <div className="flex justify-between py-2">
                                    <span>Subtotal</span>
                                    <span>${sale.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span>Discount</span>
                                    <span>$0.00</span>
                                </div>
                                <div className="flex justify-between py-2 border-b dark:border-gray-700">
                                    <span>Tax (0%)</span>
                                    <span>$0.00</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 -mx-3 px-3 rounded-md">
                                    <span>Total</span>
                                    <span>${sale.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center mt-10 pt-4 border-t dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Thank you for your business!</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end space-x-3 rounded-b-lg no-print">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-100 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500">
                        Close
                    </button>
                    <button onClick={handlePrint} className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600 flex items-center">
                       <PrintIcon className="w-4 h-4 mr-2" /> Print
                    </button>
                    <button onClick={handleEmailReceipt} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                        Email Receipt
                    </button>
                    <button onClick={handleDownloadPdf} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;