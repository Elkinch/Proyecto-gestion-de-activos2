// ========== js/utils.js ==========

// ==================== TOAST ====================
export function mostrarToast(msg, tipo = 'info') {
  const container = document.getElementById("toastContainer");
  if (!container) {
    console.log(`[${tipo}] ${msg}`);
    return;
  }
  
  const icons = { 
    success: 'OK', 
    error: 'ER', 
    info: 'IN',
    warning: 'AD'
  };
  
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.innerHTML = `<span class="toast-icon">${icons[tipo] || 'IN'}</span><span>${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity .3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==================== TOGGLE PASSWORD ====================
export function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "Ocultar";
  } else {
    input.type = "password";
    btn.textContent = "Mostrar";
  }
}

// ==================== ANIMACION DE CONTADOR ====================
export function animarContador(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  
  let cur = 0;
  const step = Math.ceil(target / 20);
  const timer = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur;
    if (cur >= target) clearInterval(timer);
  }, 40);
}

// ==================== CONFIRMACION ====================
let _confirmCallback = null;

export function abrirConfirmacion(title, icon, msg, callback, btnLabel = 'Confirmar', btnClass = 'btn-danger') {
  let overlay = document.getElementById('confirmOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'confirmOverlay';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal modal-confirm">
        <div style="text-align:center;margin-bottom:1rem">
          <span id="confirmIcon" style="font-size:3rem">?</span>
          <h3 id="confirmTitle" style="margin-top:0.5rem">Confirmar</h3>
        </div>
        <p id="confirmMsg" style="text-align:center;color:#4a5a6e;margin-bottom:1.5rem"></p>
        <div class="modal-footer" style="justify-content:center">
          <button class="btn-register" onclick="window.cerrarConfirmacion()">Cancelar</button>
          <button id="confirmOkBtn" class="btn-login" onclick="window.ejecutarConfirmacion()">Confirmar</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmIcon').textContent = icon || '?';
  document.getElementById('confirmMsg').innerHTML = msg;

  const btn = document.getElementById('confirmOkBtn');
  btn.textContent = btnLabel;
  btn.className = 'btn-login';
  if (btnClass === 'btn-danger') {
    btn.style.background = '#c7362b';
  } else {
    btn.style.background = '#1c4e70';
  }

  _confirmCallback = callback;
  overlay.classList.add('open');
}

export function cerrarConfirmacion() {
  const overlay = document.getElementById('confirmOverlay');
  if (overlay) overlay.classList.remove('open');
  _confirmCallback = null;
}

export function ejecutarConfirmacion() {
  if (_confirmCallback) _confirmCallback();
  cerrarConfirmacion();
}

// ==================== FORMATOS ====================
export function formatCurrency(value) {
  if (value === undefined || value === null) return '$0.00';
  return '$' + parseFloat(value).toFixed(2);
}

export function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

// ==================== EXPORTAR DATOS ====================
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCSV(data, headers, filename = 'export.csv') {
  let csv = headers.join(',') + '\n';
  data.forEach(row => {
    csv += row.map(cell => {
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
        return '"' + cell.replace(/"/g, '""') + '"';
      }
      return cell;
    }).join(',') + '\n';
  });
  downloadFile('\ufeff' + csv, filename, 'text/csv');
}

// ==================== COPIAR AL PORTAPAPELES ====================
export function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text)
      .then(() => mostrarToast('Copiado al portapapeles', 'success'))
      .catch(() => fallbackCopy(text));
  }
  return fallbackCopy(text);
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    mostrarToast('Copiado al portapapeles', 'success');
  } catch {
    mostrarToast('Error al copiar', 'error');
  }
  document.body.removeChild(textarea);
}

// ==================== GENERAR CODIGO ====================
export function generarCodigoActivo(year = null) {
  if (!year) year = new Date().getFullYear();
  const last = localStorage.getItem('uleam_last_codigo') || 0;
  const next = parseInt(last) + 1;
  localStorage.setItem('uleam_last_codigo', next.toString());
  return `UAF-${year}-${String(next).padStart(3, '0')}`;
}

// ==================== EXPONER FUNCIONES GLOBALES ====================
window.mostrarToast = mostrarToast;
window.togglePassword = togglePassword;
window.cerrarConfirmacion = cerrarConfirmacion;
window.ejecutarConfirmacion = ejecutarConfirmacion;
window.abrirConfirmacion = abrirConfirmacion;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.exportToCSV = exportToCSV;
window.copyToClipboard = copyToClipboard;
window.generarCodigoActivo = generarCodigoActivo;