import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Header />
        <main className="min-h-screen bg-[#D2EBE7]">
          {children}
        </main>
      </div>
    </div>
  );
}