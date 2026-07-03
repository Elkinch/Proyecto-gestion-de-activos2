// ========== js/store.js ==========
const STORAGE_KEYS = {
  ACTIVOS: 'uleam_activos',
  ASIGNACIONES: 'uleam_asignaciones',
  MANTENIMIENTOS: 'uleam_mantenimientos',
  HISTORIAL: 'uleam_historial',
  NOTIFICACIONES: 'uleam_notificaciones',
  USUARIOS: 'uleam_usuarios',
  NEXT_IDS: 'uleam_next_ids',
  LAST_CODIGO: 'uleam_last_codigo'
};

function getDefaultActivos() {
  return [
    { id: 1, codigo: "UAF-2019-008", nombre: "Camioneta Toyota Hilux", descripcion: "Vehiculo institucional 4x4", marca: "Toyota", modelo: "Hilux", color: "Blanco", serie: "VIN-HIL-008", responsable: "Chf. Roberto Intriago", tipo: "Vehiculo", estado: "Regular", fechaCompra: "2019-03-10", valor: 38000, facultad: "ADMINISTRACION", ubicacion: "Parqueadero" },
    { id: 2, codigo: "UAF-2022-033", nombre: "Mesa de Laboratorio", descripcion: "Mesa resistente a quimicos", marca: "LABCO", modelo: "TBL-200", color: "Gris", serie: "LC-TBL033", responsable: "Dra. Elena Solis", tipo: "Laboratorio", estado: "Bueno", fechaCompra: "2022-07-22", valor: 450, facultad: "MEDICINA", ubicacion: "Lab. Quimica" },
    { id: 3, codigo: "UAF-2023-028", nombre: "Laptop Lenovo ThinkPad X1", descripcion: "Laptop gerencial ultra delgada", marca: "Lenovo", modelo: "ThinkPad X1 Carbon", color: "Negro", serie: "LN-X1028", responsable: "Dr. Felix Angulo", tipo: "Tecnologico", estado: "Bueno", fechaCompra: "2023-12-01", valor: 1650, facultad: "DERECHO", ubicacion: "Rectorado" },
    { id: 4, codigo: "UAF-2024-015", nombre: "Aire Acondicionado Mabe", descripcion: "Equipo de A/C para sala de servidores", marca: "Mabe", modelo: "MAC-18000", color: "Blanco", serie: "MB-AC015", responsable: "Ing. Pedro Meza", tipo: "Infraestructura", estado: "Bueno", fechaCompra: "2024-05-02", valor: 2200, facultad: "FACIT", ubicacion: "Data Center" },
    { id: 5, codigo: "UAF-2020-017", nombre: "TV Samsung 55", descripcion: "Televisor Smart para sala de reuniones", marca: "Samsung", modelo: "UN55TU8000", color: "Negro", serie: "SAM-55TV017", responsable: "Lcda. Marta Reyes", tipo: "Tecnologico", estado: "Dado de baja", fechaCompra: "2020-08-30", valor: 950, facultad: "ADMINISTRACION", ubicacion: "Sala Principal" },
    { id: 6, codigo: "UAF-2021-042", nombre: "Silla Ergonomica Gerencial", descripcion: "Silla de oficina tapizada en cuero", marca: "REQUIEZ", modelo: "EXEC-500", color: "Negro", serie: "RQ-0042", responsable: "Ing. Luis Castro", tipo: "Mobiliario", estado: "Regular", fechaCompra: "2021-04-18", valor: 280, facultad: "FCEAC", ubicacion: "Direccion" },
    { id: 7, codigo: "UAF-2024-001", nombre: "Laptop HP EliteBook", descripcion: "Laptop para uso administrativo", marca: "HP", modelo: "EliteBook 840 G8", color: "Plata", serie: "SN-HP840001", responsable: "Lcdo. Juan Perez", tipo: "Tecnologico", estado: "Bueno", fechaCompra: "2024-03-15", valor: 1200, facultad: "FACIT", ubicacion: "Oficina TI" }
  ];
}

function getDefaultUsuarios() {
  return [
    { id: 1, nombres: 'Ing. Administrador Sistema', email: 'admin@uleam.edu.ec', cedula: '', telefono: '', rol: 'admin', facultad: 'FACIT', password: 'Admin123', fechaRegistro: new Date().toISOString(), activo: true, titulo: 'Ing.' },
    { id: 2, nombres: 'Ing. Gestor Activos', email: 'gestor@uleam.edu.ec', cedula: '', telefono: '', rol: 'gestor', facultad: 'FACIT', password: 'Gestor123', fechaRegistro: new Date().toISOString(), activo: true, titulo: 'Ing.' },
    { id: 3, nombres: 'Lcdo. Usuario Regular', email: 'usuario@uleam.edu.ec', cedula: '', telefono: '', rol: 'usuario', facultad: 'FACIT', password: 'Usuario123', fechaRegistro: new Date().toISOString(), activo: true, titulo: 'Lcdo.' }
  ];
}

function getDefaultNextIds() {
  return { activo: 8, asignacion: 1, mantenimiento: 1, historial: 1 };
}

function loadFromStorage(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn('Error loading from storage:', e);
  }
  return defaultValue;
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Error saving to storage:', e);
  }
}

class Store {
  constructor() {
    this._activos = loadFromStorage(STORAGE_KEYS.ACTIVOS, getDefaultActivos());
    this._usuarios = loadFromStorage(STORAGE_KEYS.USUARIOS, getDefaultUsuarios());
    this._asignaciones = loadFromStorage(STORAGE_KEYS.ASIGNACIONES, []);
    this._mantenimientos = loadFromStorage(STORAGE_KEYS.MANTENIMIENTOS, []);
    this._historial = loadFromStorage(STORAGE_KEYS.HISTORIAL, []);
    this._notificaciones = loadFromStorage(STORAGE_KEYS.NOTIFICACIONES, []);
    this._nextIds = loadFromStorage(STORAGE_KEYS.NEXT_IDS, getDefaultNextIds());
    this._suscriptores = [];
  }

  suscribir(callback) {
    this._suscriptores.push(callback);
  }

  notificarCambios() {
    console.log('📢 Store notificando cambios a', this._suscriptores.length, 'suscriptores');
    this._suscriptores.forEach(cb => {
      try { cb(); } catch (e) { console.warn('Error en suscriptor:', e); }
    });
  }

  get activos() { return this._activos; }
  get usuarios() { return this._usuarios; }
  get asignaciones() { return this._asignaciones; }
  get mantenimientos() { return this._mantenimientos; }
  get historial() { return this._historial; }
  get notificaciones() { return this._notificaciones; }

  // ==================== ACTIVOS ====================
  agregarActivo(activo) {
    const nuevo = { ...activo, id: this._nextIds.activo++, fechaRegistro: new Date().toISOString() };
    this._activos.push(nuevo);
    this._guardarTodo();
    this.notificarCambios();
    return nuevo;
  }

  actualizarActivo(id, datos) {
    const index = this._activos.findIndex(a => a.id === id);
    if (index === -1) return null;
    this._activos[index] = { ...this._activos[index], ...datos, fechaActualizacion: new Date().toISOString() };
    this._guardarTodo();
    this.notificarCambios();
    return this._activos[index];
  }

  eliminarActivo(id) {
    const index = this._activos.findIndex(a => a.id === id);
    if (index === -1) return null;
    const eliminado = this._activos.splice(index, 1)[0];
    this._guardarTodo();
    this.notificarCambios();
    return eliminado;
  }

  obtenerActivo(id) {
    const idNum = typeof id === 'string' ? parseInt(id) : id;
    return this._activos.find(a => a.id === idNum);
  }

  obtenerActivoPorCodigo(codigo) {
    return this._activos.find(a => a.codigo === codigo);
  }

  buscarActivos(termino) {
    const busqueda = termino.toLowerCase();
    return this._activos.filter(a => 
      a.codigo.toLowerCase().includes(busqueda) ||
      a.nombre.toLowerCase().includes(busqueda) ||
      a.responsable.toLowerCase().includes(busqueda) ||
      (a.serie && a.serie.toLowerCase().includes(busqueda))
    );
  }

  getActivosPorTipo(tipo) {
    return this._activos.filter(a => a.tipo === tipo);
  }

  getActivosPorEstado(estado) {
    return this._activos.filter(a => a.estado === estado);
  }

  getActivosPorFacultad(facultad) {
    return this._activos.filter(a => a.facultad === facultad);
  }

  getActivosDisponibles() {
    const asignadosIds = this._asignaciones.filter(a => a.estadoAsignacion === 'Activo').map(a => a.activoId);
    return this._activos.filter(a => !asignadosIds.includes(a.id) && a.estado !== 'Dado de baja');
  }

  getTotalActivos() {
    return this._activos.length;
  }

  getValorTotalActivos() {
    return this._activos.reduce((sum, a) => sum + (a.valor || 0), 0);
  }

  getEstadisticas() {
    const stats = { total: this._activos.length, porTipo: {}, porEstado: {}, porFacultad: {}, valorTotal: 0, valorPromedio: 0 };
    this._activos.forEach(a => {
      stats.porTipo[a.tipo] = (stats.porTipo[a.tipo] || 0) + 1;
      stats.porEstado[a.estado] = (stats.porEstado[a.estado] || 0) + 1;
      stats.porFacultad[a.facultad] = (stats.porFacultad[a.facultad] || 0) + 1;
      stats.valorTotal += (a.valor || 0);
    });
    stats.valorPromedio = stats.total > 0 ? stats.valorTotal / stats.total : 0;
    return stats;
  }

  // ==================== USUARIOS ====================
  agregarUsuario(usuario) {
    const nuevo = { ...usuario, id: this._usuarios.length > 0 ? Math.max(...this._usuarios.map(u => u.id)) + 1 : 1, fechaRegistro: new Date().toISOString(), activo: true };
    this._usuarios.push(nuevo);
    this._guardarTodo();
    this.notificarCambios();
    return nuevo;
  }

  actualizarUsuario(id, datos) {
    const index = this._usuarios.findIndex(u => u.id === id);
    if (index === -1) return null;
    this._usuarios[index] = { ...this._usuarios[index], ...datos, fechaActualizacion: new Date().toISOString() };
    this._guardarTodo();
    this.notificarCambios();
    return this._usuarios[index];
  }

  eliminarUsuario(id) {
    const index = this._usuarios.findIndex(u => u.id === id);
    if (index === -1) return null;
    if (id === 1) throw new Error('No se puede eliminar al administrador principal');
    const eliminado = this._usuarios.splice(index, 1)[0];
    this._guardarTodo();
    this.notificarCambios();
    return eliminado;
  }

  desactivarUsuario(id) {
    return this.actualizarUsuario(id, { activo: false });
  }

  activarUsuario(id) {
    return this.actualizarUsuario(id, { activo: true });
  }

  obtenerUsuario(id) {
    return this._usuarios.find(u => u.id === id);
  }

  buscarUsuarioPorEmail(email) {
    return this._usuarios.find(u => u.email === email);
  }

  buscarUsuarioPorCedula(cedula) {
    return this._usuarios.find(u => u.cedula === cedula);
  }

  getUsuariosActivos() {
    return this._usuarios.filter(u => u.activo !== false);
  }

  getUsuariosPorRol(rol) {
    return this._usuarios.filter(u => u.rol === rol);
  }

  // ==================== ASIGNACIONES ====================
  agregarAsignacion(asignacion) {
    const nuevo = { ...asignacion, id: this._nextIds.asignacion++, fechaCreacion: new Date().toISOString() };
    this._asignaciones.push(nuevo);
    this._guardarTodo();
    this.notificarCambios();
    return nuevo;
  }

  actualizarAsignacion(id, datos) {
    const index = this._asignaciones.findIndex(a => a.id === id);
    if (index === -1) return null;
    this._asignaciones[index] = { ...this._asignaciones[index], ...datos, fechaActualizacion: new Date().toISOString() };
    this._guardarTodo();
    this.notificarCambios();
    return this._asignaciones[index];
  }

  eliminarAsignacion(id) {
    const index = this._asignaciones.findIndex(a => a.id === id);
    if (index === -1) return null;
    const eliminado = this._asignaciones.splice(index, 1)[0];
    this._guardarTodo();
    this.notificarCambios();
    return eliminado;
  }

  obtenerAsignacion(id) {
    return this._asignaciones.find(a => a.id === id);
  }

  getAsignacionesActivas() {
    return this._asignaciones.filter(a => a.estadoAsignacion === 'Activo');
  }

  getAsignacionesPorActivo(activoId) {
    return this._asignaciones.filter(a => a.activoId === activoId);
  }

  getAsignacionesPorResponsable(responsable) {
    return this._asignaciones.filter(a => a.responsable === responsable);
  }

  devolverActivo(id, fechaDevolucion = null) {
    if (!fechaDevolucion) fechaDevolucion = new Date().toISOString().split('T')[0];
    const resultado = this.actualizarAsignacion(id, { estadoAsignacion: 'Devuelto', fechaDevolucion: fechaDevolucion });
    this.notificarCambios();
    return resultado;
  }

  // ==================== MANTENIMIENTOS ====================
  agregarMantenimiento(mantenimiento) {
    const nuevo = { ...mantenimiento, id: this._nextIds.mantenimiento++, fechaCreacion: new Date().toISOString() };
    this._mantenimientos.push(nuevo);
    
    if (mantenimiento.tipo === 'Correctivo') {
      const activo = this.obtenerActivo(mantenimiento.activoId);
      if (activo && activo.estado !== 'En reparacion') {
        const index = this._activos.findIndex(a => a.id === activo.id);
        if (index !== -1) {
          this._activos[index] = { ...this._activos[index], estado: 'En reparacion', fechaActualizacion: new Date().toISOString() };
        }
      }
    }
    
    this._guardarTodo();
    this.notificarCambios();
    return nuevo;
  }

  actualizarMantenimiento(id, datos) {
    const index = this._mantenimientos.findIndex(m => m.id === id);
    if (index === -1) return null;
    this._mantenimientos[index] = { ...this._mantenimientos[index], ...datos, fechaActualizacion: new Date().toISOString() };
    this._guardarTodo();
    this.notificarCambios();
    return this._mantenimientos[index];
  }

  eliminarMantenimiento(id) {
    const index = this._mantenimientos.findIndex(m => m.id === id);
    if (index === -1) return null;
    const eliminado = this._mantenimientos.splice(index, 1)[0];
    this._guardarTodo();
    this.notificarCambios();
    return eliminado;
  }

  obtenerMantenimiento(id) {
    return this._mantenimientos.find(m => m.id === id);
  }

  getMantenimientosPorActivo(activoId) {
    return this._mantenimientos.filter(m => m.activoId === activoId);
  }

  getMantenimientosPorTipo(tipo) {
    return this._mantenimientos.filter(m => m.tipo === tipo);
  }

  getUltimosMantenimientos(limite = 10) {
    return [...this._mantenimientos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, limite);
  }

  // ==================== HISTORIAL ====================
  agregarHistorial(entrada) {
    const nuevo = { ...entrada, id: this._nextIds.historial++, fecha: entrada.fecha || new Date().toISOString() };
    this._historial.push(nuevo);
    this._guardarTodo();
    this.notificarCambios();
    return nuevo;
  }

  getHistorialPorActivo(activoId) {
    return this._historial.filter(h => h.activoId === activoId);
  }

  getHistorialPorTipo(tipo) {
    return this._historial.filter(h => h.tipo === tipo);
  }

  getHistorialPorUsuario(usuario) {
    return this._historial.filter(h => h.usuario === usuario);
  }

  getUltimoHistorial(limite = 50) {
    return [...this._historial].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, limite);
  }

  // ==================== NOTIFICACIONES ====================
  agregarNotificacion(notificacion) {
    const nuevo = { ...notificacion, id: Date.now() + Math.random() * 1000, fecha: notificacion.fecha || new Date().toISOString(), leida: false };
    this._notificaciones.push(nuevo);
    this._guardarTodo();
    this.notificarCambios();
    return nuevo;
  }

  marcarNotificacionLeida(id) {
    const index = this._notificaciones.findIndex(n => n.id === id);
    if (index === -1) return null;
    this._notificaciones[index].leida = true;
    this._guardarTodo();
    this.notificarCambios();
    return this._notificaciones[index];
  }

  marcarTodasNotificacionesLeidas() {
    this._notificaciones.forEach(n => n.leida = true);
    this._guardarTodo();
    this.notificarCambios();
  }

  eliminarNotificacion(id) {
    const index = this._notificaciones.findIndex(n => n.id === id);
    if (index === -1) return null;
    const eliminado = this._notificaciones.splice(index, 1)[0];
    this._guardarTodo();
    this.notificarCambios();
    return eliminado;
  }

  getNotificacionesNoLeidas() {
    return this._notificaciones.filter(n => !n.leida);
  }

  getNotificacionesRecientes(limite = 20) {
    return [...this._notificaciones].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, limite);
  }

  // ==================== LIMPIEZA ====================
  limpiarHistorialAntiguo(dias = 365) {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);
    this._historial = this._historial.filter(h => new Date(h.fecha) > fechaLimite);
    this._guardarTodo();
    this.notificarCambios();
  }

  limpiarNotificacionesAntiguas(dias = 90) {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);
    this._notificaciones = this._notificaciones.filter(n => new Date(n.fecha) > fechaLimite || !n.leida);
    this._guardarTodo();
    this.notificarCambios();
  }

  // ==================== PERSISTENCIA ====================
  _guardarTodo() {
    saveToStorage(STORAGE_KEYS.ACTIVOS, this._activos);
    saveToStorage(STORAGE_KEYS.USUARIOS, this._usuarios);
    saveToStorage(STORAGE_KEYS.ASIGNACIONES, this._asignaciones);
    saveToStorage(STORAGE_KEYS.MANTENIMIENTOS, this._mantenimientos);
    saveToStorage(STORAGE_KEYS.HISTORIAL, this._historial);
    saveToStorage(STORAGE_KEYS.NOTIFICACIONES, this._notificaciones);
    saveToStorage(STORAGE_KEYS.NEXT_IDS, this._nextIds);
  }

  reset() {
    this._activos = getDefaultActivos();
    this._usuarios = getDefaultUsuarios();
    this._asignaciones = [];
    this._mantenimientos = [];
    this._historial = [];
    this._notificaciones = [];
    this._nextIds = getDefaultNextIds();
    this._guardarTodo();
    this.notificarCambios();
  }

  exportData() {
    return {
      activos: this._activos,
      usuarios: this._usuarios,
      asignaciones: this._asignaciones,
      mantenimientos: this._mantenimientos,
      historial: this._historial,
      notificaciones: this._notificaciones,
      nextIds: this._nextIds,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  }

  importData(data) {
    if (!data || !data.activos) throw new Error('Datos invalidos para importar');
    this._activos = data.activos || [];
    this._usuarios = data.usuarios || getDefaultUsuarios();
    this._asignaciones = data.asignaciones || [];
    this._mantenimientos = data.mantenimientos || [];
    this._historial = data.historial || [];
    this._notificaciones = data.notificaciones || [];
    this._nextIds = data.nextIds || getDefaultNextIds();
    this._guardarTodo();
    this.notificarCambios();
  }
}

export const store = new Store();

export function getBadgeClass(estado) {
  const map = {
    "Bueno": "badge-green",
    "Regular": "badge-amber",
    "Dado de baja": "badge-gray",
    "En reparacion": "badge-red",
    "Activo": "badge-green",
    "Devuelto": "badge-gray",
    "Preventivo": "badge-blue",
    "Correctivo": "badge-red",
    "Predictivo": "badge-amber"
  };
  return map[estado] || "badge-gray";
}

export function suscribirStore(callback) {
  store.suscribir(callback);
}

window.store = store;
window.getBadgeClass = getBadgeClass;