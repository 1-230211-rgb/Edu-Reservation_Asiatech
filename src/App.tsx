import React, { useState, useEffect } from 'react';
import { Page, User, UserRole } from './types';
import { Sidebar, Header } from './components/Navigation';
import { Auth } from './components/Auth';
import { Home } from './components/Home';
import { Products } from './components/Products';
import { AboutUs } from './components/AboutUs';
import { FAQs } from './components/FAQs';
import { Policies } from './components/Policies';
import { Notifications } from './components/Notifications';
import { TrackReservedItems } from './components/TrackReservedItems';
import { motion, AnimatePresence } from 'motion/react';

import { AdminDashboard } from './components/AdminDashboard';
import { AdminReservations } from './components/AdminReservations';
import { AdminInventory } from './components/AdminInventory';
import { AdminStudents } from './components/AdminStudents';
import { AdminSystemLogs } from './components/AdminSystemLogs';
import { Profile } from './components/Profile';
import { Toaster, toast } from 'sonner';
import { InventoryItem, Reservation, AppNotification, Student } from './types';

const INITIAL_RESERVATIONS: Reservation[] = [
  { id: 'RES-2025-001', uid: 'user1', studentName: 'Maria Santos', studentEmail: 'maria@example.com', studentGrade: 'Grade 4', itemName: 'Grade School PE Shirt', gender: 'Female', size: 'M', quantity: 1, dateReserved: 'Nov 6, 2025', status: 'Pending' },
  { id: 'RES-2025-002', uid: 'user2', studentName: 'John Doe', studentEmail: 'john@example.com', studentGrade: 'Grade 10', itemName: 'High School Pants', gender: 'Male', size: 'L', quantity: 2, dateReserved: 'Nov 5, 2025', status: 'Approved', statusUpdatedAt: new Date('2025-11-05').toISOString() },
  { id: 'RES-2025-003', uid: 'user3', studentName: 'Elena Reyes', studentEmail: 'elena@example.com', studentGrade: 'Grade 12', itemName: 'High School ID Lace', gender: 'Female', size: 'Standard', quantity: 1, dateReserved: 'Nov 4, 2025', status: 'Ready for Pickup', statusUpdatedAt: new Date('2025-11-04').toISOString() },
  { id: 'RES-2025-004', uid: 'user4', studentName: 'Mark Ramos', studentEmail: 'mark@example.com', studentGrade: 'Grade 7', itemName: 'High School PE Pants', gender: 'Male', size: 'S', quantity: 1, dateReserved: 'Nov 4, 2025', status: 'Picked Up', statusUpdatedAt: new Date('2025-11-04').toISOString() },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: '1', uid: 'user1', date: 'Nov 6, 2025', message: 'Your reservation for Grade School PE Shirt has been received.', status: 'Unread' },
  { id: '2', uid: 'user1', date: 'Nov 5, 2025', message: 'Your reservation for High School Pants has been approved.', status: 'Read' },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setNotifications(data.map((n: any) => ({
          id: n.id.toString(),
          uid: n.user_id.toString(),
          message: n.message,
          status: n.status,
          date: n.created_at
        })));
      }
    } catch (error) {
      console.error("Fetch notifications error:", error);
    }
  };

  const fetchReservations = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/reservations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setReservations(data.map((res: any) => ({
          id: res.id,
          studentName: res.student_name,
          studentGrade: res.student_grade,
          itemName: res.item_name,
          gender: res.gender,
          size: res.size,
          quantity: res.quantity,
          rejectionReason: res.rejection_reason,
          dateReserved: res.created_at,
          status: res.status,
          statusUpdatedAt: res.status_updated_at
        })));
      }
    } catch (error) {
      console.error("Fetch reservations error:", error);
    }
  };

  const fetchStudents = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('/api/admin/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Fetch students error:", error);
    }
  };

  const fetchInventory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('/api/inventory', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      }
    } catch (error) {
       console.error("Fetch inventory error:", error);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchReservations();
      fetchNotifications();
      fetchStudents();
      fetchInventory();
    } else if (user) {
      fetchReservations();
      fetchNotifications();
      fetchInventory();
    }
  }, [user, currentPage]);

  const cancelReservation = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success("Reservation cancelled successfully");
        fetchReservations();
        fetchInventory(); // Update stocks
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to cancel reservation");
      }
    } catch (error) {
      console.error("Cancel reservation error:", error);
    }
  };

  const updateReservationStatus = async (id: string, status: Reservation['status'], reason?: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status, reason })
      });
      if (response.ok) {
        toast.success(`Reservation ${status}`);
        fetchReservations();
        if (status === 'Rejected') {
          fetchInventory(); // Update stocks
        }
      }
    } catch (error) {
      console.error("Update reservation error:", error);
    }
  };

  const updateInventory = async (updatedItem: InventoryItem) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/inventory/${updatedItem.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(updatedItem)
      });
      if (response.ok) {
        fetchInventory();
      }
    } catch (error) {
      console.error("Update inventory error:", error);
    }
  };

  const addInventoryItem = async (newItem: Omit<InventoryItem, 'id'>) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newItem)
      });
      if (response.ok) {
        fetchInventory();
      }
    } catch (error) {
      console.error("Add inventory error:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      // Try to restore session
      fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setUser({
            uid: data.id,
            name: data.name,
            email: data.email,
            role: data.role as UserRole
          });
          setCurrentPage('home');
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
      });
    }
  }, []);

  // Simple authentication simulation
  const handleLoginSuccess = (user: User) => {
    setUser(user);
    setCurrentPage(user.role === 'admin' ? 'admin-dashboard' : 'home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
  };

  const handleMarkAsRead = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'Read' } : n));
      }
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const renderPage = () => {
    if (user?.role === 'admin') {
      switch (currentPage) {
        case 'admin-dashboard': return (
          <AdminDashboard 
            setPage={setCurrentPage} 
            reservations={reservations}
            inventory={inventory}
            students={students}
          />
        );
        case 'admin-reservations': return <AdminReservations reservations={reservations} onUpdateStatus={updateReservationStatus} />;
        case 'admin-inventory': return <AdminInventory inventory={inventory} onUpdate={updateInventory} onAdd={addInventoryItem} />;
        case 'admin-students': return <AdminStudents />;
        case 'admin-system-logs': return <AdminSystemLogs />;
        case 'policies': return <Policies userRole="admin" />;
        case 'notifications': return <Notifications notifications={notifications} onMarkAsRead={handleMarkAsRead} />;
        case 'profile': return <Profile user={user} onLogout={handleLogout} onUpdate={setUser} />;
        case 'about': return <AboutUs userRole="admin" />;
        default: return (
          <AdminDashboard 
            setPage={setCurrentPage} 
            reservations={reservations}
            inventory={inventory}
            students={students}
          />
        );
      }
    }

    switch (currentPage) {
      case 'home': return <Home setPage={setCurrentPage} />;
      case 'products': return <Products user={user} inventory={inventory} onReserveSuccess={fetchInventory} />;
      case 'about': return <AboutUs userRole={user?.role} />;
      case 'faqs': return <FAQs />;
      case 'policies': return <Policies userRole={user?.role} />;
      case 'notifications': return <Notifications notifications={notifications} onMarkAsRead={handleMarkAsRead} />;
      case 'track': return <TrackReservedItems reservations={reservations} onCancel={cancelReservation} />;
      case 'profile': return <Profile user={user} onLogout={handleLogout} onUpdate={setUser} />;
      default: return <Home setPage={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f5f5f5] overflow-hidden relative">
      <Toaster position="top-right" richColors />
      {currentPage === 'login' || currentPage === 'register' ? (
        <div className="fixed inset-0 z-50 overflow-auto bg-[#f5f5f5]">
          <Auth 
            type={currentPage} 
            setPage={setCurrentPage} 
            onSuccess={handleLoginSuccess} 
          />
        </div>
      ) : (
        <>
          <Sidebar 
            currentPage={currentPage} 
            setPage={setCurrentPage} 
            onLogout={handleLogout} 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            userRole={user?.role}
          />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header 
              setPage={setCurrentPage} 
              onMenuOpen={() => setIsSidebarOpen(true)}
              user={user}
              notificationCount={notifications.filter(n => n.status === 'Unread').length}
            />
            
            <main className="flex-1 overflow-y-auto bg-white/50">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="min-h-full"
                >
                  {renderPage()}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </>
      )}
    </div>
  );
}
