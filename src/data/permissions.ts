import type { AdminCapabilities } from './whoami';

export const isPlatformAdmin = (role: AdminCapabilities['role'] | undefined): boolean => (
  role === 'admin' || role === 'superuser'
);
