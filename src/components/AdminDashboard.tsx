import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingBag, Users, Clock, CheckCircle2, Package, TrendingUp, X, Download, FileText, Calendar, Wrench, XCircle, CheckCircle, ShieldCheck, Activity } from 'lucide-react';
import { Page, Reservation, InventoryItem, Student, AuditLog } from '../types';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface AdminDashboardProps {
  setPage: (page: Page) => void;
  reservations: Reservation[];
  inventory: InventoryItem[];
  students: Student[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setPage, reservations, inventory, students }) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState('Monthly Reservation Summary');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterAdmin, setFilterAdmin] = useState('');
  const [filterItemType, setFilterItemType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('/api/admin/audit-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data);
      }
    } catch (error) {
      console.error("Fetch audit logs error:", error);
    }
  };

  const stats = [
    { label: 'Total Reservations', value: reservations.length.toLocaleString(), icon: <ShoppingBag className="text-blue-500" />, trend: 'Live' },
    { label: 'Pending Approval', value: reservations.filter(r => r.status === 'Pending').length.toLocaleString(), icon: <Clock className="text-amber-500" />, trend: 'Live' },
    { label: 'Approved', value: reservations.filter(r => r.status === 'Approved').length.toLocaleString(), icon: <CheckCircle className="text-emerald-500" />, trend: 'Live' },
    { label: 'Ready for Pickup', value: reservations.filter(r => r.status === 'Ready for Pickup').length.toLocaleString(), icon: <Package className="text-indigo-500" />, trend: 'Live' },
    { label: 'Picked Up Items', value: reservations.filter(r => r.status === 'Picked Up').length.toLocaleString(), icon: <CheckCircle2 className="text-blue-600" />, trend: 'Live' },
    { label: 'System Audits', value: auditLogs.length.toLocaleString(), icon: <ShieldCheck className="text-purple-500" />, trend: 'Live' },
  ];

  const recentActivities = reservations
    .sort((a, b) => new Date(b.dateReserved).getTime() - new Date(a.dateReserved).getTime())
    .slice(0, 5)
    .map(r => ({
      id: r.id,
      student: r.studentName,
      item: `${r.itemName} (${formatShortSize(r.size)})`,
      status: r.status,
      time: `${new Date(r.dateReserved).toLocaleDateString()} ${new Date(r.dateReserved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
    }));

  const recentAudits = auditLogs.slice(0, 2);

  function formatShortSize(size: string | null | undefined): string {
    if (!size) return 'N/A';
    switch (size) {
      case 'S': return 'Small';
      case 'M': return 'Medium';
      case 'L': return 'Large';
      default: return size;
    }
  }

  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    try {
      const timestamp = new Date().toLocaleString();
      const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
      const primaryColor: [number, number, number] = [56, 87, 35]; // #385723
      const secondaryColor: [number, number, number] = [100, 100, 100];
      const accentColor: [number, number, number] = [245, 247, 242];
      const errorColor: [number, number, number] = [200, 0, 0];

      if (reportType === 'Monthly Reservation Summary') {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const primaryColor: [number, number, number] = [56, 87, 35]; // #385723
        const secondaryColor: [number, number, number] = [100, 100, 100];
        const accentColor: [number, number, number] = [245, 247, 242];

        // --- Header Section ---
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, pageWidth, 45, 'F');
        
        doc.setFontSize(26);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold text');
        doc.text('EduReserve', 14, 22);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('School Reservation Management System', 14, 29);
        doc.text('Asia Technological School of Science and Arts', 14, 34);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('RESERVATION SUMMARY REPORT', pageWidth - 14, 22, { align: 'right' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Period: ${startDate && endDate ? `${startDate} to ${endDate}` : currentMonth}`, pageWidth - 14, 29, { align: 'right' });
        doc.text(`Doc ID: RES-SUM-${new Date().getTime().toString().slice(-6)}`, pageWidth - 14, 34, { align: 'right' });

        // --- Document Info Grid ---
        doc.setTextColor(0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('PREPARED BY', 14, 55);
        doc.text('GENERATED AT', 80, 55);
        doc.text('STATUS', 160, 55);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80);
        doc.text('System Administrator', 14, 61);
        doc.text(timestamp, 80, 61);
        doc.text('OFFICIAL DOCUMENT', 160, 61);

        // --- Metrics Row ---
        // Filtering
        let filteredRes = reservations;
        if (startDate) filteredRes = filteredRes.filter(r => new Date(r.dateReserved) >= new Date(startDate));
        if (endDate) filteredRes = filteredRes.filter(r => new Date(r.dateReserved) <= new Date(endDate));
        if (filterItemType !== 'All') filteredRes = filteredRes.filter(r => r.itemName.includes(filterItemType));
        if (filterStatus !== 'All') filteredRes = filteredRes.filter(r => r.status === filterStatus);

        const totalItemsReserved = filteredRes.reduce((acc, r) => acc + r.quantity, 0);
        const completedRes = filteredRes.filter(r => r.status === 'Picked Up').length;
        const totalVolume = filteredRes.length;
        const completionPercentage = totalVolume > 0 ? ((completedRes / totalVolume) * 100).toFixed(1) : '0';

        doc.setDrawColor(230);
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.roundedRect(14, 70, 182, 30, 2, 2, 'FD');

        // Metric 1
        doc.setFontSize(8);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL VOLUME', 25, 80);
        doc.setFontSize(16);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(totalVolume.toString(), 25, 90);

        // Metric 2
        doc.setFontSize(8);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text('ITEMS RESERVED', 70, 80);
        doc.setFontSize(16);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(totalItemsReserved.toString(), 70, 90);

        // Metric 3
        doc.setFontSize(8);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text('COMPLETION RATE', 115, 80);
        doc.setFontSize(16);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(`${completionPercentage}%`, 115, 90);

        // Metric 4
        doc.setFontSize(8);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text('UNIT COUNT', 160, 80);
        doc.setFontSize(16);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(completedRes.toString(), 160, 90);

        // --- Analysis Sub-section ---
        const itemCounts: any = {};
        const sizeCounts: any = {};
        filteredRes.forEach(r => {
          itemCounts[r.itemName] = (itemCounts[r.itemName] || 0) + r.quantity;
          if (r.size) sizeCounts[r.size] = (sizeCounts[r.size] || 0) + r.quantity;
        });
        const topItems = Object.entries(itemCounts)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 3);
        const topSizes = Object.entries(sizeCounts)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 3);

        doc.setFontSize(11);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('DEMAND ANALYSIS', 14, 112);

        // Demand Grid
        doc.setDrawColor(240);
        doc.line(14, 115, 196, 115);

        // Top Items List
        doc.setFontSize(9);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text('TOP REQUESTED PRODUCTS', 14, 122);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60);
        topItems.forEach((item, idx) => {
          doc.text(`• ${item[0]}`, 14, 128 + (idx * 5));
          doc.text(`${item[1]} units`, 70, 128 + (idx * 5), { align: 'right' });
        });

        // Top Sizes List
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text('POPULAR SIZING', 110, 122);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60);
        topSizes.forEach((size, idx) => {
          doc.text(`• Size: ${size[0]}`, 110, 128 + (idx * 5));
          doc.text(`${size[1]} units`, 166, 128 + (idx * 5), { align: 'right' });
        });

        // --- Detailed Table ---
        const tableData = filteredRes.map(r => [
          r.id,
          r.studentName,
          r.itemName,
          r.gender,
          r.size || 'N/A',
          r.quantity.toString(),
          new Date(r.dateReserved).toLocaleDateString(),
          r.status.toUpperCase()
        ]);

        autoTable(doc, {
          startY: 150,
          head: [['ID', 'NAME', 'ITEM', 'SEX', 'SIZE', 'QTY', 'DATE', 'STATUS']],
          body: tableData,
          headStyles: { 
            fillColor: primaryColor, 
            textColor: [255, 255, 255],
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'center'
          },
          bodyStyles: {
            fontSize: 7,
            textColor: [40, 40, 40]
          },
          alternateRowStyles: {
            fillColor: [250, 252, 248]
          },
          columnStyles: {
            0: { cellWidth: 25 },
            5: { halign: 'center' },
            6: { halign: 'center' },
            7: { halign: 'center', fontStyle: 'bold' }
          },
          margin: { top: 150 },
          didDrawPage: (data) => {
            // Footer
            doc.setFontSize(7);
            doc.setTextColor(150);
            const footerY = doc.internal.pageSize.getHeight() - 10;
            doc.text(`System Generated Report • Confidential • Page ${data.pageNumber}`, 14, footerY);
            doc.text(`Printed: ${timestamp}`, pageWidth - 14, footerY, { align: 'right' });
          }
        });

        doc.save(`EDURESERVE_MONTHLY_REPORT_${new Date().toISOString().split('T')[0]}.pdf`);

      } else if (reportType === 'Inventory Stock Report') {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();

        // --- Header Section ---
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, pageWidth, 45, 'F');
        
        doc.setFontSize(26);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('EduReserve', 14, 22);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Inventory & Stock Analysis', 14, 29);
        doc.text('Asia Technological School of Science and Arts', 14, 34);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('INVENTORY STATUS REPORT', pageWidth - 14, 22, { align: 'right' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Doc ID: INV-STA-${new Date().getTime().toString().slice(-6)}`, pageWidth - 14, 29, { align: 'right' });
        doc.text(`Printed: ${timestamp}`, pageWidth - 14, 34, { align: 'right' });

        // --- Document Info Grid ---
        doc.setTextColor(0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('REPORT TYPE', 14, 55);
        doc.text('GENERATED BY', 80, 55);
        doc.text('VERSION', 160, 55);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80);
        doc.text('Live Stock Availability', 14, 61);
        doc.text('System Administrator', 80, 61);
        doc.text('v1.0.4 - Release', 160, 61);

        // --- A. Stock Overview ---
        const totalStockUnits = inventory.reduce((acc, item) => {
          return acc + Object.values(item.sizes).reduce((sum, q) => sum + q, 0);
        }, 0);
        const lowStockCount = inventory.filter(item => {
          const total = Object.values(item.sizes).reduce((sum, q) => sum + q, 0);
          return total < 20; 
        }).length;

        doc.setDrawColor(230);
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.roundedRect(14, 70, 182, 30, 2, 2, 'FD');

        doc.setFontSize(8);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL PHYSICAL UNITS', 25, 80);
        doc.text('UNIQUE SKUS', 80, 80);
        doc.text('LOW STOCK ALERTS', 135, 80);

        doc.setFontSize(16);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(totalStockUnits.toString(), 25, 90);
        doc.text(inventory.length.toString(), 80, 90);
        
        if (lowStockCount > 0) {
          doc.setTextColor(errorColor[0], errorColor[1], errorColor[2]);
          doc.text(lowStockCount.toString(), 135, 90);
          doc.setFontSize(7);
          doc.text('RESTOCK NEEDED', 135, 94);
        } else {
          doc.text('0', 135, 90);
        }

        const tableData = inventory.map(item => {
          const total = Object.values(item.sizes).reduce((sum, q) => sum + q, 0);
          return [
            item.name.toUpperCase(),
            item.category.toUpperCase(),
            Object.entries(item.sizes).map(([s, q]) => `${s}: ${q}`).join(' | '),
            total.toString(),
            total < 20 ? 'CRITICAL' : 'OPTIMAL',
            item.status.toUpperCase()
          ];
        });

        autoTable(doc, {
          startY: 110,
          head: [['PRODUCT NAME', 'CATEGORY', 'SIZE BREAKDOWN', 'STOCK', 'LEVEL', 'STATUS']],
          body: tableData,
          headStyles: { 
            fillColor: primaryColor, 
            textColor: [255, 255, 255],
            fontSize: 8,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 7,
            textColor: [40, 40, 40]
          },
          alternateRowStyles: {
            fillColor: [250, 252, 248]
          },
          didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 4 && data.cell.text[0] === 'CRITICAL') {
              data.cell.styles.textColor = errorColor;
              data.cell.styles.fontStyle = 'bold';
            }
          },
          didDrawPage: (data) => {
            doc.setFontSize(7);
            doc.setTextColor(150);
            const footerY = doc.internal.pageSize.getHeight() - 10;
            doc.text(`Inventory Audit Document • Page ${data.pageNumber}`, 14, footerY);
            doc.text(`Security Verified • ${timestamp}`, pageWidth - 14, footerY, { align: 'right' });
          }
        });

        doc.save(`EDURESERVE_INVENTORY_REPORT_${new Date().toISOString().split('T')[0]}.pdf`);

      } else if (reportType === 'Daily Operations Summary') {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const selectedDay = startDate || new Date().toLocaleDateString('en-CA');

        // --- Header Section ---
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, pageWidth, 45, 'F');
        
        doc.setFontSize(26);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('EduReserve', 14, 22);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Daily Activity Log & Metrics', 14, 29);
        doc.text('Operating Date: ' + selectedDay, 14, 34);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('DAILY OPERATIONS SUMMARY', pageWidth - 14, 22, { align: 'right' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${timestamp}`, pageWidth - 14, 29, { align: 'right' });
        doc.text(`Ref ID: OPS-${selectedDay.replace(/-/g, '')}`, pageWidth - 14, 34, { align: 'right' });

        const dailyReservations = reservations.filter(r => 
          new Date(r.dateReserved).toLocaleDateString('en-CA') === selectedDay
        );

        const itemsResToday = dailyReservations.reduce((acc, r) => acc + r.quantity, 0);
        const claimedToday = dailyReservations.filter(r => r.status === 'Picked Up').length;
        const cancelledToday = dailyReservations.filter(r => r.status === 'Cancelled').length;

        // --- Metrics Row ---
        doc.setDrawColor(230);
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.roundedRect(14, 55, 182, 30, 2, 2, 'FD');

        doc.setFontSize(8);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL LOGS', 25, 65);
        doc.text('UNITS RESERVED', 80, 65);
        doc.text('CLAIMED TODAY', 135, 65);

        doc.setFontSize(16);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(dailyReservations.length.toString(), 25, 75);
        doc.text(itemsResToday.toString(), 80, 75);
        doc.text(claimedToday.toString(), 135, 75);

        // --- B. Status Activity ---
        doc.setFontSize(11);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('LATEST TRANSACTION LOG', 14, 95);

        const tableData = dailyReservations.map(r => [
          new Date(r.dateReserved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          r.studentName.toUpperCase(),
          r.itemName,
          r.size || '-',
          r.quantity.toString(),
          r.status.toUpperCase()
        ]);

        autoTable(doc, {
          startY: 100,
          head: [['TIME', 'STUDENT NAME', 'ITEM', 'SIZE', 'QTY', 'STATUS']],
          body: tableData,
          headStyles: { fillColor: primaryColor, fontSize: 8 },
          bodyStyles: { fontSize: 7.5 },
          alternateRowStyles: { fillColor: [250, 252, 248] },
          didDrawPage: (data) => {
            doc.setFontSize(7);
            doc.setTextColor(150);
            const footerY = doc.internal.pageSize.getHeight() - 10;
            doc.text(`Daily Activity Report • Page ${data.pageNumber}`, 14, footerY);
            doc.text(`Operational Control Division`, pageWidth - 14, footerY, { align: 'right' });
          }
        });

        doc.save(`EDURESERVE_DAILY_OPS_${selectedDay}.pdf`);

      } else if (reportType === 'Audit Trail Report') {
        const doc = new jsPDF('l', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();

        // --- Header Section (Landscape) ---
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, pageWidth, 45, 'F');
        
        doc.setFontSize(26);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('EduReserve', 14, 22);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('System Audit Trail & Security Configuration Log', 14, 29);
        doc.text('School Name: Asia Technological School of Science and Arts', 14, 34);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('SYSTEM AUDIT TRAIL REPORT', pageWidth - 14, 22, { align: 'right' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date Range: ${startDate && endDate ? `${startDate} to ${endDate}` : 'ALL HISTORICAL DATA'}`, pageWidth - 14, 29, { align: 'right' });
        doc.text(`Generated By: Admin User • ${timestamp}`, pageWidth - 14, 34, { align: 'right' });

        // Filtering logs
        let filteredLogs = auditLogs;
        if (startDate) filteredLogs = filteredLogs.filter(l => new Date(l.created_at) >= new Date(startDate));
        if (endDate) filteredLogs = filteredLogs.filter(l => new Date(l.created_at) <= new Date(endDate));
        if (filterAdmin) filteredLogs = filteredLogs.filter(l => l.admin_name.toLowerCase().includes(filterAdmin.toLowerCase()));

        // --- Audit Summary Calculations ---
        const totalActions = filteredLogs.length;
        const totalReservationsCreated = filteredLogs.filter(l => l.action.includes('RESERVATION_CREATE') || l.action.includes('CREATE')).length;
        const totalStatusUpdates = filteredLogs.filter(l => l.action.includes('STATUS_UPDATE') || l.action.includes('UPDATE')).length;
        const totalInventoryChanges = filteredLogs.filter(l => l.entity_type === 'inventory' || l.action.includes('INVENTORY')).length;
        const totalCancelled = filteredLogs.filter(l => l.details.toLowerCase().includes('cancelled') || l.action.includes('CANCEL')).length;

        // Peak activity time calculation
        const counts: any = {};
        filteredLogs.forEach(l => {
          const h = new Date(l.created_at).getHours();
          counts[h] = (counts[h] || 0) + 1;
        });
        const peakH = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0];
        const peakDisplay = peakH ? `${peakH}:00 - ${parseInt(peakH) + 1}:00` : 'N/A';

        doc.setDrawColor(230);
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.roundedRect(14, 55, pageWidth - 28, 30, 2, 2, 'FD');

        doc.setFontSize(8);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL ACTIONS', 25, 65);
        doc.text('RESERVATIONS', 65, 65);
        doc.text('STATUS UPDATES', 105, 65);
        doc.text('INVENTORY CHANGES', 145, 65);
        doc.text('CANCELLED', 195, 65);
        doc.text('PEAK ACTIVITY', 235, 65);

        doc.setFontSize(16);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(totalActions.toString(), 25, 75);
        doc.text(totalReservationsCreated.toString(), 65, 75);
        doc.text(totalStatusUpdates.toString(), 105, 75);
        doc.text(totalInventoryChanges.toString(), 145, 75);
        doc.text(totalCancelled.toString(), 195, 75);
        doc.text(peakDisplay, 235, 75);

        // --- 3. Detailed Audit Table ---
        const columns = [
          'TIMESTAMP', 'USER', 'ROLE', 'ACTION TYPE', 'RES ID', 'STUDENT / ID', 
          'ITEM', 'SIZE', 'QTY', 'FROM / PREVIOUS', 'TO / NEW', 
          'REASON', 'IMPACT', 'STOCK', 'ENTITY'
        ];

        const tableData = filteredLogs.map(log => {
          const d = log.details.toLowerCase();
          let resId = log.entity_type === 'reservation' ? log.entity_id : 'N/A';
          let studentName = 'N/A';
          let itemName = 'N/A';
          let itemSize = 'N/A';
          let quantity = '1';
          let prevVal = 'N/A';
          let nextVal = 'N/A';
          let reason = 'N/A';
          let impact = '0';
          let stockAfter = 'N/A';
          let role = log.admin_name.toLowerCase().includes('admin') ? 'ADMIN' : 'STUDENT';

          // Intelligent Parsing for Reservation Entities
          if (log.entity_type === 'reservation' || log.action.includes('RESERVATION')) {
            const reservation = reservations.find(r => r.id === log.entity_id);
            if (reservation) {
              studentName = `${reservation.studentName} (${reservation.uid})`;
              itemName = reservation.itemName;
              itemSize = reservation.size || 'Standard';
              quantity = reservation.quantity.toString();
            }
          }

          // Parse Status Updates
          if (log.action === 'STATUS_UPDATE' && d.includes('to')) {
            const parts = log.details.split(/status to|to/i);
            if (parts.length >= 2) {
              nextVal = parts[1].split('(')[0].trim().toUpperCase();
            }
            if (d.includes('reason:')) {
              reason = log.details.split(/reason:/i)[1].trim();
            }
          }

          // Parse Inventory
          if (log.entity_type === 'inventory' || log.action.includes('INVENTORY')) {
            const item = inventory.find(i => i.id.toString() === log.entity_id);
            if (item) {
              itemName = item.name;
              const totalStock = Object.values(item.sizes).reduce((a: number, b: number) => a + b, 0);
              stockAfter = totalStock.toString();
            }
          }

          // Inventory Impact Logic
          if (log.action === 'RESERVATION_CREATE') {
            impact = `-${quantity}`;
          } else if (log.details.includes('Rejected') || log.details.includes('Cancelled')) {
            impact = `+${quantity}`;
          }

          return [
            new Date(log.created_at).toLocaleString('en-US', { 
              month: '2-digit', 
              day: '2-digit', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            log.admin_name,
            role,
            log.action.replace(/_/g, ' '),
            resId || 'N/A',
            studentName,
            itemName,
            itemSize,
            quantity,
            prevVal,
            nextVal,
            reason,
            impact !== '0' ? impact : '-',
            stockAfter,
            (log.entity_type || 'System').toUpperCase()
          ];
        });

        autoTable(doc, {
          startY: 95,
          head: [columns],
          body: tableData,
          headStyles: { 
            fillColor: primaryColor, 
            textColor: [255, 255, 255],
            fontSize: 6, 
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 1.5
          },
          bodyStyles: { 
            fontSize: 6,
            cellPadding: 1,
            overflow: 'linebreak'
          },
          alternateRowStyles: { 
            fillColor: [250, 252, 248] 
          },
          columnStyles: {
            0: { cellWidth: 22 }, // Timestamp
            1: { cellWidth: 20 }, // User
            3: { cellWidth: 20 }, // Action
            5: { cellWidth: 25 }, // Student
            6: { cellWidth: 25 }, // Item
            11: { cellWidth: 30 } // Reason
          },
          didParseCell: (data) => {
            if (data.section === 'body') {
              // Highlight Inventory Impact
              if (data.column.index === 12) {
                if (data.cell.text[0].startsWith('+')) data.cell.styles.textColor = [0, 150, 0];
                if (data.cell.text[0].startsWith('-')) data.cell.styles.textColor = [200, 0, 0];
              }
              // Bold important columns
              if (data.column.index === 10 && data.cell.text[0] !== 'N/A') {
                data.cell.styles.fontStyle = 'bold';
              }
            }
          },
          didDrawPage: (data) => {
            doc.setFontSize(7);
            doc.setTextColor(150);
            const footerY = doc.internal.pageSize.getHeight() - 10;
            doc.text('“End of Report” - This report is auto-generated and cannot be modified.', 14, footerY);
            doc.text(`EduReserve Security Operations • Page ${data.pageNumber}`, pageWidth / 2, footerY, { align: 'center' });
            doc.text(`Printed: ${timestamp}`, pageWidth - 14, footerY, { align: 'right' });
          }
        });

        doc.save(`EDURESERVE_AUDIT_TRAIL_${new Date().toISOString().split('T')[0]}.pdf`);
      }

      toast.success(`${reportType} generated and downloaded successfully!`);
      setIsReportModalOpen(false);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate PDF report.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate chart data for the last 14 days
  const chartData = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dateStr = d.toLocaleDateString();
    return {
      name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      shortMonth: d.toLocaleDateString('en-US', { month: 'short' }),
      day: d.getDate(),
      reservations: reservations.filter(r => new Date(r.dateReserved).toLocaleDateString() === dateStr).length,
      logs: auditLogs.filter(l => new Date(l.created_at).toLocaleDateString() === dateStr).length,
    };
  });

  return (
    <div className="p-4 lg:p-12 space-y-8 lg:space-y-12 relative">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-[#385723] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-gray-400 text-xs lg:text-sm mt-1 flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            Administrative Summary • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-gray-50 rounded-2xl">
                {stat.icon}
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <h2 className="text-3xl font-bold text-gray-800">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Operations Quick Summary (Chart View) */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl overflow-hidden space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-[#385723] rounded-2xl text-white shadow-lg">
              <TrendingUp size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#385723] tracking-tight leading-none">Operational Activity</h2>
              <p className="text-xs text-gray-400 font-medium mt-1">Last 14 Days Transaction Volume</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#a0c4de]"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reservations</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#385723]"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Logs</span>
             </div>
          </div>
        </div>
        
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '1rem', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              />
              <Bar 
                dataKey="reservations" 
                fill="#a0c4de" 
                radius={[4, 4, 0, 0]} 
                barSize={30}
              />
              <Bar 
                dataKey="logs" 
                fill="#385723" 
                radius={[4, 4, 0, 0]} 
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Recent Reservations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Recent Reservations</h3>
            <button 
              onClick={() => setPage('admin-reservations')}
              className="text-xs font-bold text-[#385723] uppercase tracking-widest hover:underline"
            >
              View All
            </button>
          </div>
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-600">Student</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600">Item</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((activity) => (
                  <tr key={activity.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col justify-center">
                        <p className="text-sm font-bold text-gray-800 leading-none">{activity.student}</p>
                        <p className="text-[9px] text-[#385723]/60 uppercase font-black tracking-wider leading-none mt-[1px]">Student</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 leading-tight">{activity.item}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${
                        activity.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                        activity.status === 'Approved' ? 'bg-green-100 text-green-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">{activity.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log Summary */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Recent Audits</h3>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setPage('admin-system-logs')}
                className="text-xs font-black text-[#385723] uppercase tracking-widest hover:underline"
              >
                See All
              </button>
              <Activity className="text-purple-500" size={20} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-xl border border-gray-100 space-y-4">
            {recentAudits.length > 0 ? (
              <div className="space-y-3">
                {recentAudits.map((log) => (
                  <div key={log.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">{log.action}</span>
                      <span className="text-[9px] text-gray-400">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                    <p className="text-[11px] text-gray-700 leading-tight">{log.details}</p>
                    <p className="text-[9px] text-gray-400 font-bold italic">By: {log.admin_name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-400 text-xs italic">No system audits yet.</p>
            )}
            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="w-full py-3 bg-purple-50 text-purple-600 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-purple-100 transition-colors"
            >
              Generate Audit Report
            </button>
          </div>
        </div>
      </div>

      {/* Generate Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 w-full max-w-6xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-400" />
            </button>
 
            <div className="space-y-12">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-[#385723] tracking-tight">System Report Portal</h2>
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Administrative Export & Data Archiving</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-10">
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] mb-6">Select Report Category</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {[
                        { id: 'Daily Operations Summary', icon: <Activity size={18}/>, desc: "Today's tracking" },
                        { id: 'Monthly Reservation Summary', icon: <ShoppingBag size={18}/>, desc: 'Complete history' },
                        { id: 'Inventory Stock Report', icon: <Package size={18}/>, desc: 'Live availability' },
                        { id: 'Audit Trail Report', icon: <ShieldCheck size={18}/>, desc: 'Administrative logs' }
                      ].map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setReportType(type.id)}
                          className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all text-left ${
                            reportType === type.id 
                              ? 'border-[#385723] bg-[#385723]/5 shadow-md scale-[1.02]' 
                              : 'border-gray-50 hover:border-gray-100 bg-gray-50/20'
                          }`}
                        >
                          <div className={`p-3 rounded-2xl ${reportType === type.id ? 'bg-[#385723] text-white shadow-lg shadow-[#385723]/20' : 'bg-white text-gray-400 border border-gray-100'}`}>
                            {type.icon}
                          </div>
                          <div>
                            <p className={`font-bold text-sm tracking-tight ${reportType === type.id ? 'text-[#385723]' : 'text-gray-800'}`}>{type.id}</p>
                            <p className="text-xs text-gray-400 font-medium mt-1">{type.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8 bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.25em]">Report Filters</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase">Start Date</label>
                        <input 
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:ring-[#385723] focus:border-[#385723]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase">End Date</label>
                        <input 
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:ring-[#385723] focus:border-[#385723]"
                        />
                      </div>
                    </div>

                    {(reportType === 'Monthly Reservation Summary' || reportType === 'Daily Operations Summary') && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-gray-500 uppercase">Item Type</label>
                          <select 
                            value={filterItemType}
                            onChange={(e) => setFilterItemType(e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:ring-[#385723] focus:border-[#385723]"
                          >
                            <option value="All">All Items</option>
                            <option value="Uniform">Uniforms</option>
                            <option value="ID Lace">ID Lace</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-gray-500 uppercase">Status</label>
                          <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:ring-[#385723] focus:border-[#385723]"
                          >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Ready for Pickup">Ready for Pickup</option>
                            <option value="Picked Up">Picked Up</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {reportType === 'Audit Trail Report' && (
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase">Admin Name</label>
                        <input 
                          type="text"
                          placeholder="Search admin..."
                          value={filterAdmin}
                          onChange={(e) => setFilterAdmin(e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:ring-[#385723] focus:border-[#385723]"
                        />
                      </div>
                    )}
                  </div>
                </div>
 
                  <div className="space-y-12 flex flex-col justify-between">
                    <div className="space-y-10">
                      <div className="p-10 bg-[#385723]/5 rounded-[2.5rem] border border-[#385723]/10 space-y-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#385723] rounded-lg text-white">
                            <FileText size={18} />
                          </div>
                          <span className="text-xs font-bold text-[#385723] uppercase tracking-widest">Document Specifications</span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed">
                          The system will generate an official document optimized for <span className="underline decoration-[#385723]/30 font-bold">landscape viewing</span>. 
                          This ensures maximum data fidelity for wide inventory and log datasets.
                        </p>
                      </div>
   
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Active Verification Period</label>
                        <div className="flex items-center gap-4 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-600 transition-all hover:bg-white hover:border-[#385723]/20">
                          <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-[#385723]">
                            <Calendar size={20} />
                          </div>
                          <span className="text-lg font-bold text-gray-800">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
 
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={handleGenerateReport}
                      disabled={isGenerating}
                      className="w-full py-6 bg-[#385723] text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-[#2d461c] transition-all flex items-center justify-center gap-4 disabled:opacity-70 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download size={24} />
                          Download PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
