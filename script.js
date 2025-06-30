function toggleMenu() {
  const navLinks = document.querySelector('.nav-links');
  navLinks.classList.toggle('active');
}
// Cambiar imagen al pasar el mouse
const imagenes = document.querySelectorAll('.img-cambio');

imagenes.forEach(img => {
  const original = img.src;
  const alterna = img.getAttribute('data-alt');

  img.addEventListener('mouseenter', () => {
    img.src = alterna;
  });

  img.addEventListener('mouseleave', () => {
    img.src = original;
  });
});
// Menú toggle para móviles
const toggleBtn = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

if (toggleBtn && navMenu) {
  toggleBtn.addEventListener('click', () => {
    navMenu.querySelector('ul').classList.toggle('active');
  });
}
//MANEJO DE REGISTRO - EDITAR - ASIGNAR - BUSCAR
// Funciones para cargar y guardar docentes centralizadas
function loadDocentes() {
  return JSON.parse(localStorage.getItem('docentes')) || [];
}

function saveDocentes(docentes) {
  localStorage.setItem('docentes', JSON.stringify(docentes));
}

//ESTA PARTE MANEJO DE REGISTROS
// Función para guardar usuario en localStorage
function saveUser(user) {
  let users = JSON.parse(localStorage.getItem('users')) || [];

  if (users.some(u => u.username === user.username)) {
    return false; // Usuario ya existe
  }

  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
  return true;
}

// Registro de usuario
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('role').value;

    const messageElem = document.getElementById('register-message');
    messageElem.style.color = 'red';

    if (password !== confirmPassword) {
      messageElem.textContent = 'Las contraseñas no coinciden.';
      return;
    }

    if (!role) {
      messageElem.textContent = 'Selecciona un rol válido.';
      return;
    }

    const newUser = { username, password, role };
    const saved = saveUser(newUser);

    if (!saved) {
      messageElem.textContent = 'El usuario ya existe.';
      return;
    }

    messageElem.style.color = 'green';
    messageElem.textContent = 'Registro exitoso. Puedes iniciar sesión ahora.';
    registerForm.reset();
  });
}

// Validar usuario (login)
function validateUser(username, password) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  return users.find(u => u.username === username && u.password === password);
}

// Login de usuario
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    const user = validateUser(username, password);

    if (!user) {
      errorMessage.textContent = 'Usuario o contraseña incorrectos.';
      return;
    }

    errorMessage.textContent = '';
    sessionStorage.setItem('loggedUser', JSON.stringify(user));

    // Redirigir según el rol
    if (user.role === 'profesor') {
      window.location.href = 'profesor.html';
    } else if (user.role === 'administrador') {
      window.location.href = 'admin.html';
    } else {
      errorMessage.textContent = 'Rol no reconocido.';
    }
  });
}

// Registro de docente
const docenteForm = document.getElementById('docenteForm');
if (docenteForm) {
  docenteForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const apellidoPaterno = document.getElementById('apellidoPaterno').value.trim();
    const apellidoMaterno = document.getElementById('apellidoMaterno').value.trim();
    const dni = document.getElementById('dni').value.trim();
    const edad = document.getElementById('edad').value.trim();
    const idUsuario = document.getElementById('idUsuario').value.trim();
    const password = document.getElementById('password').value.trim();
    const mensaje = document.getElementById('mensajeDocente');

    if (!apellidoPaterno || !apellidoMaterno || !dni || !edad || !idUsuario || !password) {
      mensaje.style.color = 'red';
      mensaje.textContent = 'Por favor, complete todos los campos.';
      return;
    }

    const docente = {
      apellidoPaterno,
      apellidoMaterno,
      dni,
      edad,
      idUsuario,
      password
    };

    // Guardar como docente
    let docentes = loadDocentes();
    docentes.push(docente);
    saveDocentes(docentes);

    // Registrar como usuario con rol profesor (para login)
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const exists = users.some(u => u.username === idUsuario);
    if (!exists) {
      users.push({ username: idUsuario, password: password, role: 'profesor' });
      localStorage.setItem('users', JSON.stringify(users));
    }

    mensaje.style.color = 'green';
    mensaje.textContent = 'Docente registrado exitosamente.';
    docenteForm.reset();
  });
}

// SCRIP PARA EDITAR-DOCENTE 
// Función para cargar docentes y llenar el <select>
function cargarDocentesParaEditar() {
  const docentes = loadDocentes();
  const select = document.getElementById('docenteSelect');

  // Limpiar opciones excepto la primera
  select.innerHTML = '<option value="" disabled selected>Seleccione un docente</option>';

  docentes.forEach((docente, index) => {
    const option = document.createElement('option');
    option.value = index; // guardamos el índice para luego identificar
    option.textContent = docente.apellidoPaterno + ' ' + docente.apellidoMaterno + ' (ID: ' + docente.idUsuario + ')';
    select.appendChild(option);
  });
}

// Cuando se selecciona un docente, mostrar su info en el formulario
const docenteSelectElem = document.getElementById('docenteSelect');
if (docenteSelectElem) {
  docenteSelectElem.addEventListener('change', function() {
    const docentes = loadDocentes();
    const index = this.value;
    const docente = docentes[index];

    if (docente) {
      document.getElementById('dni').value = docente.dni;
      document.getElementById('edad').value = docente.edad;
      document.getElementById('password').value = docente.password;

      document.getElementById('editarDocenteForm').style.display = 'block';
      document.getElementById('mensaje').textContent = '';
    }
  });
}

// Guardar cambios del docente
const editarDocenteFormElem = document.getElementById('editarDocenteForm');
if (editarDocenteFormElem) {
  editarDocenteFormElem.addEventListener('submit', function(e) {
    e.preventDefault();

    const select = document.getElementById('docenteSelect');
    const index = select.value;
    if (index === "") {
      return alert('Seleccione un docente para editar.');
    }

    const dni = document.getElementById('dni').value.trim();
    const edad = parseInt(document.getElementById('edad').value);
    const password = document.getElementById('password').value;

    if (!dni || isNaN(edad) || !password) {
      document.getElementById('mensaje').textContent = 'Por favor, complete todos los campos correctamente.';
      return;
    }

    let docentes = loadDocentes();
    docentes[index].dni = dni;
    docentes[index].edad = edad;
    docentes[index].password = password;

    saveDocentes(docentes);

    document.getElementById('mensaje').style.color = 'green';
    document.getElementById('mensaje').textContent = 'Datos actualizados correctamente.';
  });
}

// Cargar docentes al cargar la página para editar
window.addEventListener('load', () => {
  if (document.getElementById('docenteSelect')) {
    cargarDocentesParaEditar();
  }
});


//ASIGNAR CURSOS
/* --- Cargar cursos y grados --- */
function cargarCursos() {
  const cursos = JSON.parse(localStorage.getItem('cursos')) || [];
  const selectCurso = document.getElementById('curso');
  if (!selectCurso) return;

  selectCurso.innerHTML = '<option value="" disabled selected>Seleccione un curso</option>';

  cursos.forEach(curso => {
    const option = document.createElement('option');
    option.value = curso;
    option.textContent = curso;
    selectCurso.appendChild(option);
  });
}

function cargarGrados() {
  const grados = JSON.parse(localStorage.getItem('grados')) || [];
  const selectGrado = document.getElementById('grado');
  if (!selectGrado) return;

  selectGrado.innerHTML = '<option value="" disabled selected>Seleccione un grado</option>';

  grados.forEach(grado => {
    const option = document.createElement('option');
    option.value = grado;
    option.textContent = grado;
    selectGrado.appendChild(option);
  });
}

/* --- Cargar docentes para asignar --- */
function cargarDocentesAsignar() {
  const docentes = loadDocentes();
  const select = document.getElementById('selectDocente');
  if (!select) return;
  select.innerHTML = '<option value="" disabled selected>Seleccione un docente</option>';

  docentes.forEach(doc => {
    const option = document.createElement('option');
    option.value = doc.idUsuario;
    option.textContent = `${doc.apellidoPaterno} ${doc.apellidoMaterno} (${doc.idUsuario})`;
    select.appendChild(option);
  });
}

/* --- Mostrar asignaciones de un docente --- */
function mostrarAsignacionesDocente(idUsuario) {
  const docentes = loadDocentes();
  const lista = document.getElementById('listaAsignaciones');
  lista.innerHTML = '';

  const docente = docentes.find(d => d.idUsuario === idUsuario);

  if (!docente || !docente.asignaciones || docente.asignaciones.length === 0) {
    lista.innerHTML = '<li>No tiene asignaciones.</li>';
    return;
  }

  docente.asignaciones.forEach(asignacion => {
    const li = document.createElement('li');
    li.textContent = `${asignacion.curso} - ${asignacion.grado}`;
    lista.appendChild(li);
  });
}

/* --- Asignar curso y grado --- */
function asignarCursoGrado() {
  const idUsuario = document.getElementById('selectDocente').value;
  const curso = document.getElementById('curso').value.trim();
  const grado = document.getElementById('grado').value.trim();
  const mensaje = document.getElementById('mensajeAsignar');

  if (!idUsuario || !curso || !grado) {
    mensaje.style.color = 'red';
    mensaje.textContent = 'Por favor, completa todos los campos.';
    return;
  }

  const docentes = loadDocentes();
  const docente = docentes.find(d => d.idUsuario === idUsuario);

  if (!docente) {
    mensaje.style.color = 'red';
    mensaje.textContent = 'Docente no encontrado.';
    return;
  }

  if (!docente.asignaciones) {
    docente.asignaciones = [];
  }

  // Verificar si ya está asignado ese curso y grado
  const existe = docente.asignaciones.some(a => a.curso === curso && a.grado === grado);
  if (existe) {
    mensaje.style.color = 'red';
    mensaje.textContent = 'Esta asignación ya existe para el docente.';
    return;
  }

  docente.asignaciones.push({ curso, grado });
  saveDocentes(docentes);

  mensaje.style.color = 'green';
  mensaje.textContent = 'Asignación guardada exitosamente.';

  // Limpiar campos y reset selects
  document.getElementById('curso').selectedIndex = 0;
  document.getElementById('grado').selectedIndex = 0;
  document.getElementById('selectDocente').selectedIndex = 0;

  document.getElementById('listaAsignaciones').innerHTML = '';
}

if (document.getElementById('btnAsignarCursoGrado')) {
  document.getElementById('btnAsignarCursoGrado').addEventListener('click', asignarCursoGrado);
}

window.addEventListener('load', () => {
  if (document.getElementById('selectDocente')) {
    cargarDocentesAsignar();
    cargarCursos();
    cargarGrados();

    const selectDocente = document.getElementById('selectDocente');
    selectDocente.addEventListener('change', () => {
      const id = selectDocente.value;
      if (id) mostrarAsignacionesDocente(id);
    });
  }
});


/* --- Mostrar y buscar docentes --- */
function mostrarDocentes(filtro = '') {
  const lista = document.getElementById('listaDocentes');
  const docentes = loadDocentes();

  let filtrados = docentes;

  // Si hay filtro, aplicar búsqueda
  if (filtro) {
    const criterio = filtro.toLowerCase().trim();
    filtrados = docentes.filter(doc =>
      doc.apellidoPaterno.toLowerCase().includes(criterio) ||
      doc.apellidoMaterno.toLowerCase().includes(criterio) ||
      doc.idUsuario.toLowerCase().includes(criterio)
    );
  }

  // Ordenar por apellido paterno
  filtrados.sort((a, b) => a.apellidoPaterno.localeCompare(b.apellidoPaterno));

  // Limpiar y mostrar
  lista.innerHTML = '';

  if (filtrados.length === 0) {
    lista.innerHTML = '<li>No se encontraron docentes.</li>';
    return;
  }

  filtrados.forEach(doc => {
    const li = document.createElement('li');
    li.textContent = `${doc.apellidoPaterno} ${doc.apellidoMaterno} - ID: ${doc.idUsuario}`;
    lista.appendChild(li);
  });
}

// Al cargar la página, mostrar todos los docentes
window.addEventListener('DOMContentLoaded', () => {
  mostrarDocentes();

  const buscarInput = document.getElementById('inputBuscar');
  if (buscarInput) {
    buscarInput.addEventListener('input', (e) => {
      mostrarDocentes(e.target.value);
    });
  }
});

// CREAR CURSO
function saveCurso(nombreCurso) {
  let cursos = JSON.parse(localStorage.getItem('cursos')) || [];
  if (cursos.includes(nombreCurso)) return false;
  cursos.push(nombreCurso);
  localStorage.setItem('cursos', JSON.stringify(cursos));
  return true;
}

const formCrearCurso = document.getElementById('formCrearCurso');
if (formCrearCurso) {
  formCrearCurso.addEventListener('submit', function(e) {
    e.preventDefault();
    const input = document.getElementById('nombreCurso');
    const nombreCurso = input.value.trim();
    const mensaje = document.getElementById('mensajeCurso');

    if (!nombreCurso) {
      mensaje.textContent = 'Ingrese un nombre válido.';
      mensaje.style.color = 'red';
      return;
    }

    const guardado = saveCurso(nombreCurso);
    if (!guardado) {
      mensaje.textContent = 'El curso ya existe.';
      mensaje.style.color = 'red';
    } else {
      mensaje.textContent = 'Curso creado exitosamente.';
      mensaje.style.color = 'green';
      input.value = '';
    }
  });
}

// CREAR GRADO
function saveGrado(nombreGrado) {
  let grados = JSON.parse(localStorage.getItem('grados')) || [];
  if (grados.includes(nombreGrado)) return false;
  grados.push(nombreGrado);
  localStorage.setItem('grados', JSON.stringify(grados));
  return true;
}

const formCrearGrado = document.getElementById('formCrearGrado');
if (formCrearGrado) {
  formCrearGrado.addEventListener('submit', function(e) {
    e.preventDefault();
    const input = document.getElementById('nombreGrado');
    const nombreGrado = input.value.trim();
    const mensaje = document.getElementById('mensajeGrado');

    if (!nombreGrado) {
      mensaje.textContent = 'Ingrese un nombre válido.';
      mensaje.style.color = 'red';
      return;
    }

    const guardado = saveGrado(nombreGrado);
    if (!guardado) {
      mensaje.textContent = 'El grado ya existe.';
      mensaje.style.color = 'red';
    } else {
      mensaje.textContent = 'Grado creado exitosamente.';
      mensaje.style.color = 'green';
      input.value = '';
    }
  });
}

// ELIMINAR CURSO
function cargarCursosParaEliminar() {
  const select = document.getElementById('selectCursoEliminar');
  const cursos = JSON.parse(localStorage.getItem('cursos')) || [];

  select.innerHTML = '<option value="" disabled selected>Selecciona un curso</option>';

  cursos.forEach(curso => {
    const option = document.createElement('option');
    option.value = curso;
    option.textContent = curso;
    select.appendChild(option);
  });
}

function eliminarCurso() {
  const select = document.getElementById('selectCursoEliminar');
  const mensaje = document.getElementById('mensajeEliminarCurso');
  const cursoSeleccionado = select.value;

  if (!cursoSeleccionado) {
    mensaje.textContent = 'Por favor, selecciona un curso.';
    mensaje.style.color = 'red';
    return;
  }

  let cursos = JSON.parse(localStorage.getItem('cursos')) || [];
  cursos = cursos.filter(c => c !== cursoSeleccionado);

  localStorage.setItem('cursos', JSON.stringify(cursos));

  mensaje.textContent = `Curso "${cursoSeleccionado}" eliminado correctamente.`;
  mensaje.style.color = 'green';

  cargarCursosParaEliminar();
}

if (document.getElementById('formEliminarCurso')) {
  document.addEventListener('DOMContentLoaded', cargarCursosParaEliminar);
  document.getElementById('formEliminarCurso').addEventListener('submit', function(e) {
    e.preventDefault();
    eliminarCurso();
  });
}

// ELIMINAR GRADO
function cargarGradosParaEliminar() {
  const select = document.getElementById('selectGradoEliminar');
  const grados = JSON.parse(localStorage.getItem('grados')) || [];

  select.innerHTML = '<option value="" disabled selected>Selecciona un grado</option>';

  grados.forEach(grado => {
    const option = document.createElement('option');
    option.value = grado;
    option.textContent = grado;
    select.appendChild(option);
  });
}

function eliminarGrado() {
  const select = document.getElementById('selectGradoEliminar');
  const mensaje = document.getElementById('mensajeEliminarGrado');
  const gradoSeleccionado = select.value;

  if (!gradoSeleccionado) {
    mensaje.textContent = 'Por favor, selecciona un grado.';
    mensaje.style.color = 'red';
    return;
  }

  let grados = JSON.parse(localStorage.getItem('grados')) || [];
  grados = grados.filter(g => g !== gradoSeleccionado);

  localStorage.setItem('grados', JSON.stringify(grados));

  mensaje.textContent = `Grado "${gradoSeleccionado}" eliminado correctamente.`;
  mensaje.style.color = 'green';

  cargarGradosParaEliminar();
}

if (document.getElementById('formEliminarGrado')) {
  document.addEventListener('DOMContentLoaded', cargarGradosParaEliminar);
  document.getElementById('formEliminarGrado').addEventListener('submit', function(e) {
    e.preventDefault();
    eliminarGrado();
  });
}


// AGREGAR ESTUDIANTE
// FUNCIONES PARA ESTUDIANTES

// Cargar grados en el formulario de registro
function cargarGradosEstudiantes() {
  const grados = JSON.parse(localStorage.getItem('grados')) || [];
  const select = document.getElementById('gradoEstudiante');
  if (!select) return;

  select.innerHTML = '<option value="" disabled selected>Seleccione un grado</option>';
  grados.forEach(grado => {
    const option = document.createElement('option');
    option.value = grado;
    option.textContent = grado;
    select.appendChild(option);
  });
}

// Generar un código único para el estudiante
function generarCodigoEstudiante() {
  const estudiantes = JSON.parse(localStorage.getItem('estudiantes')) || [];
  let codigo;
  do {
    codigo = 'EST' + Math.floor(1000 + Math.random() * 9000); // Ejemplo: EST4837
  } while (estudiantes.some(e => e.codigo === codigo));
  return codigo;
}

// Guardar estudiante en localStorage
function registrarEstudiante(e) {
  e.preventDefault();

  const apellidoPaterno = document.getElementById('apellidoPaterno').value.trim();
  const apellidoMaterno = document.getElementById('apellidoMaterno').value.trim();
  const nombres = document.getElementById('nombres').value.trim();
  const grado = document.getElementById('gradoEstudiante').value;
  const mensaje = document.getElementById('mensajeRegistroEstudiante');

  if (!apellidoPaterno || !apellidoMaterno || !nombres || !grado) {
    mensaje.textContent = 'Por favor, completa todos los campos.';
    mensaje.style.color = 'red';
    return;
  }

  const codigo = generarCodigoEstudiante();
  const nuevoEstudiante = {
    codigo,
    apellidoPaterno,
    apellidoMaterno,
    nombres,
    grado
  };

  let estudiantes = JSON.parse(localStorage.getItem('estudiantes')) || [];
  estudiantes.push(nuevoEstudiante);
  localStorage.setItem('estudiantes', JSON.stringify(estudiantes));

  mensaje.textContent = `Estudiante registrado con código: ${codigo}`;
  mensaje.style.color = 'green';

  // Limpiar el formulario
  document.getElementById('formRegistrarEstudiante').reset();
}

// Eventos al cargar la página de registro
if (document.getElementById('formRegistrarEstudiante')) {
  window.addEventListener('DOMContentLoaded', cargarGradosEstudiantes);
  document.getElementById('formRegistrarEstudiante').addEventListener('submit', registrarEstudiante);
}



// EDITAR ESTUDIANTE
/* --- Editar estudiante --- */

function cargarGradosEditar() {
  const grados = JSON.parse(localStorage.getItem('grados')) || [];
  const selectGrado = document.getElementById('gradoSeleccionado');
  const selectNuevoGrado = document.getElementById('editarGrado');

  if (selectGrado) {
    selectGrado.innerHTML = '<option value="" disabled selected>Seleccione un grado</option>';
    grados.forEach(grado => {
      const option = document.createElement('option');
      option.value = grado;
      option.textContent = grado;
      selectGrado.appendChild(option);
    });
  }

  if (selectNuevoGrado) {
    selectNuevoGrado.innerHTML = '<option value="" disabled selected>Seleccione un grado</option>';
    grados.forEach(grado => {
      const option = document.createElement('option');
      option.value = grado;
      option.textContent = grado;
      selectNuevoGrado.appendChild(option);
    });
  }
}

function cargarEstudiantesPorGrado(grado) {
  const estudiantes = JSON.parse(localStorage.getItem('estudiantes')) || [];
  const selectEstudiante = document.getElementById('estudianteSeleccionado');

  const filtrados = estudiantes.filter(est => est.grado === grado);

  selectEstudiante.innerHTML = '<option value="" disabled selected>Seleccione un estudiante</option>';
  filtrados.forEach(est => {
    const option = document.createElement('option');
    option.value = est.codigo;
    option.textContent = `${est.apellidoPaterno} ${est.apellidoMaterno}, ${est.nombres} (${est.codigo})`;
    selectEstudiante.appendChild(option);
  });
}

function mostrarDatosEstudiante(codigo) {
  const estudiantes = JSON.parse(localStorage.getItem('estudiantes')) || [];
  const estudiante = estudiantes.find(est => est.codigo === codigo);
  if (!estudiante) return;

  document.getElementById('editarApellidoPaterno').value = estudiante.apellidoPaterno;
  document.getElementById('editarApellidoMaterno').value = estudiante.apellidoMaterno;
  document.getElementById('editarNombres').value = estudiante.nombres;
  document.getElementById('editarGrado').value = estudiante.grado;
}

function guardarCambiosEstudiante(e) {
  e.preventDefault();
  const estudiantes = JSON.parse(localStorage.getItem('estudiantes')) || [];
  const codigo = document.getElementById('estudianteSeleccionado').value;

  const index = estudiantes.findIndex(est => est.codigo === codigo);
  if (index === -1) return;

  estudiantes[index].apellidoPaterno = document.getElementById('editarApellidoPaterno').value.trim();
  estudiantes[index].apellidoMaterno = document.getElementById('editarApellidoMaterno').value.trim();
  estudiantes[index].nombres = document.getElementById('editarNombres').value.trim();
  estudiantes[index].grado = document.getElementById('editarGrado').value;

  localStorage.setItem('estudiantes', JSON.stringify(estudiantes));

  const mensaje = document.getElementById('mensajeEditarEstudiante');
  mensaje.textContent = 'Estudiante actualizado correctamente.';
  mensaje.style.color = 'green';
}

/* --- Event Listeners --- */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('formEditarEstudiante')) {
    cargarGradosEditar();

    const selectGrado = document.getElementById('gradoSeleccionado');
    const selectEstudiante = document.getElementById('estudianteSeleccionado');
    const formEditar = document.getElementById('formEditarEstudiante');

    selectGrado.addEventListener('change', () => {
      const grado = selectGrado.value;
      cargarEstudiantesPorGrado(grado);
    });

    selectEstudiante.addEventListener('change', () => {
      const codigo = selectEstudiante.value;
      mostrarDatosEstudiante(codigo);
    });

    formEditar.addEventListener('submit', guardarCambiosEstudiante);
  }
});


//ELIMINAR ESTUDIANTE
/* --- Eliminar estudiante --- */

function cargarGradosEliminar() {
  const grados = JSON.parse(localStorage.getItem('grados')) || [];
  const selectGradoEliminar = document.getElementById('gradoEliminar');

  if (!selectGradoEliminar) return;

  selectGradoEliminar.innerHTML = '<option value="" disabled selected>Seleccione un grado</option>';

  grados.forEach(grado => {
    const option = document.createElement('option');
    option.value = grado;
    option.textContent = grado;
    selectGradoEliminar.appendChild(option);
  });
}

function cargarEstudiantesPorGradoEliminar(grado) {
  const estudiantes = JSON.parse(localStorage.getItem('estudiantes')) || [];
  const selectEstudianteEliminar = document.getElementById('estudianteEliminar');

  if (!selectEstudianteEliminar) return;

  const filtrados = estudiantes.filter(est => est.grado === grado);

  selectEstudianteEliminar.innerHTML = '<option value="" disabled selected>Seleccione un estudiante</option>';

  filtrados.forEach(est => {
    const option = document.createElement('option');
    option.value = est.codigo;
    option.textContent = `${est.apellidoPaterno} ${est.apellidoMaterno}, ${est.nombres} (${est.codigo})`;
    selectEstudianteEliminar.appendChild(option);
  });
}

function eliminarEstudiante() {
  const grado = document.getElementById('gradoEliminar').value;
  const codigo = document.getElementById('estudianteEliminar').value;
  const mensaje = document.getElementById('mensajeEliminarEstudiante');

  if (!grado) {
    mensaje.style.color = 'red';
    mensaje.textContent = 'Por favor, seleccione un grado.';
    return;
  }
  if (!codigo) {
    mensaje.style.color = 'red';
    mensaje.textContent = 'Por favor, seleccione un estudiante.';
    return;
  }

  let estudiantes = JSON.parse(localStorage.getItem('estudiantes')) || [];
  estudiantes = estudiantes.filter(est => est.codigo !== codigo);

  localStorage.setItem('estudiantes', JSON.stringify(estudiantes));

  mensaje.style.color = 'green';
  mensaje.textContent = 'Estudiante eliminado correctamente.';

  // Actualizar lista después de eliminar
  cargarEstudiantesPorGradoEliminar(grado);
}

/* --- Event Listeners para eliminar estudiante --- */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('formEliminarEstudiante')) {
    cargarGradosEliminar();

    document.getElementById('gradoEliminar').addEventListener('change', (e) => {
      cargarEstudiantesPorGradoEliminar(e.target.value);
    });

    document.getElementById('formEliminarEstudiante').addEventListener('submit', (e) => {
      e.preventDefault();
      eliminarEstudiante();
    });
  }
});



//PANEL DOCENTE ----- VER ESTUDIANTES POR GRADO

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('ver-estudiantes.html')) {
    const usuario = JSON.parse(sessionStorage.getItem('loggedUser'));
    if (!usuario || usuario.role !== 'profesor') {
      alert('Acceso denegado');
      window.location.href = 'index.html';
    }

    function obtenerGradosDocente() {
      const docentes = JSON.parse(localStorage.getItem('docentes')) || [];
      const docente = docentes.find(d => d.idUsuario === usuario.idUsuario);
      const grados = docente?.asignaciones?.map(a => a.grado) || [];
      return [...new Set(grados)];
    }

    function cargarGrados() {
      const grados = obtenerGradosDocente();
      const select = document.getElementById('selectGrado');
      if (!select) return;
      select.innerHTML = '<option value="" disabled selected>Seleccione un grado</option>';
      grados.forEach(grado => {
        const option = document.createElement('option');
        option.value = grado;
        option.textContent = grado;
        select.appendChild(option);
      });
    }

    function buscarEstudiantes() {
      const gradoSeleccionado = document.getElementById('selectGrado').value;
      const estudiantes = JSON.parse(localStorage.getItem('estudiantes')) || [];
      const lista = document.getElementById('listaEstudiantes');
      lista.innerHTML = '';

      const filtrados = estudiantes.filter(e => e.grado === gradoSeleccionado);

      if (filtrados.length === 0) {
        lista.innerHTML = '<li>No hay estudiantes en este grado.</li>';
        return;
      }

      filtrados.forEach(est => {
        const li = document.createElement('li');
        li.textContent = `${est.apellidoPaterno} ${est.apellidoMaterno}, ${est.nombres} - Código: ${est.codigo}`;
        lista.appendChild(li);
      });
    }

    // Hacer accesible la función desde HTML
    window.buscarEstudiantes = buscarEstudiantes;

    // Cargar grados al iniciar
    cargarGrados();
  }
});


//CREAR SESSION DE ASISTENCIAS

function cargarGradosAsignados() {
  const user = JSON.parse(sessionStorage.getItem('loggedUser'));
  const asignaciones = JSON.parse(localStorage.getItem('asignaciones')) || [];
  const grados = asignaciones
    .filter(a => a.docente === user.usuario)
    .map(a => a.grado);

  const gradoSelect = document.getElementById('gradoSelect');
  gradoSelect.innerHTML = '<option value="">-- Selecciona --</option>';
  grados.forEach(grado => {
    const option = document.createElement('option');
    option.value = grado;
    option.textContent = grado;
    gradoSelect.appendChild(option);
  });
}

function iniciarSesion() {
  const grado = document.getElementById('gradoSelect').value;
  if (!grado) return alert('Selecciona un grado');

  const user = JSON.parse(sessionStorage.getItem('loggedUser'));
  const asignaciones = JSON.parse(localStorage.getItem('asignaciones')) || [];
  const asignacion = asignaciones.find(a => a.docente === user.usuario && a.grado === grado);

  if (!asignacion) return alert('No tienes un curso asignado para este grado');

  const curso = asignacion.curso;
  document.getElementById('cursoAsignado').textContent = `Curso: ${curso}`;

  const estudiantes = JSON.parse(localStorage.getItem('estudiantes')) || [];
  const alumnosGrado = estudiantes.filter(e => e.grado === grado);

  const form = document.getElementById('asistenciasForm');
  form.innerHTML = '';

  alumnosGrado.forEach(est => {
    const div = document.createElement('div');
    div.innerHTML = `
      <label>${est.apellidos}, ${est.nombres}</label>
      <select name="${est.codigo}">
        <option value="asistencia">Asistencia</option>
        <option value="tardanza">Tardanza</option>
        <option value="falta">Falta</option>
      </select>
    `;
    form.appendChild(div);
  });

  const now = new Date();
  const fecha = now.toLocaleDateString();
  const horaInicio = now.toLocaleTimeString();

  document.getElementById('fechaSesion').textContent = fecha;
  document.getElementById('horaInicio').textContent = horaInicio;
  document.getElementById('infoSesion').style.display = 'block';

  sessionStorage.setItem('sesionActual', JSON.stringify({
    docente: user.usuario,
    grado,
    curso,
    fecha,
    horaInicio,
    alumnos: alumnosGrado.map(e => e.codigo)
  }));
}

function guardarAsistencias() {
  const form = document.getElementById('asistenciasForm');
  const formData = new FormData(form);
  const sesion = JSON.parse(sessionStorage.getItem('sesionActual'));

  const registros = [];
  for (let [codigo, estado] of formData.entries()) {
    registros.push({ codigo, estado });
  }

  const horaFin = new Date().toLocaleTimeString();
  document.getElementById('horaFin').textContent = horaFin;
  document.getElementById('horaFinContainer').style.display = 'block';

  const sesiones = JSON.parse(localStorage.getItem('sesiones')) || [];
  sesiones.push({
    ...sesion,
    registros,
    horaFin
  });

  localStorage.setItem('sesiones', JSON.stringify(sesiones));
  alert('Asistencias guardadas correctamente');
}

function cerrarSesion() {
  sessionStorage.removeItem('sesionActual');
  window.location.href = 'panel-profesor.html';
}

if (location.pathname.includes('crear-sesion.html')) {
  cargarGradosAsignados();
}


// MODIFICAR LA SESSION CREADA DE ASISTENCIA

function cargarGradosAsignadosModificar() {
  const user = JSON.parse(sessionStorage.getItem('loggedUser'));
  const asignaciones = JSON.parse(localStorage.getItem('asignaciones')) || [];
  const grados = asignaciones
    .filter(a => a.docente === user.usuario)
    .map(a => a.grado);

  const gradoSelect = document.getElementById('gradoSelect');
  gradoSelect.innerHTML = '<option value="">-- Selecciona --</option>';
  grados.forEach(grado => {
    const option = document.createElement('option');
    option.value = grado;
    option.textContent = grado;
    gradoSelect.appendChild(option);
  });
}

function buscarSesion() {
  const grado = document.getElementById('gradoSelect').value;
  const fecha = document.getElementById('fechaInput').value;
  if (!grado || !fecha) return alert('Selecciona grado y fecha');

  const user = JSON.parse(sessionStorage.getItem('loggedUser'));
  const sesiones = JSON.parse(localStorage.getItem('sesiones')) || [];

  const sesion = sesiones.find(s => 
    s.docente === user.usuario && 
    s.grado === grado && 
    s.fecha === new Date(fecha).toLocaleDateString()
  );

  if (!sesion) return alert('No se encontró una sesión para los datos seleccionados');

  const estudiantes = JSON.parse(localStorage.getItem('estudiantes')) || [];
  const alumnos = estudiantes.filter(e => sesion.alumnos.includes(e.codigo));

  const form = document.getElementById('modificarForm');
  form.innerHTML = '';

  alumnos.forEach(alumno => {
    const registro = sesion.registros.find(r => r.codigo === alumno.codigo);
    const div = document.createElement('div');
    div.innerHTML = `
      <label>${alumno.apellidos}, ${alumno.nombres}</label>
      <select name="${alumno.codigo}">
        <option value="asistencia" ${registro.estado === 'asistencia' ? 'selected' : ''}>Asistencia</option>
        <option value="tardanza" ${registro.estado === 'tardanza' ? 'selected' : ''}>Tardanza</option>
        <option value="falta" ${registro.estado === 'falta' ? 'selected' : ''}>Falta</option>
      </select>
    `;
    form.appendChild(div);
  });

  sessionStorage.setItem('sesionModificando', JSON.stringify({
    grado,
    fecha,
    docente: user.usuario
  }));

  document.getElementById('resultados').style.display = 'block';
}

function modificarAsistencias() {
  const sesionInfo = JSON.parse(sessionStorage.getItem('sesionModificando'));
  const sesiones = JSON.parse(localStorage.getItem('sesiones')) || [];
  const form = document.getElementById('modificarForm');
  const formData = new FormData(form);

  const index = sesiones.findIndex(s => 
    s.docente === sesionInfo.docente && 
    s.grado === sesionInfo.grado && 
    s.fecha === new Date(sesionInfo.fecha).toLocaleDateString()
  );

  if (index === -1) return alert('Error al modificar. No se encontró la sesión.');

  const nuevosRegistros = [];
  for (let [codigo, estado] of formData.entries()) {
    nuevosRegistros.push({ codigo, estado });
  }

  sesiones[index].registros = nuevosRegistros;
  localStorage.setItem('sesiones', JSON.stringify(sesiones));
  sessionStorage.removeItem('sesionModificando');

  alert('Sesión modificada correctamente');
  window.location.href = 'panel-profesor.html';
}

if (location.pathname.includes('modificar-sesion.html')) {
  cargarGradosAsignadosModificar();
}

// BUSCAR SESSION DE ASISTENCIAS
function cargarGradosAsignadosBusqueda() {
  const user = JSON.parse(sessionStorage.getItem('loggedUser'));
  const asignaciones = JSON.parse(localStorage.getItem('asignaciones')) || [];
  const grados = asignaciones
    .filter(a => a.docente === user.usuario)
    .map(a => a.grado);

  const gradoSelect = document.getElementById('gradoBuscar');
  gradoSelect.innerHTML = '<option value="">-- Selecciona --</option>';
  grados.forEach(grado => {
    const option = document.createElement('option');
    option.value = grado;
    option.textContent = grado;
    gradoSelect.appendChild(option);
  });
}

function verSesion() {
  const grado = document.getElementById('gradoBuscar').value;
  const fecha = document.getElementById('fechaBuscar').value;
  if (!grado || !fecha) return alert('Selecciona grado y fecha');

  const user = JSON.parse(sessionStorage.getItem('loggedUser'));
  const sesiones = JSON.parse(localStorage.getItem('sesiones')) || [];

  const sesion = sesiones.find(s => 
    s.docente === user.usuario && 
    s.grado === grado && 
    s.fecha === new Date(fecha).toLocaleDateString()
  );

  if (!sesion) return alert('No se encontró una sesión para los datos seleccionados');

  const estudiantes = JSON.parse(localStorage.getItem('estudiantes')) || [];
  const alumnos = estudiantes.filter(e => sesion.alumnos.includes(e.codigo));

  const asignaciones = JSON.parse(localStorage.getItem('asignaciones')) || [];
  const asignacion = asignaciones.find(a => a.docente === user.usuario && a.grado === grado);
  const curso = asignacion ? asignacion.curso : 'No asignado';

  const contenedor = document.getElementById('detalleSesion');
  contenedor.innerHTML = `
    <h3>Detalles de la Sesión</h3>
    <p><strong>Fecha:</strong> ${sesion.fecha}</p>
    <p><strong>Grado:</strong> ${sesion.grado}</p>
    <p><strong>Curso:</strong> ${curso}</p>
    <p><strong>Hora de Inicio:</strong> ${sesion.horaInicio}</p>
    <p><strong>Hora de Término:</strong> ${sesion.horaFin}</p>
    <h4>Lista de Asistencias:</h4>
    <ul>
      ${sesion.registros.map(r => {
        const alumno = alumnos.find(a => a.codigo === r.codigo);
        return `<li>${alumno ? `${alumno.apellidos}, ${alumno.nombres}` : 'Alumno no encontrado'} - <strong>${r.estado}</strong></li>`;
      }).join('')}
    </ul>
  `;
  contenedor.style.display = 'block';
}

if (location.pathname.includes('buscar-sesion.html')) {
  cargarGradosAsignadosBusqueda();
}


//VISUALIZAR LAS ASISTENCIAS EN EL PANEL ADMINISTRADOR

function cargarGradosParaAdmin() {
  const grados = JSON.parse(localStorage.getItem('grados')) || [];
  const gradoSelect = document.getElementById('gradoAdmin');
  gradoSelect.innerHTML = '<option value="">-- Selecciona --</option>';
  grados.forEach(grado => {
    const option = document.createElement('option');
    option.value = grado;
    option.textContent = grado;
    gradoSelect.appendChild(option);
  });
}

function buscarAsistencias() {
  const grado = document.getElementById('gradoAdmin').value;
  const fecha = document.getElementById('fechaAdmin').value;
  if (!grado || !fecha) return alert('Selecciona grado y fecha');

  const sesiones = JSON.parse(localStorage.getItem('sesiones')) || [];
  const sesion = sesiones.find(s => 
    s.grado === grado && 
    s.fecha === new Date(fecha).toLocaleDateString()
  );

  if (!sesion) return alert('No se encontró una sesión para esa fecha');

  const estudiantes = JSON.parse(localStorage.getItem('estudiantes')) || [];
  const alumnos = estudiantes.filter(e => sesion.alumnos.includes(e.codigo));

  const contenedor = document.getElementById('detalleAsistencia');
  contenedor.innerHTML = `
    <h3>Detalles de la Sesión</h3>
    <p><strong>Fecha:</strong> ${sesion.fecha}</p>
    <p><strong>Grado:</strong> ${sesion.grado}</p>
    <p><strong>Curso:</strong> ${sesion.curso || 'No registrado'}</p>
    <p><strong>Docente:</strong> ${sesion.docente}</p>
    <p><strong>Hora de Inicio:</strong> ${sesion.horaInicio}</p>
    <p><strong>Hora de Término:</strong> ${sesion.horaFin}</p>
    <h4>Asistencias:</h4>
    <ul>
      ${sesion.registros.map(r => {
        const alumno = alumnos.find(a => a.codigo === r.codigo);
        return `<li>${alumno ? `${alumno.apellidos}, ${alumno.nombres}` : 'Alumno no encontrado'} - <strong>${r.estado}</strong></li>`;
      }).join('')}
    </ul>
  `;
  contenedor.style.display = 'block';
}

if (location.pathname.includes('asistencias-admin.html')) {
  cargarGradosParaAdmin();
}
