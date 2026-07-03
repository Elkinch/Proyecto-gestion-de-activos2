// ========== js/roles.js ==========
export const ROLES = {
  admin: {
    nombre: 'Administrador',
    descripcion: 'Acceso total al sistema',
    permisos: [
      'ver_dashboard',
      'ver_gestion',
      'crear_activos',
      'editar_activos',
      'eliminar_activos',
      'ver_acciones',
      'gestionar_asignacion',
      'gestionar_mantenimiento',
      'ver_reportes',
      'ver_consultas',
      'ver_historial',
      'ver_notificaciones',
      'gestionar_roles',
      'exportar_datos',
      'gestionar_usuarios'
    ]
  },
  gestor: {
    nombre: 'Gestor de Activos',
    descripcion: 'Gestiona activos, asignaciones y mantenimientos',
    permisos: [
      'ver_dashboard',
      'ver_gestion',
      'crear_activos',
      'editar_activos',
      'ver_acciones',
      'gestionar_asignacion',
      'gestionar_mantenimiento',
      'ver_reportes',
      'ver_consultas',
      'exportar_datos'
    ]
  },
  usuario: {
    nombre: 'Usuario',
    descripcion: 'Visualizacion y consultas basicas',
    permisos: [
      'ver_dashboard',
      'ver_gestion',
      'ver_acciones',
      'ver_reportes',
      'ver_consultas'
    ]
  }
};

export function obtenerPermisos(rol) {
  return ROLES[rol] ? ROLES[rol].permisos : [];
}

export function obtenerNombreRol(rol) {
  return ROLES[rol] ? ROLES[rol].nombre : 'Desconocido';
}

export function tienePermiso(usuario, permiso) {
  if (!usuario) return false;
  const rol = usuario.rol || 'usuario';
  const permisos = obtenerPermisos(rol);
  return permisos.includes(permiso);
}

export function rolesDisponibles() {
  return Object.keys(ROLES);
}