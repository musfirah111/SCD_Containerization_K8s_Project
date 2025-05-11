import React from 'react';
import DoctorSidebar from './Sidebar';
import { DoctorHeader } from './layout/Header';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export function Layout({ children }: { children: React.ReactNode }) {
    const { user } = useContext(AuthContext) as { user: any };

    return (
        <div className="flex h-screen bg-[#D2EBE7] ">
            <DoctorSidebar />
            <div className="flex-1 ml-64">
                <DoctorHeader user={user} />
                <main className="overflow-x-hidden overflow-y-auto bg-[#D2EBE7]  p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}