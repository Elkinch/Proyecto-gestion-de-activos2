// ========== js/validations.js ==========
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@uleam\.edu\.ec$/i;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
export const NOMBRES_REGEX = /^[a-zA-ZáéíóúñÑüÜ.\s]{3,100}$/;
export const TELEFONO_REGEX = /^(09|02|04|07)[0-9]{7,8}$|^[2-7][0-9]{7}$/;
export const CODIGO_REGEX = /^UAF-[0-9]{4}-[0-9]{3}$/;
export const CEDULA_REGEX = /^[0-9]{10}$/;

// TÍTULOS PROFESIONALES VÁLIDOS (con punto opcional)
const TITULOS_VALIDOS = [
  'Ing', 'Ing.', 'Dr', 'Dr.', 'Lcdo', 'Lcdo.', 'Lcda', 'Lcda.',
  'Mgtr', 'Mgtr.', 'Msc', 'Msc.', 'Arq', 'Arq.', 'Eco', 'Eco.',
  'Abg', 'Abg.', 'Lic', 'Lic.', 'Tec', 'Tec.', 'Biol', 'Biol.',
  'Quim', 'Quim.', 'Fis', 'Fis.', 'Est', 'Est.', 'Prof', 'Prof.'
];

export function validarTitulo(nombresCompletos) {
  if (!nombresCompletos || nombresCompletos.trim() === '') return false;
  
  const nombre = nombresCompletos.trim();
  const palabras = nombre.split(' ');
  
  // Debe tener al menos 2 palabras: [TITULO] + [NOMBRE]
  if (palabras.length < 2) return false;
  
  // Verificar que la primera palabra sea un título válido
  const titulo = palabras[0];
  return TITULOS_VALIDOS.some(t => titulo.toLowerCase() === t.toLowerCase());
}

export function extraerTitulo(nombresCompletos) {
  if (!nombresCompletos) return '';
  const palabras = nombresCompletos.trim().split(' ');
  return palabras.length > 0 ? palabras[0] : '';
}

export function validarCedulaEcuador(cedula) {
  if (!cedula) return true;
  cedula = cedula.toString().replace(/\D/g, '');
  if (!CEDULA_REGEX.test(cedula)) return false;
  if (/^(\d)\1{9}$/.test(cedula)) return false;
  
  const provincia = parseInt(cedula.substring(0, 2));
  if (provincia < 1 || provincia > 24) return false;
  
  const tercerDigito = parseInt(cedula.charAt(2));
  if (tercerDigito > 5) return false;
  
  let total = 0;
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(cedula.charAt(i));
    let mult = (i % 2 === 0) ? 2 : 1;
    let res = digit * mult;
    total += (res > 9) ? (res - 9) : res;
  }
  
  const verificador = parseInt(cedula.charAt(9));
  const digitoValido = (total % 10 === 0) ? 0 : (10 - (total % 10));
  return verificador === digitoValido;
}

export function validarEmailUleam(email) {
  if (!email) return false;
  return EMAIL_REGEX.test(email);
}

export function validarNombres(nombres) {
  if (!nombres || nombres.trim().length < 3) return false;
  return NOMBRES_REGEX.test(nombres.trim());
}

export function validarTelefonoEcuador(telefono) {
  if (!telefono) return true;
  telefono = telefono.toString().replace(/\D/g, '');
  return TELEFONO_REGEX.test(telefono);
}

export function isEmailUnique(email, users) {
  return !users.some(user => user.email === email);
}