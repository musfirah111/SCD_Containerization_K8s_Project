import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import DoctorSidebar from '../Sidebar';
import { DoctorHeader } from './Header';
import { AuthContext } from '../../../context/AuthContext';

export const DoctorLayout = () => {
    const { user } = useContext(AuthContext) as { user: any };

    return (
        <div className="flex">
            <DoctorSidebar />
            <div className="flex-1">
                <DoctorHeader user={user} />
                <main className="p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};