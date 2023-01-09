import { Outlet } from 'react-router-dom';
import { UserDashboardSidebar } from './UserDashboardSidebar/UserDashboardSidebar';

export const UserDashboard = () => (
  <>
    <UserDashboardSidebar />
    <Outlet />
  </>
);
