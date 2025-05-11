import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

export const AdminLayout = () => {
    const { user } = useContext(AuthContext) as { user: any };

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1">
                <Header user={user} />
                <main className="p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};