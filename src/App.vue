<template>

  <!-- ==================== LOGIN ==================== -->
  <div v-if="!usuarioActual" id="view-login" class="view active">
    <div class="login-container">
      <div class="logo">
        <div class="logo-icon">U</div>
        <h1>Sistema de Gestión de Activos Fijos</h1>
        <p>Universidad Laica Eloy Alfaro de Manabí</p>
      </div>

      <div class="input-group">
        <label>Usuario o Correo</label>
        <input type="text" id="loginUser" v-model="loginEmail" placeholder="usuario@uleam.edu.ec" @keyup.enter="iniciarSesion">
        <div class="error-msg" :class="{ show: loginErrors.email }">{{ loginErrors.email }}</div>
      </div>

      <div class="input-group">
        <label>Contraseña</label>
        <div class="password-wrapper">
          <input type="password" id="loginPass" v-model="loginPassword" placeholder="Ingrese su contraseña" @keyup.enter="iniciarSesion">
          <button type="button" class="toggle-password" @click="togglePassword('loginPass', $event)">Mostrar</button>
        </div>
        <div class="error-msg" :class="{ show: loginErrors.password }">{{ loginErrors.password }}</div>
      </div>

      <button class="btn-login" @click="iniciarSesion">Iniciar Sesion</button>
      <button class="btn-register" @click="abrirRegistro">No tienes cuenta? Registrate</button>
      <div class="login-footer">2025 ULEAM – Direccion de Tecnologia Informatica</div>
    </div>
  </div>

  <!-- ==================== APP PRINCIPAL ==================== -->
  <div v-else class="view active" id="view-app">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Activos Fijos</h2>
        <span>ULEAM · 2025</span>
      </div>

      <div class="nav-section">PRINCIPAL</div>
      <div class="nav-item" :class="{ active: currentPage === 'dashboard' }" @click="cambiarPagina('dashboard')">
        <span class="nav-icon" v-html="ICONS.dashboard"></span> Dashboard
      </div>

      <div class="nav-section">GESTION</div>
      <div class="nav-item" :class="{ active: currentPage === 'gestionar' }" @click="cambiarPagina('gestionar')">
        <span class="nav-icon" v-html="ICONS.lista"></span> Gestion Activos
      </div>
      <div class="nav-item" :class="{ active: currentPage === 'agregar' }" @click="cambiarPagina('agregar')">
        <span class="nav-icon" v-html="ICONS.agregar"></span> Agregar Activo
      </div>

      <div class="nav-section" v-if="tienePermiso('gestionar_asignacion')">ASIGNACION</div>
      <div class="nav-item" :class="{ active: currentPage === 'asignacion' }" @click="cambiarPagina('asignacion')" v-if="tienePermiso('gestionar_asignacion')">
        <span class="nav-icon" v-html="ICONS.asignar"></span> Asignacion de Activos
      </div>

      <div class="nav-section" v-if="tienePermiso('gestionar_mantenimiento')">MANTENIMIENTO</div>
      <div class="nav-item" :class="{ active: currentPage === 'mantenimiento' }" @click="cambiarPagina('mantenimiento')" v-if="tienePermiso('gestionar_mantenimiento')">
        <span class="nav-icon" v-html="ICONS.mantenimiento"></span> Mantenimiento
      </div>

      <div class="nav-section">INFORMACION</div>
      <div class="nav-item" :class="{ active: currentPage === 'reportes' }" @click="cambiarPagina('reportes')">
        <span class="nav-icon" v-html="ICONS.reportes"></span> Reportes
      </div>
      <div class="nav-item" :class="{ active: currentPage === 'consultas' }" @click="cambiarPagina('consultas')">
        <span class="nav-icon" v-html="ICONS.buscar"></span> Busqueda Avanzada
      </div>
      <!-- HISTORIAL - Solo visible para admin o quien tenga permiso -->
      <div class="nav-item" :class="{ active: currentPage === 'historial' }" @click="cambiarPagina('historial')" v-if="tienePermiso('ver_historial')">
        <span class="nav-icon" v-html="ICONS.historial"></span> Historial
      </div>

      <div class="nav-section" v-if="tienePermiso('gestionar_roles')">ADMINISTRACION</div>
      <div class="nav-item" :class="{ active: currentPage === 'roles' }" @click="cambiarPagina('roles')" v-if="tienePermiso('gestionar_roles')">
        <span class="nav-icon" v-html="ICONS.roles"></span> Gestion de Roles
      </div>

      <div class="user-footer">
        <div class="user-info">
          <div class="user-avatar">{{ avatarIniciales }}</div>
          <div>
            <div class="user-name">{{ nombreUsuario }}</div>
            <div class="user-role">{{ rolUsuario }}</div>
          </div>
        </div>
        <div class="logout-item" @click="cerrarSesion">
          <span class="nav-icon" v-html="ICONS.salir"></span> Cerrar Sesion
        </div>
      </div>
    </aside>

    <main class="main-content">
      <div class="topbar">
        <div>
          <div class="page-title">{{ tituloPagina }}</div>
          <div class="breadcrumb">Inicio / {{ tituloPagina }}</div>
        </div>
        <div class="topbar-badge">
          <span v-if="notificacionesPendientes > 0" class="notif-badge">{{ notificacionesPendientes }}</span>
          {{ nombreCorto }}
        </div>
      </div>

      <!-- ==================== DASHBOARD ==================== -->
      <div v-show="currentPage === 'dashboard'" class="page" :class="{ 'active-page': currentPage === 'dashboard' }">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" v-html="ICONS.archivo"></div>
            <div class="stat-value" id="statTotal">{{ totalActivos }}</div>
            <div class="stat-label">Total Activos</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" v-html="ICONS.check"></div>
            <div class="stat-value" id="statDisp">{{ disponiblesCount }}</div>
            <div class="stat-label">Disponibles</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" v-html="ICONS.equis"></div>
            <div class="stat-value" id="statBaja">{{ bajaCount }}</div>
            <div class="stat-label">Dados de Baja</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" v-html="ICONS.mantenimiento"></div>
            <div class="stat-value" id="statMant">{{ mantenimientoCount }}</div>
            <div class="stat-label">En Mantenimiento</div>
          </div>
        </div>

        <div class="charts-grid">
          <div class="chart-container">
            <h4>Distribucion por Tipo</h4>
            <canvas id="chartTipo"></canvas>
          </div>
          <div class="chart-container">
            <h4>Distribucion por Estado</h4>
            <canvas id="chartEstado"></canvas>
          </div>
          <div class="chart-container">
            <h4>Distribucion por Facultad</h4>
            <canvas id="chartFacultad"></canvas>
          </div>
        </div>

        <!-- NOTIFICACIONES - Solo visibles para admin o quien tenga permiso -->
        <div v-if="notificaciones.length > 0 && tienePermiso('ver_notificaciones')" class="notifications-section">
          <div class="section-header">
            <div class="section-title">Notificaciones</div>
            <button class="btn-outline-sm" @click="marcarTodasLeidas">Marcar todas como leidas</button>
          </div>
          <div class="notifications-list">
            <div v-for="notif in notificacionesFiltradas" :key="notif.id" 
                 class="notification-item" :class="{ unread: !notif.leida, leida: notif.leida }">
              <div class="notif-icon">
                {{ notif.tipo === 'vencimiento' ? 'V' : notif.tipo === 'mantenimiento' ? 'M' : 'A' }}
              </div>
              <div class="notif-content">
                <div class="notif-title">{{ notif.titulo }}</div>
                <div class="notif-desc">{{ notif.descripcion }}</div>
                <div class="notif-fecha">{{ formatFecha(notif.fecha) }}</div>
              </div>
              <button v-if="!notif.leida" class="btn-icon" @click="marcarLeida(notif.id)" title="Marcar como leida">
                OK
              </button>
              <span v-else class="badge badge-gray leida-badge">Leida</span>
            </div>
          </div>
        </div>

        <div class="section-header">
          <div class="section-title">Activos Recientes</div>
          <button class="btn-outline-sm" @click="cambiarPagina('gestionar')">Ver todos →</button>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>CODIGO</th>
                <th>NOMBRE</th>
                <th>TIPO</th>
                <th>RESPONSABLE</th>
                <th>ESTADO</th>
                <th>FACULTAD</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="activo in activosRecientes" :key="activo.id">
                <td>{{ activo.codigo }}</td>
                <td>{{ activo.nombre }}</td>
                <td><span class="badge badge-blue">{{ activo.tipo }}</span></td>
                <td>{{ activo.responsable }}</td>
                <td><span :class="getBadgeClass(activo.estado)">{{ activo.estado }}</span></td>
                <td>{{ activo.facultad }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ==================== GESTION DE ACTIVOS ==================== -->
      <div v-show="currentPage === 'gestionar'" class="page" :class="{ 'active-page': currentPage === 'gestionar' }">
        <div class="filtros-bar">
          <input type="text" v-model="filtros.busqueda" placeholder="Buscar por nombre, codigo, responsable...">
          <select v-model="filtros.tipo">
            <option value="">Todos los tipos</option>
            <option value="Tecnologico">Tecnologico</option>
            <option value="Mobiliario">Mobiliario</option>
            <option value="Vehiculo">Vehiculo</option>
            <option value="Laboratorio">Laboratorio</option>
            <option value="Infraestructura">Infraestructura</option>
          </select>
          <select v-model="filtros.estado">
            <option value="">Todos los estados</option>
            <option value="Bueno">Bueno</option>
            <option value="Regular">Regular</option>
            <option value="En reparacion">En reparacion</option>
            <option value="Dado de baja">Dado de baja</option>
          </select>
          <select v-model="filtros.facultad">
            <option value="">Todas las facultades</option>
            <option value="FACIT">FACIT</option>
            <option value="FCEAC">FCEAC</option>
            <option value="MEDICINA">Medicina</option>
            <option value="DERECHO">Derecho</option>
            <option value="ADMINISTRACION">Administracion</option>
          </select>
          <button class="btn-outline-sm" @click="resetearFiltros">Limpiar</button>
        </div>

        <div class="table-toolbar">
          <div class="toolbar-left">
            <input type="checkbox" id="selectAll" @change="seleccionarTodos($event)">
            <label for="selectAll">Seleccionar todos</label>
          </div>
          <button class="btn-danger" @click="eliminarSeleccionados" v-if="tienePermiso('eliminar_activos')">
            Eliminar seleccionados
          </button>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style="width:30px">#</th>
                <th>CODIGO</th>
                <th>NOMBRE</th>
                <th>TIPO</th>
                <th>MARCA</th>
                <th>RESPONSABLE</th>
                <th>ESTADO</th>
                <th>FACULTAD</th>
                <th v-if="tienePermiso('ver_acciones')" style="text-align:center">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="activo in activosPaginados" :key="activo.id">
                <td><input type="checkbox" class="row-check" :data-id="activo.id" v-if="tienePermiso('eliminar_activos')"></td>
                <td><strong>{{ activo.codigo }}</strong></td>
                <td>{{ activo.nombre }}</td>
                <td><span class="badge badge-blue">{{ activo.tipo }}</span></td>
                <td>{{ activo.marca }}</td>
                <td>{{ activo.responsable }}</td>
                <td><span :class="getBadgeClass(activo.estado)">{{ activo.estado }}</span></td>
                <td>{{ activo.facultad }}</td>
                <td class="acciones" v-if="tienePermiso('ver_acciones')">
                  <button class="btn-accion btn-ver" @click="verDetalle(activo.id)" title="Ver detalles">Ver</button>
                  <button class="btn-accion btn-editar" @click="abrirEditar(activo.id)" title="Editar" v-if="tienePermiso('editar_activos')">Editar</button>
                  <button class="btn-accion btn-eliminar" @click="eliminarActivo(activo.id)" title="Eliminar" v-if="tienePermiso('eliminar_activos')">Eliminar</button>
                </td>
              </tr>
              <tr v-if="activosPaginados.length === 0">
                <td colspan="9" style="text-align:center;padding:2rem;color:#8a9bb0">
                  No hay activos registrados
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <button class="page-btn" @click="cambiarPaginaGestion(1)" :disabled="currentGestionPage === 1">«</button>
          <button class="page-btn" @click="cambiarPaginaGestion(currentGestionPage - 1)" :disabled="currentGestionPage === 1">‹</button>
          <span class="page-info">Pag {{ currentGestionPage }} de {{ totalGestionPages || 1 }}</span>
          <button class="page-btn" @click="cambiarPaginaGestion(currentGestionPage + 1)" :disabled="currentGestionPage >= totalGestionPages">›</button>
          <button class="page-btn" @click="cambiarPaginaGestion(totalGestionPages)" :disabled="currentGestionPage >= totalGestionPages">»</button>
        </div>
      </div>

      <!-- ==================== AGREGAR / EDITAR ACTIVO ==================== -->
      <div v-show="currentPage === 'agregar'" class="page" :class="{ 'active-page': currentPage === 'agregar' }">
        <div class="form-container">
          <div class="form-header">
            <h3>{{ formActivo.id ? 'Editar Activo' : 'Registrar Nuevo Activo' }}</h3>
          </div>
          <div class="form-grid">
            <div class="field">
              <label>Codigo *</label>
              <input id="codigo" v-model="formActivo.codigo" placeholder="UAF-2025-001" @blur="validarCampoActivo('codigo', formActivo.codigo)">
              <div class="error-msg" :class="{ show: errors.codigo }">{{ errors.codigo }}</div>
            </div>
            <div class="field">
              <label>Nombre *</label>
              <input id="nombre" v-model="formActivo.nombre" placeholder="Laptop HP EliteBook" @blur="validarCampoActivo('nombre', formActivo.nombre)">
              <div class="error-msg" :class="{ show: errors.nombre }">{{ errors.nombre }}</div>
            </div>
            <div class="field full-width">
              <label>Descripcion</label>
              <textarea v-model="formActivo.descripcion" rows="2" placeholder="Descripcion detallada del activo..." @blur="validarCampoActivo('descripcion', formActivo.descripcion)"></textarea>
              <div class="error-msg" :class="{ show: errors.descripcion }">{{ errors.descripcion }}</div>
            </div>
            <div class="field">
              <label>Marca *</label>
              <input id="marca" v-model="formActivo.marca" placeholder="HP, Dell, Lenovo" @blur="validarCampoActivo('marca', formActivo.marca)">
              <div class="error-msg" :class="{ show: errors.marca }">{{ errors.marca }}</div>
            </div>
            <div class="field">
              <label>Modelo</label>
              <input v-model="formActivo.modelo" placeholder="EliteBook 840 G8" @blur="validarCampoActivo('modelo', formActivo.modelo)">
              <div class="error-msg" :class="{ show: errors.modelo }">{{ errors.modelo }}</div>
            </div>
            <div class="field">
              <label>Color</label>
              <input v-model="formActivo.color" placeholder="Negro, Plata" @blur="validarCampoActivo('color', formActivo.color)">
              <div class="error-msg" :class="{ show: errors.color }">{{ errors.color }}</div>
            </div>
            <div class="field">
              <label>Serie</label>
              <input v-model="formActivo.serie" placeholder="SN-XXXXXX" @blur="validarCampoActivo('serie', formActivo.serie)">
              <div class="error-msg" :class="{ show: errors.serie }">{{ errors.serie }}</div>
            </div>
            <div class="field">
              <label>Responsable *</label>
              <input id="responsable" v-model="formActivo.responsable" placeholder="Nombre del custodio" @blur="validarCampoActivo('responsable', formActivo.responsable)">
              <div class="error-msg" :class="{ show: errors.responsable }">{{ errors.responsable }}</div>
            </div>
            <div class="field">
              <label>Tipo *</label>
              <select v-model="formActivo.tipo" @change="validarCampoActivo('tipo', formActivo.tipo)">
                <option value="">Seleccione</option>
                <option>Tecnologico</option>
                <option>Mobiliario</option>
                <option>Vehiculo</option>
                <option>Laboratorio</option>
                <option>Infraestructura</option>
              </select>
              <div class="error-msg" :class="{ show: errors.tipo }">{{ errors.tipo }}</div>
            </div>
            <div class="field">
              <label>Estado *</label>
              <select v-model="formActivo.estado" @change="validarCampoActivo('estado', formActivo.estado)">
                <option value="">Seleccione</option>
                <option>Bueno</option>
                <option>Regular</option>
                <option>En reparacion</option>
                <option>Dado de baja</option>
              </select>
              <div class="error-msg" :class="{ show: errors.estado }">{{ errors.estado }}</div>
            </div>
            <div class="field">
              <label>Fecha de Compra</label>
              <input v-model="formActivo.fechaCompra" type="date">
            </div>
            <div class="field">
              <label>Valor ($)</label>
              <input v-model.number="formActivo.valor" type="number" step="0.01" placeholder="0.00" @blur="validarCampoActivo('valor', formActivo.valor)">
              <div class="error-msg" :class="{ show: errors.valor }">{{ errors.valor }}</div>
            </div>
            <div class="field">
              <label>Facultad *</label>
              <select v-model="formActivo.facultad" @change="validarCampoActivo('facultad', formActivo.facultad)">
                <option value="">Seleccione</option>
                <option value="FACIT">FACIT</option>
                <option value="FCEAC">FCEAC</option>
                <option value="MEDICINA">Medicina</option>
                <option value="DERECHO">Derecho</option>
                <option value="ADMINISTRACION">Administracion</option>
              </select>
              <div class="error-msg" :class="{ show: errors.facultad }">{{ errors.facultad }}</div>
            </div>
            <div class="field">
              <label>Ubicacion</label>
              <input v-model="formActivo.ubicacion" placeholder="Aula 3B, Bloque A" @blur="validarCampoActivo('ubicacion', formActivo.ubicacion)">
              <div class="error-msg" :class="{ show: errors.ubicacion }">{{ errors.ubicacion }}</div>
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-outline" @click="limpiarFormulario">Limpiar</button>
            <button class="btn-primary" @click="guardarActivo">Guardar Activo</button>
          </div>
        </div>
      </div>

      <!-- ==================== ASIGNACION DE ACTIVOS ==================== -->
      <div v-show="currentPage === 'asignacion'" class="page" :class="{ 'active-page': currentPage === 'asignacion' }">
        <div class="form-container">
          <div class="form-header">
            <h3>Asignacion de Activos</h3>
          </div>
          <div class="form-grid">
            <div class="field">
              <label>Activo *</label>
              <select v-model="asignacion.activoId">
                <option value="">Seleccione</option>
                <option v-for="a in activosDisponibles" :key="a.id" :value="a.id">{{ a.codigo }} - {{ a.nombre }}</option>
              </select>
            </div>
            <div class="field">
              <label>Responsable *</label>
              <input v-model="asignacion.responsable" placeholder="Nombre del responsable" @blur="validarCampoAsignacion('responsable', asignacion.responsable)">
              <div class="error-msg" :class="{ show: errosAsignacion.responsable }">{{ errosAsignacion.responsable }}</div>
            </div>
            <div class="field">
              <label>Fecha de Asignacion *</label>
              <input v-model="asignacion.fechaAsignacion" type="date">
            </div>
            <div class="field">
              <label>Fecha de Devolucion</label>
              <input v-model="asignacion.fechaDevolucion" type="date">
            </div>
            <div class="field full-width">
              <label>Observaciones</label>
              <textarea v-model="asignacion.observaciones" rows="2" placeholder="Observaciones..." @blur="validarCampoAsignacion('observaciones', asignacion.observaciones)"></textarea>
              <div class="error-msg" :class="{ show: errosAsignacion.observaciones }">{{ errosAsignacion.observaciones }}</div>
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-outline" @click="limpiarAsignacion">Limpiar</button>
            <button class="btn-primary" @click="guardarAsignacion">Asignar Activo</button>
          </div>
        </div>

        <div class="section-header" style="margin-top:1.5rem">
          <div class="section-title">Activos Asignados</div>
        </div>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ACTIVO</th>
                <th>RESPONSABLE</th>
                <th>FECHA ASIGNACION</th>
                <th>FECHA DEVOLUCION</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="asig in asignaciones" :key="asig.id">
                <td>{{ asig.activoNombre }}</td>
                <td>{{ asig.responsable }}</td>
                <td>{{ asig.fechaAsignacion }}</td>
                <td>{{ asig.fechaDevolucion || 'Pendiente' }}</td>
                <td><span :class="getBadgeClass(asig.estadoAsignacion)">{{ asig.estadoAsignacion }}</span></td>
                <td>
                  <button class="btn-accion btn-devolver" @click="devolverActivo(asig.id)" title="Devolver" v-if="asig.estadoAsignacion === 'Activo'">Devolver</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ==================== MANTENIMIENTO ==================== -->
      <div v-show="currentPage === 'mantenimiento'" class="page" :class="{ 'active-page': currentPage === 'mantenimiento' }">
        <div class="form-container">
          <div class="form-header">
            <h3>Registrar Mantenimiento</h3>
          </div>
          <div class="form-grid">
            <div class="field">
              <label>Activo *</label>
              <select v-model="mantenimiento.activoId">
                <option value="">Seleccione</option>
                <option v-for="a in activos" :key="a.id" :value="a.id">{{ a.codigo }} - {{ a.nombre }}</option>
              </select>
            </div>
            <div class="field">
              <label>Tipo de Mantenimiento *</label>
              <select v-model="mantenimiento.tipo">
                <option value="">Seleccione</option>
                <option>Preventivo</option>
                <option>Correctivo</option>
                <option>Predictivo</option>
              </select>
            </div>
            <div class="field">
              <label>Fecha de Mantenimiento *</label>
              <input v-model="mantenimiento.fecha" type="date">
            </div>
            <div class="field">
              <label>Costo ($)</label>
              <input v-model.number="mantenimiento.costo" type="number" step="0.01" placeholder="0.00">
            </div>
            <div class="field full-width">
              <label>Descripcion</label>
              <textarea v-model="mantenimiento.descripcion" rows="2" placeholder="Descripcion del mantenimiento..." @blur="validarCampoMantenimiento('descripcion', mantenimiento.descripcion)"></textarea>
              <div class="error-msg" :class="{ show: erroresMantenimiento.descripcion }">{{ erroresMantenimiento.descripcion }}</div>
            </div>
            <div class="field full-width">
              <label>Tecnico Responsable</label>
              <input v-model="mantenimiento.tecnico" placeholder="Nombre del tecnico" @blur="validarCampoMantenimiento('tecnico', mantenimiento.tecnico)">
              <div class="error-msg" :class="{ show: erroresMantenimiento.tecnico }">{{ erroresMantenimiento.tecnico }}</div>
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-outline" @click="limpiarMantenimiento">Limpiar</button>
            <button class="btn-primary" @click="guardarMantenimiento">Registrar Mantenimiento</button>
          </div>
        </div>

        <div class="section-header" style="margin-top:1.5rem">
          <div class="section-title">Historial de Mantenimiento</div>
        </div>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ACTIVO</th>
                <th>TIPO</th>
                <th>FECHA</th>
                <th>COSTO</th>
                <th>DESCRIPCION</th>
                <th>TECNICO</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in mantenimientos" :key="m.id">
                <td>{{ m.activoNombre }}</td>
                <td><span class="badge badge-blue">{{ m.tipo }}</span></td>
                <td>{{ m.fecha }}</td>
                <td>${{ m.costo.toFixed(2) }}</td>
                <td>{{ m.descripcion }}</td>
                <td>{{ m.tecnico || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ==================== REPORTES ==================== -->
      <div v-show="currentPage === 'reportes'" class="page" :class="{ 'active-page': currentPage === 'reportes' }">
        <div class="report-cards">
          <div class="report-card" @click="exportarCSV">
            <div class="report-icon">C</div>
            <h4>Exportar a CSV</h4>
            <p>Descarga todos los activos en formato CSV</p>
          </div>
          <div class="report-card" @click="imprimirReporte">
            <div class="report-icon">P</div>
            <h4>Imprimir Reporte</h4>
            <p>Genera un reporte imprimible</p>
          </div>
          <div class="report-card" @click="mostrarResumenEstadistico">
            <div class="report-icon">R</div>
            <h4>Resumen Estadistico</h4>
            <p>Distribucion por tipo, estado y facultad</p>
          </div>
          <div class="report-card" @click="exportarPDF">
            <div class="report-icon">F</div>
            <h4>Exportar a PDF</h4>
            <p>Genera un reporte en formato PDF</p>
          </div>
          <div class="report-card" @click="exportarExcel">
            <div class="report-icon">X</div>
            <h4>Exportar a Excel</h4>
            <p>Descarga en formato Excel (XLSX)</p>
          </div>
        </div>
        
        <div class="filtros-bar" style="margin-bottom:1rem">
          <select v-model="reporteFiltros.tipo">
            <option value="">Todos los tipos</option>
            <option value="Tecnologico">Tecnologico</option>
            <option value="Mobiliario">Mobiliario</option>
            <option value="Vehiculo">Vehiculo</option>
            <option value="Laboratorio">Laboratorio</option>
            <option value="Infraestructura">Infraestructura</option>
          </select>
          <select v-model="reporteFiltros.estado">
            <option value="">Todos los estados</option>
            <option value="Bueno">Bueno</option>
            <option value="Regular">Regular</option>
            <option value="En reparacion">En reparacion</option>
            <option value="Dado de baja">Dado de baja</option>
          </select>
          <select v-model="reporteFiltros.facultad">
            <option value="">Todas las facultades</option>
            <option value="FACIT">FACIT</option>
            <option value="FCEAC">FCEAC</option>
            <option value="MEDICINA">Medicina</option>
            <option value="DERECHO">Derecho</option>
            <option value="ADMINISTRACION">Administracion</option>
          </select>
          <button class="btn-outline-sm" @click="aplicarFiltrosReporte">Aplicar Filtros</button>
          <button class="btn-outline-sm" @click="resetearFiltrosReporte">Limpiar</button>
        </div>

        <div v-show="mostrarResumen" class="resumen-container">
          <div class="resumen-grid">
            <div class="resumen-card">
              <h4>Por Tipo</h4>
              <table>
                <tr v-for="(count, tipo) in resumenPorTipo" :key="tipo">
                  <td>{{ tipo }}</td>
                  <td><strong>{{ count }}</strong></td>
                </tr>
              </table>
            </div>
            <div class="resumen-card">
              <h4>Por Estado</h4>
              <table>
                <tr v-for="(count, estado) in resumenPorEstado" :key="estado">
                  <td>{{ estado }}</td>
                  <td><strong>{{ count }}</strong></td>
                </tr>
              </table>
            </div>
            <div class="resumen-card">
              <h4>Por Facultad</h4>
              <table>
                <tr v-for="(count, facultad) in resumenPorFacultad" :key="facultad">
                  <td>{{ facultad }}</td>
                  <td><strong>{{ count }}</strong></td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <div v-show="mostrarResumen" class="resumen-container" style="margin-top:1rem">
          <div class="resumen-grid">
            <div class="resumen-card">
              <h4>Valor Total</h4>
              <p style="font-size:1.5rem;font-weight:700;color:#1c4e70">${{ valorTotalActivos.toFixed(2) }}</p>
            </div>
            <div class="resumen-card">
              <h4>Promedio de Valor</h4>
              <p style="font-size:1.5rem;font-weight:700;color:#1c4e70">${{ valorPromedio.toFixed(2) }}</p>
            </div>
            <div class="resumen-card">
              <h4>Activos mas Valiosos</h4>
              <ul>
                <li v-for="a in activosMasValiosos" :key="a.id">{{ a.nombre }}: ${{ a.valor.toFixed(2) }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== BUSQUEDA AVANZADA ==================== -->
      <div v-show="currentPage === 'consultas'" class="page" :class="{ 'active-page': currentPage === 'consultas' }">
        <div class="consulta-container">
          <h3>Busqueda Avanzada</h3>
          <div class="consulta-grid">
            <div class="field">
              <label>Codigo</label>
              <input v-model="consulta.codigo" placeholder="UAF-...">
            </div>
            <div class="field">
              <label>Nombre</label>
              <input v-model="consulta.nombre" placeholder="Nombre del activo">
            </div>
            <div class="field">
              <label>Serie</label>
              <input v-model="consulta.serie" placeholder="SN-...">
            </div>
            <div class="field">
              <label>Responsable</label>
              <input v-model="consulta.responsable" placeholder="Nombre">
            </div>
            <div class="field">
              <label>Estado</label>
              <select v-model="consulta.estado">
                <option value="">Todos</option>
                <option>Bueno</option>
                <option>Regular</option>
                <option>En reparacion</option>
                <option>Dado de baja</option>
              </select>
            </div>
            <div class="field">
              <label>Facultad</label>
              <select v-model="consulta.facultad">
                <option value="">Todas</option>
                <option value="FACIT">FACIT</option>
                <option value="FCEAC">FCEAC</option>
                <option value="MEDICINA">Medicina</option>
                <option value="DERECHO">Derecho</option>
                <option value="ADMINISTRACION">Administracion</option>
              </select>
            </div>
            <div class="field">
              <label>Rango de Valor Min</label>
              <input v-model.number="consulta.valorMin" type="number" step="0.01" placeholder="0">
            </div>
            <div class="field">
              <label>Rango de Valor Max</label>
              <input v-model.number="consulta.valorMax" type="number" step="0.01" placeholder="99999">
            </div>
          </div>
          <button class="btn-primary" @click="ejecutarConsulta" style="width:100%">Ejecutar Consulta</button>
          <div v-show="resultadosConsulta.length > 0" class="resultados-container" style="margin-top:1.5rem">
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>CODIGO</th>
                    <th>NOMBRE</th>
                    <th>TIPO</th>
                    <th>ESTADO</th>
                    <th>RESPONSABLE</th>
                    <th>FACULTAD</th>
                    <th>VALOR</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="activo in resultadosConsulta" :key="activo.id">
                    <td>{{ activo.codigo }}</td>
                    <td>{{ activo.nombre }}</td>
                    <td><span class="badge badge-blue">{{ activo.tipo }}</span></td>
                    <td><span :class="getBadgeClass(activo.estado)">{{ activo.estado }}</span></td>
                    <td>{{ activo.responsable }}</td>
                    <td>{{ activo.facultad }}</td>
                    <td>${{ activo.valor.toFixed(2) }}</td>
                    <td><button class="btn-accion btn-ver" @click="verDetalle(activo.id)">Ver</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-show="consultaSinResultados" class="table-wrapper" style="padding:2rem;text-align:center;margin-top:1.5rem">No se encontraron resultados</div>
        </div>
      </div>

      <!-- ==================== HISTORIAL (SOLO ADMIN) ==================== -->
      <div v-show="currentPage === 'historial'" class="page" :class="{ 'active-page': currentPage === 'historial' }">
        <div class="historial-container">
          <h3>Historial de Movimientos</h3>
          <p style="font-size:0.8rem;color:#6c7a8a;margin-bottom:1rem">
            Registro de todas las acciones realizadas en el sistema
          </p>
          <div class="filtros-bar">
            <input type="text" v-model="historialFiltros.busqueda" placeholder="Buscar por activo, responsable...">
            <select v-model="historialFiltros.tipo">
              <option value="">Todos los tipos</option>
              <option value="creacion">Creacion</option>
              <option value="edicion">Edicion</option>
              <option value="eliminacion">Eliminacion</option>
              <option value="asignacion">Asignacion</option>
              <option value="devolucion">Devolucion</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
            <button class="btn-outline-sm" @click="resetearFiltrosHistorial">Limpiar</button>
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>FECHA</th>
                  <th>ACTIVO</th>
                  <th>TIPO</th>
                  <th>RESPONSABLE</th>
                  <th>DESCRIPCION</th>
                  <th>USUARIO</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="mov in historialFiltrado" :key="mov.id">
                  <td>{{ formatFecha(mov.fecha) }}</td>
                  <td>{{ mov.activoNombre }}</td>
                  <td><span class="badge badge-blue">{{ mov.tipo }}</span></td>
                  <td>{{ mov.responsable }}</td>
                  <td>{{ mov.descripcion }}</td>
                  <td>{{ mov.usuario }}</td>
                </tr>
                <tr v-if="historialFiltrado.length === 0">
                  <td colspan="6" style="text-align:center;padding:2rem">No hay registros en el historial</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ==================== GESTION DE ROLES (SOLO ADMIN) ==================== -->
      <div v-show="currentPage === 'roles'" class="page" :class="{ 'active-page': currentPage === 'roles' }">
        <div class="form-container">
          <div class="form-header">
            <h3>Gestion de Roles y Permisos</h3>
            <p style="font-size:0.8rem;color:#6c7a8a;margin-top:0.25rem">
              Asigna roles a los usuarios para controlar sus permisos en el sistema
            </p>
          </div>
          <div class="roles-grid">
            <div v-for="usuario in usuariosSistema" :key="usuario.id" class="role-item">
              <div class="role-info">
                <strong>{{ usuario.nombres }}</strong>
                <br>
                <span class="role-email">{{ usuario.email }}</span>
              </div>
              <div class="role-select">
                <select v-model="usuario.rol" @change="actualizarRol(usuario)">
                  <option v-for="rol in rolesDisponibles" :key="rol" :value="rol">{{ obtenerNombreRol(rol) }}</option>
                </select>
              </div>
              <div class="role-permisos">
                <span v-for="perm in obtenerPermisos(usuario.rol)" :key="perm" class="badge badge-blue">{{ perm }}</span>
              </div>
              <div class="role-actions">
                <button v-if="usuario.id !== 1" class="btn-eliminar-usuario" @click="eliminarUsuario(usuario.id)" title="Eliminar usuario">
                  Eliminar
                </button>
                <span v-else class="role-badge-admin">Administrador</span>
              </div>
            </div>
            <div v-if="usuariosSistema.length === 0" style="text-align:center;padding:2rem;color:#8a9bb0">
              No hay usuarios registrados en el sistema
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- ==================== MODAL REGISTRO ==================== -->
  <!-- Estos modales se movieron DENTRO de #app: Vue solo compila
       directivas (v-model, :class, @click, {{ }}...) en elementos que
       estan dentro del elemento raiz montado con app.mount('#app').
       Antes estaban fuera y por eso no reaccionaban. -->
  <div id="modalRegistro" class="modal-overlay" :class="{ 'open': mostrarModalRegistro }">
  <div class="modal">
    <div class="modal-header">
      <h3>Registro de Nuevo Usuario</h3>
      <button class="modal-close" @click="cerrarModalRegistro">✕</button>
    </div>
    
    <div class="input-group">
      <label>Nombres Completos *</label>
      <input type="text" v-model="registro.nombres" placeholder="Ej: Ing. Juan Carlos Perez Rodriguez">
      <div style="font-size:0.65rem;color:#6c7a8a;margin-top:0.2rem">
        Debe incluir título profesional: Ing., Dr., Lcdo., Lcda., Mgtr., Msc., Arq., etc.
      </div>
      <div class="error-msg" :class="{ show: registroErrores.nombres }">{{ registroErrores.nombres }}</div>
    </div>
    
    <div class="input-group">
      <label>Correo Electronico *</label>
      <input type="email" v-model="registro.email" placeholder="usuario@uleam.edu.ec">
      <div class="error-msg" :class="{ show: registroErrores.email }">{{ registroErrores.email }}</div>
    </div>
    
    <div class="input-group">
      <label>Numero de Cedula (Ecuador)</label>
      <input type="text" v-model="registro.cedula" placeholder="1234567890" maxlength="10">
      <div class="error-msg" :class="{ show: registroErrores.cedula }">{{ registroErrores.cedula }}</div>
    </div>
    
    <div class="input-group">
      <label>Telefono / Celular</label>
      <input type="tel" v-model="registro.telefono" placeholder="0999999999">
      <div class="error-msg" :class="{ show: registroErrores.telefono }">{{ registroErrores.telefono }}</div>
    </div>
    
    <div class="input-group">
      <label>Rol en el Sistema *</label>
      <select v-model="registro.rol">
        <option value="usuario">Usuario - Visualizacion basica</option>
        <option value="gestor">Gestor de Activos - Gestion completa</option>
        <option value="admin">Administrador - Acceso total</option>
      </select>
      <div style="font-size:0.65rem;color:#6c7a8a;margin-top:0.3rem">
        <strong>Usuario:</strong> Solo visualizacion y consultas<br>
        <strong>Gestor:</strong> Crear, editar, asignar y gestionar mantenimientos<br>
        <strong>Administrador:</strong> Todos los permisos incluyendo gestion de roles
      </div>
    </div>
    
    <div class="input-group">
      <label>Facultad / Departamento</label>
      <select v-model="registro.facultad">
        <option value="FACIT">FACIT - Ciencias Informaticas</option>
        <option value="FCEAC">FCEAC - Ciencias Economicas</option>
        <option value="MEDICINA">Medicina</option>
        <option value="DERECHO">Derecho</option>
        <option value="ADMINISTRACION">Administracion</option>
      </select>
    </div>
    
    <div class="input-group">
      <label>Contraseña *</label>
      <div class="password-wrapper">
        <input type="password" id="regPassword" v-model="registro.password" placeholder="Minimo 8 caracteres, 1 mayuscula y 1 numero">
        <button type="button" class="toggle-password" @click="togglePassword('regPassword', $event)">Mostrar</button>
      </div>
      <div class="password-requirements">
        <small>Requisitos:</small>
        <ul>
          <li :class="{ valid: registro.password.length >= 8 }">{{ registro.password.length >= 8 ? '✓' : '✗' }} Minimo 8 caracteres</li>
          <li :class="{ valid: /[A-Z]/.test(registro.password) }">{{ /[A-Z]/.test(registro.password) ? '✓' : '✗' }} Al menos una mayuscula</li>
          <li :class="{ valid: /[a-z]/.test(registro.password) }">{{ /[a-z]/.test(registro.password) ? '✓' : '✗' }} Al menos una minuscula</li>
          <li :class="{ valid: /\d/.test(registro.password) }">{{ /\d/.test(registro.password) ? '✓' : '✗' }} Al menos un numero</li>
        </ul>
      </div>
      <div class="error-msg" :class="{ show: registroErrores.password }">{{ registroErrores.password }}</div>
    </div>
    
    <div class="input-group">
      <label>Confirmar Contraseña *</label>
      <div class="password-wrapper">
        <input type="password" id="regConfirm" v-model="registro.confirm" placeholder="Repite tu contraseña">
        <button type="button" class="toggle-password" @click="togglePassword('regConfirm', $event)">Mostrar</button>
      </div>
      <div class="error-msg" :class="{ show: registroErrores.confirm }">{{ registroErrores.confirm }}</div>
    </div>
    
    <div class="input-group">
      <label class="checkbox-label">
        <input type="checkbox" v-model="registro.terms"> 
        Acepto los terminos y condiciones de la ULEAM
      </label>
      <div class="error-msg" :class="{ show: registroErrores.terms }">{{ registroErrores.terms }}</div>
    </div>
    
    <div class="modal-footer">
      <button class="btn-register" @click="cerrarModalRegistro">Cancelar</button>
      <button class="btn-login" @click="registrarUsuario">Registrarse</button>
    </div>
  </div>
</div>

  <!-- ==================== MODAL CONFIRMACION ==================== -->
  <div id="confirmOverlay" class="modal-overlay" :class="{ open: mostrarConfirmacion }">
    <div class="modal modal-confirm">
      <div style="text-align:center;margin-bottom:1rem">
        <span style="font-size:3rem">{{ confirmacion.icono }}</span>
        <h3 style="margin-top:0.5rem">{{ confirmacion.titulo }}</h3>
      </div>
      <p style="text-align:center;color:#4a5a6e;margin-bottom:1.5rem" v-html="confirmacion.mensaje"></p>
      <div class="modal-footer" style="justify-content:center">
        <button class="btn-register" @click="cerrarConfirmacion">Cancelar</button>
        <button class="btn-login" @click="ejecutarConfirmacion" :style="{ background: confirmacion.color }">
          {{ confirmacion.boton }}
        </button>
      </div>
    </div>
  </div>

</template>

<script>
// ========== js/app.js ==========
import { ref, computed, watch, onMounted, reactive, nextTick } from 'vue';
import { store, getBadgeClass } from './store.js';
import { obtenerPermisos, obtenerNombreRol, tienePermiso, rolesDisponibles } from './roles.js';
import { 
  validarCedulaEcuador, 
  validarEmailUleam, 
  validarNombres, 
  validarTelefonoEcuador, 
  isEmailUnique,
  validarTitulo,
  extraerTitulo,
  PASSWORD_REGEX,
  CODIGO_REGEX
} from './validations.js';
import { mostrarToast, animarContador } from './utils.js';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// ==================== ICONOS ====================
// Set de iconos de línea simples (estilo "outline"), sin emojis.
// Usan currentColor para heredar el color del texto del elemento padre.
const svgIcon = (inner) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

const ICONS = {
  dashboard: svgIcon('<rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><rect x="14" y="14" width="7" height="7" rx="1.2"/>'),
  lista: svgIcon('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>'),
  agregar: svgIcon('<rect x="3" y="3" width="18" height="18" rx="2.2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>'),
  asignar: svgIcon('<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>'),
  mantenimiento: svgIcon('<circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M1 12h4M19 12h4M4.2 19.8l2.8-2.8M17 7l2.8-2.8"/>'),
  reportes: svgIcon('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'),
  buscar: svgIcon('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'),
  historial: svgIcon('<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>'),
  roles: svgIcon('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
  salir: svgIcon('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'),
  archivo: svgIcon('<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>'),
  check: svgIcon('<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'),
  equis: svgIcon('<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>')
};


// ==================== FUNCIONES GLOBALES PARA EL MODAL ====================
window.abrirModalDetalle = function(activoData) {
  console.log('🟢 abrirModalDetalle llamado con:', activoData);
  
  const modal = document.getElementById('modalDetalle');
  const content = document.getElementById('detalleContent');
  
  if (!modal || !content) {
    console.error('❌ Modal o contenido no encontrado');
    mostrarToast("Error: Modal no encontrado", "error");
    return;
  }
  
  const badgeMap = {
    "Bueno": "badge-green",
    "Regular": "badge-amber",
    "Dado de baja": "badge-gray",
    "En reparacion": "badge-red",
    "Activo": "badge-green",
    "Devuelto": "badge-gray"
  };
  const estadoBadge = badgeMap[activoData.estado] || "badge-gray";
  
  const html = `
    <div class="detalle-item">
      <label>Código</label>
      <span>${activoData.codigo || 'N/A'}</span>
    </div>
    <div class="detalle-item">
      <label>Nombre</label>
      <span>${activoData.nombre || 'N/A'}</span>
    </div>
    <div class="detalle-item">
      <label>Descripción</label>
      <span>${activoData.descripcion || 'N/A'}</span>
    </div>
    <div class="detalle-item">
      <label>Marca</label>
      <span>${activoData.marca || 'N/A'}</span>
    </div>
    <div class="detalle-item">
      <label>Modelo</label>
      <span>${activoData.modelo || 'N/A'}</span>
    </div>
    <div class="detalle-item">
      <label>Color</label>
      <span>${activoData.color || 'N/A'}</span>
    </div>
    <div class="detalle-item">
      <label>Serie</label>
      <span>${activoData.serie || 'N/A'}</span>
    </div>
    <div class="detalle-item">
      <label>Responsable</label>
      <span>${activoData.responsable || 'N/A'}</span>
    </div>
    <div class="detalle-item">
      <label>Tipo</label>
      <span>${activoData.tipo || 'N/A'}</span>
    </div>
    <div class="detalle-item">
      <label>Estado</label>
      <span class="badge ${estadoBadge}">${activoData.estado || 'N/A'}</span>
    </div>
    <div class="detalle-item">
      <label>Fecha Compra</label>
      <span>${activoData.fechaCompra || 'N/A'}</span>
    </div>
    <div class="detalle-item">
      <label>Valor</label>
      <span>$${(activoData.valor || 0).toFixed(2)}</span>
    </div>
    <div class="detalle-item">
      <label>Facultad</label>
      <span>${activoData.facultad || 'N/A'}</span>
    </div>
    <div class="detalle-item">
      <label>Ubicación</label>
      <span>${activoData.ubicacion || 'N/A'}</span>
    </div>
  `;
  
  content.innerHTML = html;
  modal.style.display = 'flex';
  console.log('✅ Modal abierto');
};

window.cerrarModalDetalle = function() {
  const modal = document.getElementById('modalDetalle');
  if (modal) {
    modal.style.display = 'none';
    console.log('✅ Modal cerrado');
  }
};

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    window.cerrarModalDetalle();
  }
});

document.addEventListener('click', function(e) {
  const modal = document.getElementById('modalDetalle');
  if (modal && modal.style.display === 'flex') {
    if (e.target === modal) {
      window.cerrarModalDetalle();
    }
  }
});

export default {
  name: 'App',
  setup() {
    // ==================== ESTADO ====================
    const usuarioActual = ref(null);
    const loginEmail = ref('admin@uleam.edu.ec');
    const loginPassword = ref('Admin123');
    const loginErrors = reactive({ email: '', password: '' });
    
    const currentPage = ref('dashboard');
    const currentGestionPage = ref(1);
    const itemsPerPage = ref(5);
    
    const mostrarModalRegistro = ref(false);
    const mostrarDetalle = ref(false);
    const mostrarConfirmacion = ref(false);
    const detalleActivo = ref(null);
    
    const confirmacion = reactive({
      titulo: 'Confirmar',
      icono: '?',
      mensaje: '',
      boton: 'Confirmar',
      color: '#c7362b',
      callback: null
    });
    
    const formActivo = reactive({
      id: null,
      codigo: '',
      nombre: '',
      descripcion: '',
      marca: '',
      modelo: '',
      color: '',
      serie: '',
      responsable: '',
      tipo: '',
      estado: '',
      fechaCompra: '',
      valor: 0,
      facultad: '',
      ubicacion: ''
    });
    
    const errors = reactive({
      codigo: '', nombre: '', marca: '', responsable: '', 
      tipo: '', estado: '', facultad: '', valor: '',
      descripcion: '', modelo: '', color: '', serie: '', ubicacion: ''
    });
    
    const filtros = reactive({
      busqueda: '',
      tipo: '',
      estado: '',
      facultad: ''
    });
    
    const asignacion = reactive({
      activoId: '',
      responsable: '',
      fechaAsignacion: '',
      fechaDevolucion: '',
      observaciones: ''
    });
    
    const errosAsignacion = reactive({ responsable: '', observaciones: '' });
    
    const validarCampoAsignacion = (campo, valor) => {
      if (campo === 'responsable') {
        errosAsignacion.responsable = (valor && valor.length < 3) ? "Minimo 3 caracteres" : "";
        return !errosAsignacion.responsable;
      }
      if (campo === 'observaciones') {
        errosAsignacion.observaciones = (valor && valor.length > 300) ? "Maximo 300 caracteres" : "";
        return !errosAsignacion.observaciones;
      }
      return true;
    };
    
    const mantenimiento = reactive({
      activoId: '',
      tipo: '',
      fecha: '',
      costo: 0,
      descripcion: '',
      tecnico: ''
    });
    
    const erroresMantenimiento = reactive({ descripcion: '', tecnico: '' });
    
    const validarCampoMantenimiento = (campo, valor) => {
      if (campo === 'descripcion') {
        erroresMantenimiento.descripcion = (valor && valor.length > 300) ? "Maximo 300 caracteres" : "";
        return !erroresMantenimiento.descripcion;
      }
      if (campo === 'tecnico') {
        erroresMantenimiento.tecnico = (valor && valor.length > 60) ? "Maximo 60 caracteres" : "";
        return !erroresMantenimiento.tecnico;
      }
      return true;
    };
    
    const consulta = reactive({
      codigo: '',
      nombre: '',
      serie: '',
      responsable: '',
      estado: '',
      facultad: '',
      valorMin: null,
      valorMax: null
    });
    
    const resultadosConsulta = ref([]);
    const consultaSinResultados = ref(false);
    const mostrarResumen = ref(false);
    
    const reporteFiltros = reactive({
      tipo: '',
      estado: '',
      facultad: ''
    });
    
    const historialFiltros = reactive({
      busqueda: '',
      tipo: ''
    });
    
    const registro = reactive({
      nombres: '',
      email: '',
      cedula: '',
      telefono: '',
      password: '',
      confirm: '',
      rol: 'usuario',
      facultad: 'FACIT',
      terms: false
    });
    
    const registroErrores = reactive({
      nombres: '',
      email: '',
      cedula: '',
      telefono: '',
      password: '',
      confirm: '',
      terms: ''
    });

    // ==================== DATA REACTIVA DEL STORE ====================
    const activosData = ref([]);
    const asignacionesData = ref([]);
    const mantenimientosData = ref([]);
    const historialData = ref([]);
    const notificacionesData = ref([]);
    const usuariosData = ref([]);

    const sincronizarDatos = () => {
      activosData.value = [...store.activos];
      asignacionesData.value = [...store.asignaciones];
      mantenimientosData.value = [...store.mantenimientos];
      historialData.value = [...store.historial];
      notificacionesData.value = [...store.notificaciones];
      usuariosData.value = [...store.usuarios];
    };

    const onStoreChange = () => {
      sincronizarDatos();
      nextTick(() => {
        if (currentPage.value === 'dashboard') {
          setTimeout(renderizarGraficos, 300);
        }
      });
    };

    // ==================== COMPUTED ====================
    const activos = computed(() => activosData.value);
    const asignaciones = computed(() => asignacionesData.value);
    const mantenimientos = computed(() => mantenimientosData.value);
    const historial = computed(() => historialData.value);
    const notificaciones = computed(() => notificacionesData.value);
    const usuariosSistema = computed(() => usuariosData.value.filter(u => u.activo !== false));
    const rolesDisponiblesList = computed(() => rolesDisponibles());
    
    const totalActivos = computed(() => activosData.value.length);
    const disponiblesCount = computed(() => activosData.value.filter(a => a.estado === "Bueno").length);
    const bajaCount = computed(() => activosData.value.filter(a => a.estado === "Dado de baja").length);
    const mantenimientoCount = computed(() => activosData.value.filter(a => a.estado === "En reparacion").length);
    
    const activosRecientes = computed(() => [...activosData.value].slice(-5).reverse());
    
    const nombreUsuario = computed(() => {
      if (!usuarioActual.value) return "Invitado";
      const nombres = usuarioActual.value.nombres.split(" ");
      // Si tiene título, mostrar título + primer nombre
      if (nombres.length >= 2) {
        const titulo = nombres[0];
        const nombre = nombres[1];
        return titulo + ' ' + nombre;
      }
      return usuarioActual.value.nombres.split(" ")[0];
    });
    
    const nombreCorto = computed(() => {
      if (!usuarioActual.value) return "invitado";
      return usuarioActual.value.nombres.split(" ")[0];
    });
    
    const avatarIniciales = computed(() => {
      if (!usuarioActual.value) return "IN";
      const nombre = usuarioActual.value.nombres;
      const palabras = nombre.split(" ");
      if (palabras.length >= 2) {
        return (palabras[0][0] + palabras[1][0]).toUpperCase();
      }
      return nombre.substring(0, 2).toUpperCase();
    });
    
    const rolUsuario = computed(() => {
      if (!usuarioActual.value) return 'Invitado';
      return obtenerNombreRol(usuarioActual.value.rol) || 'Usuario';
    });
    
    const activosFiltrados = computed(() => {
      let result = [...activosData.value];
      const busqueda = filtros.busqueda.toLowerCase();
      if (busqueda) {
        result = result.filter(a => 
          a.codigo.toLowerCase().includes(busqueda) || 
          a.nombre.toLowerCase().includes(busqueda) || 
          a.responsable.toLowerCase().includes(busqueda)
        );
      }
      if (filtros.tipo) result = result.filter(a => a.tipo === filtros.tipo);
      if (filtros.estado) result = result.filter(a => a.estado === filtros.estado);
      if (filtros.facultad) result = result.filter(a => a.facultad === filtros.facultad);
      return result;
    });
    
    const totalGestionPages = computed(() => Math.ceil(activosFiltrados.value.length / itemsPerPage.value) || 1);
    
    const activosPaginados = computed(() => {
      const start = (currentGestionPage.value - 1) * itemsPerPage.value;
      return activosFiltrados.value.slice(start, start + itemsPerPage.value);
    });
    
    const activosDisponibles = computed(() => {
      const asignadosIds = asignacionesData.value
        .filter(a => a.estadoAsignacion === 'Activo')
        .map(a => a.activoId);
      return activosData.value.filter(a => !asignadosIds.includes(a.id) && a.estado !== 'Dado de baja');
    });
    
    const notificacionesPendientes = computed(() => {
      // Solo mostrar notificaciones pendientes si tiene permiso para verlas
      if (!tienePermiso_('ver_notificaciones')) return 0;
      return notificacionesData.value.filter(n => !n.leida).length;
    });
    
    const notificacionesFiltradas = computed(() => {
      // Solo mostrar notificaciones si tiene permiso para verlas
      if (!tienePermiso_('ver_notificaciones')) return [];
      return [...notificacionesData.value].slice(0, 10);
    });
    
    const historialFiltrado = computed(() => {
      // Solo mostrar historial si tiene permiso para verlo
      if (!tienePermiso_('ver_historial')) return [];
      let result = [...historialData.value];
      const busqueda = historialFiltros.busqueda.toLowerCase();
      if (busqueda) {
        result = result.filter(h => 
          h.activoNombre.toLowerCase().includes(busqueda) || 
          h.responsable.toLowerCase().includes(busqueda) ||
          h.descripcion.toLowerCase().includes(busqueda)
        );
      }
      if (historialFiltros.tipo) {
        result = result.filter(h => h.tipo === historialFiltros.tipo);
      }
      return result.slice(0, 50);
    });
    
    const resumenPorTipo = computed(() => {
      const res = {};
      activosData.value.forEach(a => {
        res[a.tipo] = (res[a.tipo] || 0) + 1;
      });
      return res;
    });
    
    const resumenPorEstado = computed(() => {
      const res = {};
      activosData.value.forEach(a => {
        res[a.estado] = (res[a.estado] || 0) + 1;
      });
      return res;
    });
    
    const resumenPorFacultad = computed(() => {
      const res = {};
      activosData.value.forEach(a => {
        res[a.facultad] = (res[a.facultad] || 0) + 1;
      });
      return res;
    });
    
    const valorTotalActivos = computed(() => {
      return activosData.value.reduce((sum, a) => sum + (a.valor || 0), 0);
    });
    
    const valorPromedio = computed(() => {
      return activosData.value.length > 0 ? valorTotalActivos.value / activosData.value.length : 0;
    });
    
    const activosMasValiosos = computed(() => {
      return [...activosData.value].sort((a, b) => b.valor - a.valor).slice(0, 5);
    });
    
    const tituloPagina = computed(() => {
      const titulos = { 
        dashboard: "Dashboard", 
        gestionar: "Gestion Activos", 
        agregar: "Agregar Activo", 
        reportes: "Reportes", 
        consultas: "Busqueda Avanzada",
        asignacion: "Asignacion de Activos",
        mantenimiento: "Mantenimiento",
        historial: "Historial",
        roles: "Gestion de Roles"
      };
      return titulos[currentPage.value] || currentPage.value;
    });
    
    // ==================== WATCHERS ====================
    watch(filtros, () => {
      currentGestionPage.value = 1;
    }, { deep: true });
    
    watch(currentPage, (nuevo) => {
      if (nuevo === 'dashboard') {
        setTimeout(renderizarGraficos, 500);
      }
      if (nuevo === 'gestionar') {
        sincronizarDatos();
      }
    });
    
    // ==================== METODOS BASICOS ====================
    const getBadgeClass_ = getBadgeClass;
    
    const tienePermiso_ = (permiso) => {
      return tienePermiso(usuarioActual.value, permiso);
    };
    
    const obtenerPermisos_ = (rol) => obtenerPermisos(rol);
    const obtenerNombreRol_ = (rol) => obtenerNombreRol(rol);
    
    const formatFecha = (fecha) => {
      if (!fecha) return 'N/A';
      const d = new Date(fecha);
      return d.toLocaleDateString('es-EC', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    };
    
    // ==================== AUTENTICACION ====================
    const iniciarSesion = () => {
      loginErrors.email = '';
      loginErrors.password = '';
      
      if (!loginEmail.value) {
        loginErrors.email = 'Ingrese un correo electronico';
        return;
      }
      
      if (!validarEmailUleam(loginEmail.value)) {
        loginErrors.email = 'Debe ser un correo @uleam.edu.ec valido';
        return;
      }
      
      if (!loginPassword.value || loginPassword.value.length < 6) {
        loginErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        return;
      }
      
      const usuario = store.buscarUsuarioPorEmail(loginEmail.value);
      
      if (usuario && usuario.password === loginPassword.value && usuario.activo !== false) {
        usuarioActual.value = usuario;
        sessionStorage.setItem('usuario', JSON.stringify(usuario));
        
        // Solo mostrar notificación si el usuario tiene permiso para verlas
        if (tienePermiso_('ver_notificaciones')) {
          store.agregarNotificacion({
            titulo: 'Bienvenido',
            descripcion: 'Has iniciado sesion como ' + usuario.nombres,
            tipo: 'general'
          });
        }
        
        sincronizarDatos();
        mostrarToast("Bienvenido " + usuario.nombres, "success");
        
        setTimeout(() => {
          animarContador('statTotal', totalActivos.value);
          animarContador('statDisp', disponiblesCount.value);
          animarContador('statBaja', bajaCount.value);
          animarContador('statMant', mantenimientoCount.value);
        }, 300);
        
        loginEmail.value = '';
        loginPassword.value = '';
      } else {
        mostrarToast("Credenciales incorrectas", "error");
      }
    };
    
    const cerrarSesion = () => {
      usuarioActual.value = null;
      sessionStorage.removeItem('usuario');
      currentPage.value = 'dashboard';
    };
    
    const verificarSesion = () => {
      const data = sessionStorage.getItem('usuario');
      if (data) {
        try {
          const usuario = JSON.parse(data);
          const existe = store.buscarUsuarioPorEmail(usuario.email);
          if (existe && existe.activo !== false) {
            usuarioActual.value = existe;
          }
        } catch (e) {
          sessionStorage.removeItem('usuario');
        }
      }
      sincronizarDatos();
    };
    
    const abrirRegistro = () => {
      console.log('🟢 Abriendo modal de registro');
      mostrarModalRegistro.value = true;
      limpiarCamposRegistro();
      // Forzar actualización del DOM
      nextTick(() => {
        const modal = document.getElementById('modalRegistro');
        if (modal) {
          modal.classList.add('open');
          console.log('✅ Modal abierto con clase open');
        }
      });
    };

    const cerrarModalRegistro = () => {
      console.log('🔴 Cerrando modal de registro');
      mostrarModalRegistro.value = false;
      // Limpiar campos al cerrar
      limpiarCamposRegistro();
    };

    const limpiarCamposRegistro = () => {
      registro.nombres = '';
      registro.email = '';
      registro.cedula = '';
      registro.telefono = '';
      registro.password = '';
      registro.confirm = '';
      registro.rol = 'usuario';
      registro.facultad = 'FACIT';
      registro.terms = false;
      
      registroErrores.nombres = '';
      registroErrores.email = '';
      registroErrores.cedula = '';
      registroErrores.telefono = '';
      registroErrores.password = '';
      registroErrores.confirm = '';
      registroErrores.terms = '';
    };
    
    const registrarUsuario = () => {
      let esValido = true;
      
      // Validar nombre con título
      if (!registro.nombres || !validarTitulo(registro.nombres)) {
        registroErrores.nombres = 'Debe incluir título profesional (Ej: Ing. Juan Perez, Dr. Maria, Lcdo. Carlos)';
        esValido = false;
      } else if (!validarNombres(registro.nombres)) {
        registroErrores.nombres = 'Ingrese nombres válidos (min. 3 caracteres, solo letras)';
        esValido = false;
      } else {
        registroErrores.nombres = '';
      }
      
      if (!validarEmailUleam(registro.email)) {
        registroErrores.email = 'Debe ser un correo @uleam.edu.ec valido';
        esValido = false;
      } else if (!isEmailUnique(registro.email, store.usuarios)) {
        registroErrores.email = 'Este correo ya esta registrado';
        esValido = false;
      } else {
        registroErrores.email = '';
      }
      
      if (registro.cedula && !validarCedulaEcuador(registro.cedula)) {
        registroErrores.cedula = 'Cedula invalida (10 digitos)';
        esValido = false;
      } else {
        registroErrores.cedula = '';
      }
      
      if (registro.telefono && !validarTelefonoEcuador(registro.telefono)) {
        registroErrores.telefono = 'Telefono invalido (10 digitos)';
        esValido = false;
      } else {
        registroErrores.telefono = '';
      }
      
      if (!PASSWORD_REGEX.test(registro.password)) {
        registroErrores.password = 'La contraseña no cumple los requisitos';
        esValido = false;
      } else {
        registroErrores.password = '';
      }
      
      if (registro.password !== registro.confirm) {
        registroErrores.confirm = 'Las contraseñas no coinciden';
        esValido = false;
      } else {
        registroErrores.confirm = '';
      }
      
      if (!registro.terms) {
        registroErrores.terms = 'Debe aceptar los terminos y condiciones';
        esValido = false;
      } else {
        registroErrores.terms = '';
      }
      
      if (!esValido) {
        mostrarToast("Complete todos los campos correctamente", "error");
        return;
      }
      
      // Extraer el título para almacenarlo
      const titulo = extraerTitulo(registro.nombres);
      
      const newUser = {
        nombres: registro.nombres,
        email: registro.email,
        cedula: registro.cedula || '',
        telefono: registro.telefono || '',
        rol: registro.rol,
        facultad: registro.facultad,
        password: registro.password,
        fechaRegistro: new Date().toISOString(),
        activo: true,
        titulo: titulo
      };
      
      store.agregarUsuario(newUser);
      sincronizarDatos();
      
      mostrarToast("Registro exitoso. Bienvenido " + newUser.nombres, "success");
      cerrarModalRegistro();
      
      loginEmail.value = registro.email;
      loginPassword.value = '';
    };
    
    // ==================== GESTION DE ACTIVOS ====================
    const cambiarPagina = (pagina) => {
      // Verificar permisos para páginas restringidas
      if (pagina === 'historial' && !tienePermiso_('ver_historial')) {
        mostrarToast("No tiene permisos para ver el historial", "error");
        return;
      }
      if (pagina === 'roles' && !tienePermiso_('gestionar_roles')) {
        mostrarToast("No tiene permisos para gestionar roles", "error");
        return;
      }
      if (pagina === 'asignacion' && !tienePermiso_('gestionar_asignacion')) {
        mostrarToast("No tiene permisos para gestionar asignaciones", "error");
        return;
      }
      if (pagina === 'mantenimiento' && !tienePermiso_('gestionar_mantenimiento')) {
        mostrarToast("No tiene permisos para gestionar mantenimientos", "error");
        return;
      }
      
      if (pagina === currentPage.value) return;
      currentPage.value = pagina;
      if (pagina === 'gestionar') {
        currentGestionPage.value = 1;
        sincronizarDatos();
      }
      if (pagina === 'agregar' && !formActivo.id) limpiarFormulario();
      if (pagina === 'reportes') mostrarResumen.value = false;
    };
    
    const cambiarPaginaGestion = (page) => {
      if (page >= 1 && page <= totalGestionPages.value) {
        currentGestionPage.value = page;
      }
    };
    
    const resetearFiltros = () => {
      filtros.busqueda = '';
      filtros.tipo = '';
      filtros.estado = '';
      filtros.facultad = '';
      currentGestionPage.value = 1;
    };
    
    const validarCampoActivo = (campo, valor) => {
      switch(campo) {
        case 'codigo':
          if (!valor) {
            errors.codigo = "Campo requerido";
          } else if (!CODIGO_REGEX.test(valor)) {
            errors.codigo = "Formato invalido: UAF-AAAA-XXX (ej: UAF-2024-001)";
          } else if (activosData.value.some(a => a.codigo === valor && a.id !== formActivo.id)) {
            errors.codigo = "El codigo ya existe";
          } else {
            errors.codigo = "";
          }
          return !errors.codigo;
        case 'nombre':
          if (!valor || valor.length < 3) {
            errors.nombre = "Minimo 3 caracteres";
          } else {
            errors.nombre = "";
          }
          return !errors.nombre;
        case 'marca':
          if (!valor || valor.length < 2) {
            errors.marca = "Minimo 2 caracteres";
          } else {
            errors.marca = "";
          }
          return !errors.marca;
        case 'responsable':
          if (!valor || valor.length < 3) {
            errors.responsable = "Minimo 3 caracteres";
          } else {
            errors.responsable = "";
          }
          return !errors.responsable;
        case 'tipo':
          if (!valor) {
            errors.tipo = "Seleccione un tipo";
          } else {
            errors.tipo = "";
          }
          return !errors.tipo;
        case 'estado':
          if (!valor) {
            errors.estado = "Seleccione un estado";
          } else {
            errors.estado = "";
          }
          return !errors.estado;
        case 'facultad':
          if (!valor) {
            errors.facultad = "Seleccione una facultad";
          } else {
            errors.facultad = "";
          }
          return !errors.facultad;
        case 'valor':
          if (formActivo.valor && (isNaN(formActivo.valor) || formActivo.valor < 0)) {
            errors.valor = "Ingrese un valor valido (mayor o igual a 0)";
          } else {
            errors.valor = "";
          }
          return !errors.valor;
        case 'descripcion':
          if (valor && valor.length > 300) {
            errors.descripcion = "Maximo 300 caracteres";
          } else {
            errors.descripcion = "";
          }
          return !errors.descripcion;
        case 'modelo':
          if (valor && valor.length > 50) {
            errors.modelo = "Maximo 50 caracteres";
          } else {
            errors.modelo = "";
          }
          return !errors.modelo;
        case 'color':
          if (valor && valor.length > 30) {
            errors.color = "Maximo 30 caracteres";
          } else {
            errors.color = "";
          }
          return !errors.color;
        case 'serie':
          if (valor && valor.length > 50) {
            errors.serie = "Maximo 50 caracteres";
          } else {
            errors.serie = "";
          }
          return !errors.serie;
        case 'ubicacion':
          if (valor && valor.length > 80) {
            errors.ubicacion = "Maximo 80 caracteres";
          } else {
            errors.ubicacion = "";
          }
          return !errors.ubicacion;
        default:
          return true;
      }
    };
    
    const validarFormularioCompleto = () => {
      let esValido = true;
      esValido = validarCampoActivo('codigo', formActivo.codigo) && esValido;
      esValido = validarCampoActivo('nombre', formActivo.nombre) && esValido;
      esValido = validarCampoActivo('marca', formActivo.marca) && esValido;
      esValido = validarCampoActivo('responsable', formActivo.responsable) && esValido;
      esValido = validarCampoActivo('tipo', formActivo.tipo) && esValido;
      esValido = validarCampoActivo('estado', formActivo.estado) && esValido;
      esValido = validarCampoActivo('facultad', formActivo.facultad) && esValido;
      esValido = validarCampoActivo('valor', formActivo.valor) && esValido;
      esValido = validarCampoActivo('descripcion', formActivo.descripcion) && esValido;
      esValido = validarCampoActivo('modelo', formActivo.modelo) && esValido;
      esValido = validarCampoActivo('color', formActivo.color) && esValido;
      esValido = validarCampoActivo('serie', formActivo.serie) && esValido;
      esValido = validarCampoActivo('ubicacion', formActivo.ubicacion) && esValido;
      
      if (formActivo.fechaCompra) {
        const fechaCompra = new Date(formActivo.fechaCompra);
        const hoy = new Date();
        if (fechaCompra > hoy) {
          mostrarToast("La fecha de compra no puede ser futura", "error");
          esValido = false;
        }
      }
      
      return esValido;
    };
    
    const limpiarFormulario = () => {
      formActivo.id = null;
      formActivo.codigo = '';
      formActivo.nombre = '';
      formActivo.descripcion = '';
      formActivo.marca = '';
      formActivo.modelo = '';
      formActivo.color = '';
      formActivo.serie = '';
      formActivo.responsable = '';
      formActivo.tipo = '';
      formActivo.estado = '';
      formActivo.fechaCompra = '';
      formActivo.valor = 0;
      formActivo.facultad = '';
      formActivo.ubicacion = '';
      errors.codigo = '';
      errors.nombre = '';
      errors.marca = '';
      errors.responsable = '';
      errors.tipo = '';
      errors.estado = '';
      errors.facultad = '';
      errors.valor = '';
      errors.descripcion = '';
      errors.modelo = '';
      errors.color = '';
      errors.serie = '';
      errors.ubicacion = '';
    };
    
    const guardarActivo = () => {
      if (!validarFormularioCompleto()) {
        mostrarToast("Por favor, complete correctamente todos los campos", "error");
        return;
      }
      
      const datosActivo = {
        ...formActivo,
        valor: parseFloat(formActivo.valor) || 0
      };
      
      if (formActivo.id) {
        const viejo = store.obtenerActivo(formActivo.id);
        if (viejo) {
          store.actualizarActivo(formActivo.id, datosActivo);
          store.agregarHistorial({
            activoId: formActivo.id,
            activoNombre: datosActivo.nombre,
            tipo: 'edicion',
            responsable: datosActivo.responsable,
            descripcion: 'Editado: ' + viejo.nombre + ' -> ' + datosActivo.nombre,
            usuario: usuarioActual.value?.nombres || 'Sistema'
          });
          // Solo agregar notificación si tiene permiso
          if (tienePermiso_('ver_notificaciones')) {
            store.agregarNotificacion({
              titulo: 'Activo Editado',
              descripcion: 'El activo ' + datosActivo.nombre + ' ha sido modificado',
              tipo: 'general',
              activoId: formActivo.id
            });
          }
          sincronizarDatos();
          mostrarToast("Activo actualizado", "success");
        }
      } else {
        const nuevo = store.agregarActivo(datosActivo);
        store.agregarHistorial({
          activoId: nuevo.id,
          activoNombre: nuevo.nombre,
          tipo: 'creacion',
          responsable: nuevo.responsable,
          descripcion: 'Activo creado',
          usuario: usuarioActual.value?.nombres || 'Sistema'
        });
        if (tienePermiso_('ver_notificaciones')) {
          store.agregarNotificacion({
            titulo: 'Nuevo Activo',
            descripcion: 'Se ha registrado el activo ' + nuevo.nombre,
            tipo: 'general',
            activoId: nuevo.id
          });
        }
        sincronizarDatos();
        mostrarToast("Activo registrado", "success");
      }
      
      limpiarFormulario();
      cambiarPagina('gestionar');
    };
    
    const abrirEditar = (id) => {
      if (!tienePermiso_('editar_activos')) {
        mostrarToast("No tiene permisos para editar", "error");
        return;
      }
      sincronizarDatos();
      const a = store.obtenerActivo(id);
      if (!a) {
        mostrarToast("Activo no encontrado", "error");
        return;
      }
      
      formActivo.id = a.id;
      formActivo.codigo = a.codigo || '';
      formActivo.nombre = a.nombre || '';
      formActivo.descripcion = a.descripcion || '';
      formActivo.marca = a.marca || '';
      formActivo.modelo = a.modelo || '';
      formActivo.color = a.color || '';
      formActivo.serie = a.serie || '';
      formActivo.responsable = a.responsable || '';
      formActivo.tipo = a.tipo || '';
      formActivo.estado = a.estado || '';
      formActivo.fechaCompra = a.fechaCompra || '';
      formActivo.valor = a.valor || 0;
      formActivo.facultad = a.facultad || '';
      formActivo.ubicacion = a.ubicacion || '';
      
      currentPage.value = 'agregar';
      mostrarToast("Editando: " + a.nombre, "info");
    };
    
    const eliminarActivo = (id) => {
      if (!tienePermiso_('eliminar_activos')) {
        mostrarToast("No tiene permisos para eliminar", "error");
        return;
      }
      sincronizarDatos();
      const a = store.obtenerActivo(id);
      if (!a) return;
      
      abrirConfirmacion(
        'Eliminar Activo',
        '?',
        'Esta seguro de eliminar el activo "' + a.nombre + '"? Esta accion no se puede deshacer.',
        () => {
          store.agregarHistorial({
            activoId: id,
            activoNombre: a.nombre,
            tipo: 'eliminacion',
            responsable: a.responsable,
            descripcion: 'Eliminado por ' + (usuarioActual.value?.nombres || 'Sistema'),
            usuario: usuarioActual.value?.nombres || 'Sistema'
          });
          
          store.eliminarActivo(id);
          sincronizarDatos();
          mostrarToast("Activo eliminado correctamente", "success");
          
          const totalPages = totalGestionPages.value;
          if (currentGestionPage.value > totalPages && totalPages > 0) {
            currentGestionPage.value = totalPages;
          } else if (totalPages === 0) {
            currentGestionPage.value = 1;
          }
        },
        'Eliminar'
      );
    };
    
    const seleccionarTodos = (event) => {
      const checkboxes = document.querySelectorAll('.row-check');
      checkboxes.forEach(cb => cb.checked = event.target.checked);
    };
    
    const eliminarSeleccionados = () => {
      const checkboxes = document.querySelectorAll('.row-check:checked');
      if (checkboxes.length === 0) {
        mostrarToast("Seleccione al menos un activo", "error");
        return;
      }
      
      const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
      const nombres = ids.map(id => {
        const a = store.obtenerActivo(id);
        return a ? a.nombre : 'Desconocido';
      }).join(', ');
      
      abrirConfirmacion(
        'Eliminar Multiple',
        '?',
        'Eliminar ' + checkboxes.length + ' activo(s)?<br><small style="color:#6c7a8a">' + nombres + '</small>',
        () => {
          ids.forEach(id => {
            const activo = store.obtenerActivo(id);
            if (activo) {
              store.agregarHistorial({
                activoId: id,
                activoNombre: activo.nombre,
                tipo: 'eliminacion',
                responsable: activo.responsable,
                descripcion: 'Eliminado en masa por ' + (usuarioActual.value?.nombres || 'Sistema'),
                usuario: usuarioActual.value?.nombres || 'Sistema'
              });
              store.eliminarActivo(id);
            }
          });
          
          sincronizarDatos();
          mostrarToast(ids.length + " activo(s) eliminado(s) correctamente", "success");
          
          const selectAll = document.getElementById('selectAll');
          if (selectAll) selectAll.checked = false;
          
          const totalPages = totalGestionPages.value;
          if (currentGestionPage.value > totalPages && totalPages > 0) {
            currentGestionPage.value = totalPages;
          } else if (totalPages === 0) {
            currentGestionPage.value = 1;
          }
        },
        'Eliminar Todos'
      );
    };
    
    // ==================== VER DETALLE ====================
    const verDetalle = (id) => {
      console.log('========================================');
      console.log('🔍 verDetalle llamado con ID:', id);
      
      sincronizarDatos();
      
      const todosLosActivos = store.activos;
      console.log('📦 Activos en store:', todosLosActivos);
      
      const idNumerico = Number(id);
      console.log('🔢 ID convertido a número:', idNumerico);
      
      let activo = null;
      
      for (let i = 0; i < todosLosActivos.length; i++) {
        const a = todosLosActivos[i];
        if (Number(a.id) === idNumerico) {
          activo = a;
          console.log('✅ Activo encontrado en índice', i, ':', activo);
          break;
        }
      }
      
      if (!activo) {
        console.log('🔎 Buscando por string...');
        for (let i = 0; i < todosLosActivos.length; i++) {
          const a = todosLosActivos[i];
          if (String(a.id) === String(id)) {
            activo = a;
            console.log('✅ Activo encontrado por string en índice', i, ':', activo);
            break;
          }
        }
      }
      
      console.log('🔎 Resultado final - Activo encontrado:', activo);
      
      if (!activo) {
        console.error('❌ Activo NO ENCONTRADO para ID:', id);
        mostrarToast("Activo no encontrado", "error");
        return;
      }
      
      if (typeof window.abrirModalDetalle !== 'function') {
        console.error('❌ La función window.abrirModalDetalle no está definida');
        mostrarToast("Error: función modal no disponible", "error");
        return;
      }
      
      window.abrirModalDetalle(activo);
    };
    
    // ==================== ASIGNACIONES ====================
    const limpiarAsignacion = () => {
      asignacion.activoId = '';
      asignacion.responsable = '';
      asignacion.fechaAsignacion = '';
      asignacion.fechaDevolucion = '';
      asignacion.observaciones = '';
    };
    
    const guardarAsignacion = () => {
      if (!asignacion.activoId || !asignacion.responsable || !asignacion.fechaAsignacion) {
        mostrarToast("Complete todos los campos requeridos", "error");
        return;
      }
      
      if (!validarCampoAsignacion('responsable', asignacion.responsable) || !validarCampoAsignacion('observaciones', asignacion.observaciones)) {
        mostrarToast("Por favor, revise los campos marcados", "error");
        return;
      }
      
      const fechaAsig = new Date(asignacion.fechaAsignacion);
      const hoy = new Date();
      if (fechaAsig > hoy) {
        mostrarToast("La fecha de asignacion no puede ser futura", "error");
        return;
      }
      
      if (asignacion.fechaDevolucion) {
        const fechaDev = new Date(asignacion.fechaDevolucion);
        if (fechaDev < fechaAsig) {
          mostrarToast("La fecha de devolucion debe ser posterior a la asignacion", "error");
          return;
        }
      }
      
      const activo = store.obtenerActivo(parseInt(asignacion.activoId));
      if (!activo) {
        mostrarToast("Activo no encontrado", "error");
        return;
      }
      
      const yaAsignado = asignacionesData.value.some(a => a.activoId === activo.id && a.estadoAsignacion === 'Activo');
      if (yaAsignado) {
        mostrarToast("Este activo ya esta asignado", "error");
        return;
      }
      
      const nuevaAsignacion = {
        activoId: activo.id,
        activoNombre: activo.nombre,
        responsable: asignacion.responsable,
        fechaAsignacion: asignacion.fechaAsignacion,
        fechaDevolucion: asignacion.fechaDevolucion || null,
        observaciones: asignacion.observaciones || '',
        estadoAsignacion: 'Activo'
      };
      
      store.agregarAsignacion(nuevaAsignacion);
      store.actualizarActivo(activo.id, { responsable: asignacion.responsable });
      
      store.agregarHistorial({
        activoId: activo.id,
        activoNombre: activo.nombre,
        tipo: 'asignacion',
        responsable: asignacion.responsable,
        descripcion: 'Asignado a ' + asignacion.responsable,
        usuario: usuarioActual.value?.nombres || 'Sistema'
      });
      
      if (tienePermiso_('ver_notificaciones')) {
        store.agregarNotificacion({
          titulo: 'Activo Asignado',
          descripcion: 'El activo ' + activo.nombre + ' ha sido asignado a ' + asignacion.responsable,
          tipo: 'asignacion',
          activoId: activo.id
        });
      }
      
      sincronizarDatos();
      mostrarToast("Activo asignado exitosamente", "success");
      limpiarAsignacion();
    };
    
    const devolverActivo = (id) => {
      const asig = asignacionesData.value.find(a => a.id === id);
      if (!asig) return;
      
      abrirConfirmacion(
        'Devolver Activo',
        'R',
        'Devolver el activo "' + asig.activoNombre + '"?',
        () => {
          const fechaDev = new Date().toISOString().split('T')[0];
          store.actualizarAsignacion(id, {
            estadoAsignacion: 'Devuelto',
            fechaDevolucion: fechaDev
          });
          
          store.agregarHistorial({
            activoId: asig.activoId,
            activoNombre: asig.activoNombre,
            tipo: 'devolucion',
            responsable: asig.responsable,
            descripcion: 'Devuelto por ' + asig.responsable,
            usuario: usuarioActual.value?.nombres || 'Sistema'
          });
          
          if (tienePermiso_('ver_notificaciones')) {
            store.agregarNotificacion({
              titulo: 'Activo Devuelto',
              descripcion: 'El activo ' + asig.activoNombre + ' ha sido devuelto',
              tipo: 'asignacion',
              activoId: asig.activoId
            });
          }
          
          sincronizarDatos();
          mostrarToast("Activo devuelto exitosamente", "success");
        },
        'Devolver'
      );
    };
    
    // ==================== MANTENIMIENTO ====================
    const limpiarMantenimiento = () => {
      mantenimiento.activoId = '';
      mantenimiento.tipo = '';
      mantenimiento.fecha = '';
      mantenimiento.costo = 0;
      mantenimiento.descripcion = '';
      mantenimiento.tecnico = '';
    };
    
    const guardarMantenimiento = () => {
      if (!mantenimiento.activoId) {
        mostrarToast("Seleccione un activo", "error");
        return;
      }
      if (!mantenimiento.tipo) {
        mostrarToast("Seleccione un tipo de mantenimiento", "error");
        return;
      }
      if (!mantenimiento.fecha) {
        mostrarToast("Ingrese una fecha de mantenimiento", "error");
        return;
      }
      
      const fechaMant = new Date(mantenimiento.fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaMant > hoy) {
        mostrarToast("La fecha de mantenimiento no puede ser futura", "error");
        return;
      }
      
      if (mantenimiento.costo < 0) {
        mostrarToast("El costo no puede ser negativo", "error");
        return;
      }
      
      if (!validarCampoMantenimiento('descripcion', mantenimiento.descripcion) || !validarCampoMantenimiento('tecnico', mantenimiento.tecnico)) {
        mostrarToast("Por favor, revise los campos marcados", "error");
        return;
      }
      
      const activoId = parseInt(mantenimiento.activoId);
      const activo = store.obtenerActivo(activoId);
      
      if (!activo) {
        mostrarToast("Activo no encontrado", "error");
        return;
      }
      
      const nuevoMantenimiento = {
        activoId: activo.id,
        activoNombre: activo.nombre,
        tipo: mantenimiento.tipo,
        fecha: mantenimiento.fecha,
        costo: parseFloat(mantenimiento.costo) || 0,
        descripcion: mantenimiento.descripcion || '',
        tecnico: mantenimiento.tecnico || ''
      };
      
      store.agregarMantenimiento(nuevoMantenimiento);
      
      if (mantenimiento.tipo === 'Correctivo') {
        if (activo.estado !== 'En reparacion') {
          store.actualizarActivo(activo.id, { estado: 'En reparacion' });
          sincronizarDatos();
          mostrarToast("Estado del activo actualizado a: En reparacion", "info");
        } else {
          mostrarToast("El activo ya se encuentra en estado En reparacion", "info");
        }
      } else {
        mostrarToast("Mantenimiento " + mantenimiento.tipo + " registrado", "info");
      }
      
      store.agregarHistorial({
        activoId: activo.id,
        activoNombre: activo.nombre,
        tipo: 'mantenimiento',
        responsable: mantenimiento.tecnico || 'N/A',
        descripcion: 'Mantenimiento ' + mantenimiento.tipo + 
                      (mantenimiento.descripcion ? ': ' + mantenimiento.descripcion : ''),
        usuario: usuarioActual.value?.nombres || 'Sistema'
      });
      
      if (tienePermiso_('ver_notificaciones')) {
        store.agregarNotificacion({
          titulo: 'Mantenimiento Registrado',
          descripcion: 'Se ha registrado mantenimiento ' + mantenimiento.tipo + ' para ' + activo.nombre,
          tipo: 'mantenimiento',
          activoId: activo.id
        });
      }
      
      sincronizarDatos();
      mostrarToast("Mantenimiento registrado exitosamente", "success");
      limpiarMantenimiento();
    };
    
    // ==================== NOTIFICACIONES ====================
    const marcarLeida = (id) => {
      if (!tienePermiso_('ver_notificaciones')) {
        mostrarToast("No tiene permisos para ver notificaciones", "error");
        return;
      }
      const notif = store.marcarNotificacionLeida(id);
      if (notif) {
        sincronizarDatos();
        mostrarToast("Notificacion marcada como leida", "info");
      }
    };
    
    const marcarTodasLeidas = () => {
      if (!tienePermiso_('ver_notificaciones')) {
        mostrarToast("No tiene permisos para gestionar notificaciones", "error");
        return;
      }
      abrirConfirmacion(
        'Marcar todas como leidas',
        '?',
        'Esta seguro de marcar todas las notificaciones como leidas?',
        () => {
          store.marcarTodasNotificacionesLeidas();
          sincronizarDatos();
          mostrarToast("Todas las notificaciones marcadas como leidas", "success");
        },
        'Marcar todas',
        'btn-primary'
      );
    };
    
    // ==================== REPORTES ====================
    const exportarCSV = () => {
      if (!tienePermiso_('exportar_datos')) {
        mostrarToast("No tiene permisos para exportar", "error");
        return;
      }
      const headers = ["Codigo","Nombre","Marca","Modelo","Serie","Tipo","Estado","Responsable","Facultad","Ubicacion","Valor","Fecha"];
      const rows = activosData.value.map(a => {
        return [a.codigo,a.nombre,a.marca,a.modelo,a.serie,a.tipo,a.estado,a.responsable,a.facultad,a.ubicacion,a.valor,a.fechaCompra]
          .map(v => '"' + (v || '') + '"').join(',');
      });
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; 
      a.download = 'activos_uleam.csv'; 
      a.click();
      URL.revokeObjectURL(url);
      mostrarToast("CSV exportado", "success");
    };
    
    const exportarPDF = () => {
      if (!tienePermiso_('exportar_datos')) {
        mostrarToast("No tiene permisos para exportar", "error");
        return;
      }
      const w = window.open('', '_blank');
      const rows = activosData.value.map(a => {
        return '<tr><td>' + a.codigo + '</td><td>' + a.nombre + '</td><td>' + a.tipo + '</td><td>' + a.estado + '</td><td>' + a.responsable + '</td><td>' + a.facultad + '</td><td>$' + (a.valor || 0).toFixed(2) + '</td></tr>';
      }).join('');
      w.document.write('<!DOCTYPE html><html><head><title>Reporte Activos ULEAM</title><style>body{font-family:Arial;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px}th{background:#1c4e70;color:#fff}</style></head><body><h1>Reporte de Activos Fijos</h1><p>Total: ' + activosData.value.length + '</p><table><thead><tr><th>Codigo</th><th>Nombre</th><th>Tipo</th><th>Estado</th><th>Responsable</th><th>Facultad</th><th>Valor</th></tr></thead><tbody>' + rows + '</tbody></table></body></html>');
      w.document.close(); 
      w.print();
    };
    
    const exportarExcel = () => {
      if (!tienePermiso_('exportar_datos')) {
        mostrarToast("No tiene permisos para exportar", "error");
        return;
      }
      let html = '<html><head><meta charset="UTF-8"></head><body><table border="1">';
      html += '<tr><th>Codigo</th><th>Nombre</th><th>Marca</th><th>Modelo</th><th>Serie</th><th>Tipo</th><th>Estado</th><th>Responsable</th><th>Facultad</th><th>Ubicacion</th><th>Valor</th><th>Fecha</th></tr>';
      activosData.value.forEach(a => {
        html += '<tr><td>' + a.codigo + '</td><td>' + a.nombre + '</td><td>' + (a.marca||'') + '</td><td>' + (a.modelo||'') + '</td><td>' + (a.serie||'') + '</td><td>' + a.tipo + '</td><td>' + a.estado + '</td><td>' + a.responsable + '</td><td>' + a.facultad + '</td><td>' + (a.ubicacion||'') + '</td><td>' + (a.valor||0) + '</td><td>' + (a.fechaCompra||'') + '</td></tr>';
      });
      html += '</table></body></html>';
      
      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; 
      a.download = 'activos_uleam.xls'; 
      a.click();
      URL.revokeObjectURL(url);
      mostrarToast("Excel exportado", "success");
    };
    
    const imprimirReporte = () => {
      const w = window.open('', '_blank');
      const rows = activosData.value.map(a => {
        return '<tr><td>' + a.codigo + '</td><td>' + a.nombre + '</td><td>' + a.tipo + '</td><td>' + a.estado + '</td><td>' + a.responsable + '</td><td>' + a.facultad + '</td></tr>';
      }).join('');
      w.document.write('<!DOCTYPE html><html><head><title>Reporte Activos ULEAM</title><style>body{font-family:Arial;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px}th{background:#1c4e70;color:#fff}</style></head><body><h1>Reporte de Activos Fijos</h1><p>Total: ' + activosData.value.length + '</p><table><thead><tr><th>Codigo</th><th>Nombre</th><th>Tipo</th><th>Estado</th><th>Responsable</th><th>Facultad</th></tr></thead><tbody>' + rows + '</tbody></table></body></html>');
      w.document.close(); 
      w.print();
    };
    
    const mostrarResumenEstadistico = () => {
      mostrarResumen.value = !mostrarResumen.value;
    };
    
    const aplicarFiltrosReporte = () => {
      mostrarResumen.value = true;
      mostrarToast("Filtros aplicados", "info");
    };
    
    const resetearFiltrosReporte = () => {
      reporteFiltros.tipo = '';
      reporteFiltros.estado = '';
      reporteFiltros.facultad = '';
      mostrarResumen.value = false;
    };
    
    // ==================== CONSULTAS ====================
    const ejecutarConsulta = () => {
      const q = consulta;
      const results = activosData.value.filter(a => {
        let coincide = true;
        if (q.codigo) coincide = coincide && a.codigo.toLowerCase().includes(q.codigo.toLowerCase());
        if (q.nombre) coincide = coincide && a.nombre.toLowerCase().includes(q.nombre.toLowerCase());
        if (q.serie) coincide = coincide && (a.serie||'').toLowerCase().includes(q.serie.toLowerCase());
        if (q.responsable) coincide = coincide && a.responsable.toLowerCase().includes(q.responsable.toLowerCase());
        if (q.estado) coincide = coincide && a.estado === q.estado;
        if (q.facultad) coincide = coincide && a.facultad === q.facultad;
        if (q.valorMin !== null && q.valorMin !== '') coincide = coincide && (a.valor || 0) >= parseFloat(q.valorMin);
        if (q.valorMax !== null && q.valorMax !== '') coincide = coincide && (a.valor || 0) <= parseFloat(q.valorMax);
        return coincide;
      });
      
      resultadosConsulta.value = results;
      consultaSinResultados.value = results.length === 0;
      mostrarToast(results.length + " resultado(s) encontrado(s)", "info");
    };
    
    // ==================== HISTORIAL ====================
    const resetearFiltrosHistorial = () => {
      historialFiltros.busqueda = '';
      historialFiltros.tipo = '';
    };
    
    // ==================== ROLES ====================
    const actualizarRol = (usuario) => {
      store.actualizarUsuario(usuario.id, { rol: usuario.rol });
      store.agregarHistorial({
        activoId: 0,
        activoNombre: 'Sistema',
        tipo: 'edicion',
        responsable: 'Sistema',
        descripcion: 'Rol de ' + usuario.nombres + ' actualizado a ' + usuario.rol,
        usuario: usuarioActual.value?.nombres || 'Sistema'
      });
      sincronizarDatos();
      mostrarToast("Rol actualizado para " + usuario.nombres, "success");
    };
    
    const eliminarUsuario = (id) => {
      if (id === 1) {
        mostrarToast("No se puede eliminar al administrador principal", "error");
        return;
      }
      
      const usuario = store.obtenerUsuario(id);
      if (!usuario) return;
      
      abrirConfirmacion(
        'Eliminar Usuario',
        '?',
        'Eliminar al usuario "' + usuario.nombres + '"? Esta accion no se puede deshacer.',
        () => {
          store.eliminarUsuario(id);
          store.agregarHistorial({
            activoId: 0,
            activoNombre: 'Sistema',
            tipo: 'eliminacion',
            responsable: 'Sistema',
            descripcion: 'Usuario eliminado: ' + usuario.nombres,
            usuario: usuarioActual.value?.nombres || 'Sistema'
          });
          sincronizarDatos();
          mostrarToast("Usuario eliminado", "success");
        },
        'Eliminar'
      );
    };
    
    // ==================== CONFIRMACION ====================
    const abrirConfirmacion = (titulo, icono, mensaje, callback, boton = 'Confirmar', color = '#c7362b') => {
      confirmacion.titulo = titulo;
      confirmacion.icono = icono || '?';
      confirmacion.mensaje = mensaje;
      confirmacion.boton = boton;
      confirmacion.color = color;
      confirmacion.callback = callback;
      mostrarConfirmacion.value = true;
    };
    
    const cerrarConfirmacion = () => {
      mostrarConfirmacion.value = false;
      confirmacion.callback = null;
    };
    
    const ejecutarConfirmacion = () => {
      if (confirmacion.callback) {
        confirmacion.callback();
      }
      cerrarConfirmacion();
    };
    
    // ==================== TOGGLE PASSWORD ====================
    const togglePassword = (inputId, event) => {
      const input = document.getElementById(inputId);
      if (!input) return;
      if (input.type === "password") {
        input.type = "text";
        event.target.textContent = "Ocultar";
      } else {
        input.type = "password";
        event.target.textContent = "Mostrar";
      }
    };
    
    // ==================== GRAFICOS ====================
    const renderizarGraficos = () => {
      nextTick(() => {
        const canvasTipo = document.getElementById('chartTipo');
        const canvasEstado = document.getElementById('chartEstado');
        const canvasFacultad = document.getElementById('chartFacultad');
        
        if (!canvasTipo || !canvasEstado || !canvasFacultad) return;
        
        if (window._chartTipo) { window._chartTipo.destroy(); }
        if (window._chartEstado) { window._chartEstado.destroy(); }
        if (window._chartFacultad) { window._chartFacultad.destroy(); }

        window._chartTipo = new Chart(canvasTipo, {
          type: 'doughnut',
          data: {
            labels: Object.keys(resumenPorTipo.value),
            datasets: [{
              data: Object.values(resumenPorTipo.value),
              backgroundColor: ['#1c4e70', '#2d6f96', '#4a8fb5', '#6aafd4', '#8acff3']
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'bottom', labels: { font: { size: 10 } } }
            }
          }
        });

        window._chartEstado = new Chart(canvasEstado, {
          type: 'bar',
          data: {
            labels: Object.keys(resumenPorEstado.value),
            datasets: [{
              label: 'Activos',
              data: Object.values(resumenPorEstado.value),
              backgroundColor: ['#1d7d6e', '#e67e22', '#c7362b', '#8a9bb0']
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }
        });

        window._chartFacultad = new Chart(canvasFacultad, {
          type: 'pie',
          data: {
            labels: Object.keys(resumenPorFacultad.value),
            datasets: [{
              data: Object.values(resumenPorFacultad.value),
              backgroundColor: ['#1c4e70', '#2d6f96', '#4a8fb5', '#6aafd4', '#8acff3']
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'bottom', labels: { font: { size: 10 } } }
            }
          }
        });
      });
    };
    
    // ==================== LIFE CYCLE ====================
    onMounted(() => {
      verificarSesion();
      store.suscribir(onStoreChange);
      sincronizarDatos();
      
      if (currentPage.value === 'dashboard') {
        setTimeout(renderizarGraficos, 500);
      }
    });
    
    // ==================== EXPONER FUNCIONES GLOBALES ====================
    window.mostrarToast = mostrarToast;
    window.togglePassword = togglePassword;
    window.cerrarConfirmacion = cerrarConfirmacion;
    window.ejecutarConfirmacion = ejecutarConfirmacion;
    window.abrirConfirmacion = abrirConfirmacion;
    
    // ==================== RETORNAR ====================
    return {
      usuarioActual,
      loginEmail,
      loginPassword,
      loginErrors,
      currentPage,
      currentGestionPage,
      itemsPerPage,
      mostrarModalRegistro,
      mostrarDetalle,
      mostrarConfirmacion,
      detalleActivo,
      confirmacion,
      formActivo,
      errors,
      filtros,
      asignacion,
      mantenimiento,
      errosAsignacion,
      erroresMantenimiento,
      consulta,
      resultadosConsulta,
      consultaSinResultados,
      mostrarResumen,
      reporteFiltros,
      historialFiltros,
      registro,
      registroErrores,
      
      activos,
      historial,
      asignaciones,
      mantenimientos,
      notificaciones,
      usuariosSistema,
      rolesDisponibles: rolesDisponiblesList,
      totalActivos,
      disponiblesCount,
      bajaCount,
      mantenimientoCount,
      activosRecientes,
      nombreUsuario,
      nombreCorto,
      avatarIniciales,
      rolUsuario,
      activosFiltrados,
      totalGestionPages,
      activosPaginados,
      activosDisponibles,
      notificacionesPendientes,
      notificacionesFiltradas,
      historialFiltrado,
      resumenPorTipo,
      resumenPorEstado,
      resumenPorFacultad,
      valorTotalActivos,
      valorPromedio,
      activosMasValiosos,
      tituloPagina,
      
      getBadgeClass: getBadgeClass_,
      tienePermiso: tienePermiso_,
      obtenerPermisos: obtenerPermisos_,
      obtenerNombreRol: obtenerNombreRol_,
      formatFecha,
      iniciarSesion,
      cerrarSesion,
      abrirRegistro,
      cerrarModalRegistro,
      limpiarCamposRegistro,
      registrarUsuario,
      cambiarPagina,
      cambiarPaginaGestion,
      resetearFiltros,
      validarCampoActivo,
      limpiarFormulario,
      guardarActivo,
      abrirEditar,
      eliminarActivo,
      seleccionarTodos,
      eliminarSeleccionados,
      verDetalle,
      limpiarAsignacion,
      guardarAsignacion,
      validarCampoAsignacion,
      devolverActivo,
      limpiarMantenimiento,
      guardarMantenimiento,
      validarCampoMantenimiento,
      marcarLeida,
      marcarTodasLeidas,
      exportarCSV,
      exportarPDF,
      exportarExcel,
      imprimirReporte,
      mostrarResumenEstadistico,
      aplicarFiltrosReporte,
      resetearFiltrosReporte,
      ejecutarConsulta,
      resetearFiltrosHistorial,
      actualizarRol,
      eliminarUsuario,
      abrirConfirmacion,
      cerrarConfirmacion,
      ejecutarConfirmacion,
      togglePassword,
      ICONS
    };
  }
};
</script>
