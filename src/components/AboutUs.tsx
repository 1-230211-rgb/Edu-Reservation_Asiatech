import { Info, Target, Users, Phone, Mail, MapPin } from 'lucide-react';
import { UserRole } from '../types';

interface AboutUsProps {
  userRole?: UserRole;
}

export const AboutUs: React.FC<AboutUsProps> = ({ userRole }) => {
  return (
    <div className="p-4 lg:p-12 space-y-8 lg:space-y-16">
      <div className="relative h-48 lg:h-64 rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border-2 lg:border-4 border-white">
        <img 
          src="/banner.jpg" 
          alt="School Campus" 
          className="w-full h-full object-cover brightness-75"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/school-campus/1200/400';
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
        <div className="space-y-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-[#4ade80]/10 rounded-2xl lg:rounded-[3rem] transform rotate-3 scale-105 group-hover:rotate-0 transition-transform duration-500"></div>
            <img 
              src="/building.jpg" 
              alt="School Building" 
              className="relative w-full h-[300px] lg:h-[400px] object-cover rounded-2xl lg:rounded-[3rem] shadow-2xl border-4 lg:border-8 border-white"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/school-building/600/400';
              }}
            />
            <div className="absolute bottom-4 lg:bottom-8 left-4 lg:left-8 right-4 lg:right-8 bg-white/95 backdrop-blur-sm p-4 lg:p-6 rounded-xl lg:rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-lg lg:text-2xl font-bold text-[#385723] mb-1 lg:mb-2 uppercase tracking-tight">ASIATECH COLLEGE</h3>
            </div>
          </div>

          <div className="space-y-4 lg:space-y-6">
            <h3 className="text-xl lg:text-2xl font-bold text-[#385723] flex items-center gap-3">
              <Info size={24} /> System Features
            </h3>
            <ul className="space-y-2 lg:space-y-3 text-gray-600 font-medium list-disc pl-6 text-sm lg:text-base">
              <li>View available uniform designs and sizes</li>
              <li>Reserve uniforms online</li>
              <li>Track reservation status (Pending, Approved, For Pickup, Picked Up)</li>
              <li>Receive notifications for updates or claiming schedule</li>
            </ul>
          </div>
        </div>

        <div className="space-y-8 lg:space-y-12">
          <div className="space-y-4 lg:space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#385723] tracking-tight">About Us</h2>
            <div className="flex items-start gap-4">
              <div className="w-4 h-4 bg-green-500 rounded-sm mt-1 shrink-0"></div>
              <p className="text-gray-700 font-bold text-base lg:text-lg leading-tight">
                System Name: EduReserve: A Web-Based Reservation System for School Uniforms and ID Laces of the Basic Education Department
              </p>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm lg:text-lg">
              EduReserve is a specialized online platform designed to streamline the reservation of school uniforms and ID laces for students of the Basic Education Department. It allows parents and students to view available stocks, check official designs, and secure their items conveniently from anywhere.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-3 lg:space-y-4">
              <h3 className="text-lg lg:text-xl font-bold text-red-500 flex items-center gap-2">
                <Target size={20} /> Our Purpose
              </h3>
              <p className="text-gray-600 text-xs lg:text-sm leading-relaxed">
                Our goal is to make the reservation process more convenient, organized, and efficient for both students and school staff. With this system, students can ensure their uniforms are ready for pickup before the start of classes.
              </p>
            </div>
            <div className="space-y-3 lg:space-y-4">
              <h3 className="text-lg lg:text-xl font-bold text-amber-600 flex items-center gap-2">
                <Users size={20} /> Developed By
              </h3>
              <p className="text-gray-600 text-xs lg:text-sm leading-relaxed">
                BS Information Technology Students<br />
                Asia Technological School of Science and Arts<br />
                Academic Year 2025–2026
              </p>
            </div>
          </div>
        </div>
      </div>

      {userRole === 'student' && (
        <div className="pt-8 lg:pt-16 border-t border-gray-200 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-6 lg:space-y-8">
            <h3 className="text-xl lg:text-2xl font-bold text-red-500 flex items-center gap-3">
              <Phone size={24} /> Contact Information
            </h3>
            <p className="text-gray-500 text-[10px] lg:text-sm font-semibold uppercase tracking-widest">For inquiries or concerns, please contact:</p>
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center gap-4 text-gray-700">
                <Mail size={20} className="text-gray-400 shrink-0" />
                <span className="font-bold text-sm lg:text-base">Email: <span className="text-gray-500 font-medium">registrar@asiatech.edu.ph</span></span>
              </div>
              <div className="flex items-center gap-4 text-gray-700">
                <Phone size={20} className="text-gray-400 shrink-0" />
                <span className="font-bold text-sm lg:text-base">Phone: <span className="text-gray-500 font-medium">(02) 123-4567</span></span>
              </div>
              <div className="flex items-start gap-4 text-gray-700">
                <MapPin size={20} className="text-gray-400 mt-1 shrink-0" />
                <span className="font-bold text-sm lg:text-base">Address: <span className="text-gray-500 font-medium">74Q7+C2G, 1506 Dila, Dila, Entrance to Golden City Subdivision, City of Santa Rosa, Laguna</span></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
