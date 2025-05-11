import React from 'react';
import { Sidebar } from '../../components/admin/layout/Sidebar';
import { Header } from '../../components/admin/layout/Header';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export function Layout({ children }: { children: React.ReactNode }) {
    const { user } = useContext(AuthContext) as { user: any };

    return (
        <div className="flex h-screen bg-[#D2EBE7] ">
            <Sidebar />
            <div className="flex-1 ml-64">
                <Header user={user} />
                <main className="overflow-x-hidden overflow-y-auto bg-[#D2EBE7]  p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}