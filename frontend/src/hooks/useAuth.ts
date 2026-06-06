import { useAuthStore } from '@/stores/authStore';

export const useAuth = () => {
  const { user, accessToken, isAuthenticated, login, logout } = useAuthStore();

  return {
    user,
    accessToken,
    isAuthenticated,
    login,
    logout,
    isAdmin: user?.role === 'ADMIN',
    isManager: user?.role === 'MANAGER',
    isProcurementOfficer: user?.role === 'PROCUREMENT_OFFICER',
    isViewer: user?.role === 'VIEWER',
    isVendor: user?.role === 'VENDOR',
  };
};
