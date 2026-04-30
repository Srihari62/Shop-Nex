"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { Package, ChevronRight, Clock, CheckCircle2, Truck, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const MyOrders = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/get-user-orders");
      return res.data;
    },
  });

  const orders = data?.orders || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-1/4 mb-4" />
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-slate-100">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={36} className="text-slate-300" />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">No orders yet</h3>
        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">Time to start shopping!</p>
        <Link 
          href="/products" 
          className="mt-8 px-8 py-3.5 bg-[#47718F] text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[#365870] transition-all"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const statusSteps = ["Ordered", "Packed", "Shipped", "Out for Delivery", "Delivered"];

  const getStatusIndex = (status: string) => {
    const idx = statusSteps.indexOf(status);
    return idx !== -1 ? idx : 0;
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered": return <CheckCircle2 size={16} className="text-emerald-500" />;
      case "shipped": return <Truck size={16} className="text-blue-500" />;
      case "processing": return <Clock size={16} className="text-orange-500" />;
      default: return <Package size={16} className="text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "shipped": return "bg-blue-50 text-blue-600 border-blue-100";
      case "processing": return "bg-orange-50 text-orange-600 border-orange-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const generateInvoice = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = order.items.map((item: any) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 16px 10px; font-size: 13px; color: #1e293b;">
          <div style="font-weight: 700; margin-bottom: 4px;">${item.product?.title || 'Product'}</div>
          <div style="font-size: 11px; color: #64748b;">Seller: ${order.shops?.name || 'Marketplace'}</div>
        </td>
        <td style="padding: 16px 10px; font-size: 13px; color: #1e293b; text-align: center;">$${item.price.toFixed(2)}</td>
        <td style="padding: 16px 10px; font-size: 13px; color: #1e293b; text-align: center;">${item.quantity}</td>
        <td style="padding: 16px 10px; font-size: 13px; font-weight: 700; color: #1e293b; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const itemsSubtotal = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    printWindow.document.write(`
      <html>
        <head>
          <title>Tax Invoice - ${order.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; -webkit-print-color-adjust: exact; }
            .invoice-card { max-width: 900px; margin: auto; }
            .top-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 4px solid #47718F; padding-bottom: 20px; }
            .logo { font-size: 28px; font-weight: 900; color: #47718F; letter-spacing: -1px; }
            .header-info { text-align: right; }
            .header-info h1 { margin: 0; font-size: 24px; font-weight: 900; color: #1e293b; }
            
            .address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .address-box h3 { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
            .address-box p { margin: 0; font-size: 13px; font-weight: 500; color: #334155; }
            
            .order-meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; background: #f8fafc; padding: 20px; rounded-xl; margin-bottom: 30px; border: 1px solid #e2e8f0; border-radius: 12px; }
            .meta-item h4 { margin: 0; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; }
            .meta-item p { margin: 0; font-size: 13px; font-weight: 700; color: #1e293b; }

            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f1f5f9; padding: 12px 10px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; }
            
            .summary-section { display: flex; justify-content: flex-end; }
            .summary-table { width: 300px; }
            .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #475569; }
            .summary-row.total { border-top: 2px solid #47718F; margin-top: 10px; padding-top: 15px; font-weight: 900; color: #1e293b; font-size: 18px; }
            
            .footer { margin-top: 100px; border-top: 1px solid #e2e8f0; padding-top: 30px; text-align: center; }
            .footer p { font-size: 11px; color: #94a3b8; margin-bottom: 20px; }
            .stamp { display: inline-block; border: 3px solid #10b981; color: #10b981; padding: 8px 20px; font-size: 16px; font-weight: 900; border-radius: 8px; transform: rotate(-5deg); text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="invoice-card">
            <div class="top-bar">
              <div class="logo">ESHOP.COM</div>
              <div class="header-info">
                <h1>TAX INVOICE</h1>
                <p style="font-size: 12px; font-weight: 600; color: #64748b; margin-top: 4px;">Original for Buyer</p>
              </div>
            </div>

            <div class="address-grid">
              <div class="address-box">
                <h3>Sold By</h3>
                <p style="font-weight: 800; font-size: 15px; margin-bottom: 4px;">${order.shops?.name || 'Authorized Seller'}</p>
                <p>Eshop Marketplace Hub</p>
                <p>GSTIN: 29AAACH9999Z1Z</p>
                <p>Contact: +91 99999 00000</p>
              </div>
              <div class="address-box">
                <h3>Shipping & Billing Address</h3>
                <p style="font-weight: 800; font-size: 15px; margin-bottom: 4px;">${order.shippingAddress?.name || order.users?.name || 'Customer'}</p>
                <p>${order.shippingAddress?.street || 'N/A'}</p>
                <p>${order.shippingAddress?.city || ''}, ${order.shippingAddress?.zip || ''}</p>
                <p>Contact: ${order.users?.email || 'N/A'}</p>
              </div>
            </div>

            <div class="order-meta">
              <div class="meta-item">
                <h4>Order ID</h4>
                <p>#${order.id.slice(-12).toUpperCase()}</p>
              </div>
              <div class="meta-item">
                <h4>Order Date</h4>
                <p>${new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div class="meta-item">
                <h4>Invoice No.</h4>
                <p>INV-${Math.floor(Math.random() * 1000000)}</p>
              </div>
              <div class="meta-item">
                <h4>Payment Method</h4>
                <p>${order.paymentMethod}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 45%">Description</th>
                  <th style="text-align: center">Unit Price</th>
                  <th style="text-align: center">Qty</th>
                  <th style="text-align: right">Amount</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <div class="summary-section">
              <div class="summary-table">
                <div class="summary-row">
                  <span>Items Subtotal</span>
                  <span>$${itemsSubtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                  <span>Shipping Charges</span>
                  <span>$15.00</span>
                </div>
                ${order.couponCode ? `
                <div class="summary-row" style="color: #10b981; font-weight: 600;">
                  <span>Discount Applied (${order.couponCode})</span>
                  <span>-$${Number(order.discountAmount || 0).toFixed(2)}</span>
                </div>` : ''}
                <div class="summary-row total">
                  <span>Grand Total</span>
                  <span style="color: #47718F;">$${order.total.toFixed(2)}</span>
                </div>
                <div style="font-size: 10px; color: #94a3b8; text-align: right; margin-top: 8px;">
                  Amount inclusive of all applicable taxes
                </div>
              </div>
            </div>

            <div class="footer">
              <div class="stamp">PAID & VERIFIED</div>
              <p style="margin-top: 30px;">This is a computer generated invoice and does not require a physical signature.</p>
              <p>For any queries, please visit eshop.com/support or call 1800-ESHOP-HELP</p>
            </div>
          </div>
          
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => { window.close(); }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Order History</h2>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{orders.length} total orders</span>
      </div>

      <div className="max-h-[750px] overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid gap-8 pb-10">
          {orders.map((order: any) => {
            const currentStatus = order.deliveryStatus || "Ordered";
            const currentStepIdx = getStatusIndex(currentStatus);
            const isDelivered = currentStatus === "Delivered";

            return (
              <div 
                key={order.id} 
                className="group bg-white rounded-[32px] border border-slate-100 hover:border-[#47718F]/30 hover:shadow-xl hover:shadow-[#47718F]/5 transition-all overflow-hidden"
              >
                {/* Order Header */}
                <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order Date</p>
                      <p className="text-sm font-bold text-slate-700">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order ID</p>
                      <p className="text-sm font-bold text-slate-700">#{order.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-sm font-black text-[#47718F]">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusColor(currentStatus)}`}>
                    {getStatusIcon(currentStatus)}
                    {currentStatus}
                  </div>
                </div>

                {/* Status Tracker */}
                <div className="px-8 py-8 border-b border-slate-50">
                   <div className="relative flex justify-between">
                      <div className="absolute top-3 left-0 w-full h-0.5 bg-slate-100" />
                      <div 
                        className="absolute top-3 left-0 h-0.5 bg-[#47718F] transition-all duration-1000" 
                        style={{ 
                          width: isDelivered 
                            ? "100%" 
                            : `${((currentStepIdx + 0.5) / (statusSteps.length - 1)) * 100}%` 
                        }}
                      />
                      
                      {statusSteps.map((step, idx) => {
                        const isActive = idx <= currentStepIdx;
                        return (
                          <div key={step} className="relative z-10 flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full border-4 ${
                              isActive ? "bg-[#47718F] border-[#47718F]" : "bg-white border-slate-100"
                            } transition-colors duration-500`} />
                            <p className={`text-[9px] font-black uppercase tracking-tighter mt-2 text-center max-w-[60px] ${
                              isActive ? "text-[#47718F]" : "text-slate-300"
                            }`}>
                              {step}
                            </p>
                          </div>
                        );
                      })}
                   </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-4 group/item">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                          <Image 
                            src={item.product?.images?.[0]?.url || "https://via.placeholder.com/150"} 
                            alt={item.product?.title || "Product"}
                            fill
                            className="object-cover group-hover/item:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                          <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover/item:text-[#47718F] transition-colors">
                            {item.product?.title || "Product details unavailable"}
                          </h4>
                          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                            Qty: {item.quantity} · Price: ${item.price.toFixed(2)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              Seller: {order.shops?.name || "Marketplace"}
                            </span>
                          </div>
                        </div>
                        <Link 
                          href={`/product/${item.product?.slug || "#"}`}
                          className="self-center p-2 text-slate-300 hover:text-[#47718F] hover:bg-[#47718F]/5 rounded-xl transition-all"
                        >
                          <ChevronRight size={20} />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Order Footer */}
                <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-400">
                    Payment Method: <span className="text-slate-600 font-bold">{order.paymentMethod}</span>
                  </p>
                  
                  {isDelivered ? (
                    <button 
                      className="text-[10px] font-black text-[#47718F] uppercase tracking-widest hover:bg-[#47718F] hover:text-white px-4 py-2 rounded-xl border border-[#47718F]/20 transition-all flex items-center gap-2"
                      onClick={() => generateInvoice(order)}
                    >
                      Download Invoice
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 group/tip relative">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest cursor-not-allowed">
                        Download Invoice
                      </span>
                      <div className="hidden group-hover/tip:block absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-800 text-white text-[9px] font-bold rounded-lg whitespace-nowrap">
                        Complete order to download invoice
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
