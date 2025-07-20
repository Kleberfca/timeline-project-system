// src/hooks/usePermissions.ts
/**
 * Hook para verificar permissões do usuário
 */

import { useAuth } from '../contexts/AuthContext';

export const usePermissions = () => {
  const { user, isAdmin } = useAuth();

  const permissions = {
    // Permissões de cliente
    canViewOwnProjects: !!user,
    canDownloadFiles: !!user,
    
    // Permissões de admin
    canCreateClients: isAdmin,
    canEditClients: isAdmin,
    canDeleteClients: isAdmin,
    canCreateProjects: isAdmin,
    canEditProjects: isAdmin,
    canUpdateTimeline: isAdmin,
    canUploadFiles: isAdmin,
    canDeleteFiles: isAdmin,
    canViewAllClients: isAdmin,
    canViewAllProjects: isAdmin,
  };

  /**
   * Verifica se usuário tem uma permissão específica
   */
  const hasPermission = (permission: keyof typeof permissions): boolean => {
    return permissions[permission] || false;
  };

  /**
   * Verifica se usuário pode acessar projeto específico
   */
  const canAccessProject = (clienteId: string): boolean => {
    if (isAdmin) return true;
    return user?.cliente_id === clienteId;
  };

  return {
    ...permissions,
    hasPermission,
    canAccessProject,
    isAdmin,
    isClient: !isAdmin && !!user
  };
};