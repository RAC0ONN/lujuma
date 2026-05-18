import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService} from '../services/usuario.service';
import { AlimentoDTO} from '../models/alimento.dto';
import { RecetaCreadaDTO} from '../models/receta-creada.dto';
import { ComidaDTO, TipoComida } from '../models/comida.dto';

@Component({
  selector: 'app-user-main',
  standalone: false,
  templateUrl: './user-main.html',
  styleUrls: ['./user-main.css'],
})
export class UserMain implements OnInit {
  seccionActiva: string = 'dashboard';
  usuario: any = null;

  /*Se inicializa el alimento teniendxo en cuanta el molde definido en
  * el registro completo, aqui estan los valores por defecto*/
  nuevoAlimento: AlimentoDTO = {
    nombre: '',
    esLiquido: false,
    porcion: 100,
    proteina: 0,
    carbohidrato: 0,
    grasa: 0,
    caloria: 0,
    azucar: 0,
    idUsuario: 0
  };
  estadoAlimentoSeleccionado: string = 'solido';

  nombreReceta: string = '';
  alimentosDelSistema: AlimentoDTO[] = [];
  alimentosFiltradosParaSelect: AlimentoDTO[] = [];
  alimentosAgregadosAReceta: AlimentoDTO[] = [];
  idAlimentoSeleccionadoActual: string = '';

  listaRecetasDisponibles: RecetaCreadaDTO[] = [];
  recetasSeleccionadasIds: number[] = [];
  mostrarModalComida: boolean = false;
  tipoComidaSeleccionadaModal!: TipoComida;
  comidasDelDia: Record<TipoComida, ComidaDTO> = {
    BREAKFAST: { tipo: 'BREAKFAST', caloria: 0, grasa: 0, carbohidrato: 0, proteina: 0, azucar: 0, idUsuario: 0 },
    LUNCH: { tipo: 'LUNCH', caloria: 0, grasa: 0, carbohidrato: 0, proteina: 0, azucar: 0, idUsuario: 0 },
    DINNER: { tipo: 'DINNER', caloria: 0, grasa: 0, carbohidrato: 0, proteina: 0, azucar: 0, idUsuario: 0 },
    SNACKS: { tipo: 'SNACKS', caloria: 0, grasa: 0, carbohidrato: 0, proteina: 0, azucar: 0, idUsuario: 0 }
  };



  constructor(private router: Router, private usuarioService: UsuarioService ) {}
  //Metodo apenas abre el componente main
  ngOnInit(): void {
    const datosGuardados = localStorage.getItem('usuarioLogueado');

    if (datosGuardados) {
      this.usuario = JSON.parse(datosGuardados);

      this.nuevoAlimento.idUsuario = this.usuario.idUsuario;
      Object.keys(this.comidasDelDia).forEach(key => {
        this.comidasDelDia[key as TipoComida].idUsuario = this.usuario.idUsuario;
      });

      this.cargarAlimentosDisponibles();
      this.cargarComidasDelUsuario();
      this.cargarRecetasParaModal();

      // 🚀 Aseguramos que la sección activa sea el dashboard desde el arranque
      this.seccionActiva = 'dashboard';
    } else {
      alert('Please sign in first.');
      this.router.navigate(['/']);
    }
  }

  // --- MÉTODOS DE COMIDAS OPTIMIZADOS ---

  cargarComidasDelUsuario() {
    this.usuarioService.obtenerComidasPorUsuario(this.usuario.idUsuario).subscribe({
      next: (comidas) => {
        this.resetearContadoresComidas();
        comidas.forEach(c => {
          if (this.comidasDelDia[c.tipo]) {
            this.comidasDelDia[c.tipo] = c;
          }
        });
           },
      error: (err) => {
        if (err.status === 404 || err.error?.message?.includes('No hay comidas')) {
          console.log('Iniciando el día limpio: Contadores fijados en 0.');
          this.resetearContadoresComidas();
        } else {
          console.error('Error cargando comidas del usuario:', err);
        }
      }
    });
  }

  resetearContadoresComidas() {
    const tipos: TipoComida[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'];
    tipos.forEach(tipo => {
      this.comidasDelDia[tipo] = {
        idComida: undefined,
        tipo: tipo,
        caloria: 0,
        grasa: 0,
        carbohidrato: 0,
        proteina: 0,
        azucar: 0,
        idUsuario: this.usuario ? this.usuario.idUsuario : 0
      };
    });
     }

// 2. Decide inteligentemente si guarda una nueva comida o añade recetas a una ya existente
  guardarRecetasEnComida() {
    if (this.recetasSeleccionadasIds.length === 0) {
      alert("Please select at least one recipe.");
      return;
    }

    // Buscamos si este tipo de comida ya tiene un registro previo inspeccionando si posee un ID
    const comidaActual = this.comidasDelDia[this.tipoComidaSeleccionadaModal];

    // Clonamos e inyectamos los nuevos valores y las recetas seleccionadas
    const comidaDTO: ComidaDTO = {
      ...comidaActual,
      idUsuario: this.usuario.idUsuario,
      idRecetas: this.recetasSeleccionadasIds.map(id => Number(id)) // Forzar casteo a número
    };

    // Si ya tiene idComida, llamamos a actualizar. Si no, a crearComida.
    if (comidaActual.idComida) {
      console.log('Actualizando comida existente en el Back...', comidaDTO);
      // NOTA: Si no tienes el endpoint "actualizarComida" expuesto en tu UsuarioService,
      // asegúrate de agregarlo apuntando a `${this.URL_COMIDA}/ActualizarComida` usando tu método http.put o http.post
      this.usuarioService.crearComida(comidaDTO).subscribe({
        next: () => this.procesarRespuestaExitosa(),
        error: (err) => console.error(err)
      });
    } else {
      console.log('Creando nuevo contenedor de comida en el Back...', comidaDTO);
      this.usuarioService.crearComida(comidaDTO).subscribe({
        next: () => this.procesarRespuestaExitosa(),
        error: (err) => {
          console.error('Error al guardar comida:', err);
          alert('Could not save your meal selection.');
        }
      });
    }
  }

  procesarRespuestaExitosa() {
    alert(`✔ Your ${this.tipoComidaSeleccionadaModal.toLowerCase()} macros have been synchronized!`);
    this.cerrarModalComida();
    this.cargarComidasDelUsuario(); // 🚀 Recarga instantáneamente y pinta la sumatoria del Back
  }

  cargarRecetasParaModal() {
    this.usuarioService.obtenerRecetas().subscribe({
      next: (recetas) => this.listaRecetasDisponibles = recetas,
      error: (err) => console.error('Error al cargar recetas:', err)
    });
  }

  abrirModalComida(tipo: TipoComida) {
    this.tipoComidaSeleccionadaModal = tipo;
    this.recetasSeleccionadasIds = []; // Resetear selección anterior
    this.mostrarModalComida = true;
  }

  cerrarModalComida() {
    this.mostrarModalComida = false;
  }





  cambiarSeccion(target: string) {
    this.seccionActiva = target;
  }
  registrarNuevoAlimento() {
    if (!this.nuevoAlimento.nombre.trim()) {
      alert('Please enter a valid name for the food.');
      return;
    }

    // Convertimos el estado del select HTML a la variable booleana esperada en el Back
    this.nuevoAlimento.esLiquido = (this.estadoAlimentoSeleccionado === 'liquido');

    console.log('Enviando alimento al servidor...', this.nuevoAlimento);

    this.usuarioService.guardarAlimento(this.nuevoAlimento).subscribe({
      next: (res) => {
        console.log('Respuesta del servidor:', res);
        alert(`✔ Success: ${this.nuevoAlimento.nombre} has been saved successfully.`);
        this.limpiarFormularioAlimento();
      },
      error: (err) => {
        console.error('Error al guardar el alimento:', err);
        alert('Could not save food: ' + (err.error?.message || err.message));
      }
    });
  }

  // Resetea los campos del formulario para un nuevo ingreso
  limpiarFormularioAlimento() {
    this.nuevoAlimento = {
      nombre: '',
      esLiquido: false,
      porcion: 100,
      proteina: 0,
      carbohidrato: 0,
      grasa: 0,
      caloria: 0,
      azucar: 0,
      idUsuario: this.usuario ? this.usuario.idUsuario : 0
    };
    this.estadoAlimentoSeleccionado = 'solido';
  }
// Trae los alimentos de la BD y los prepara
  cargarAlimentosDisponibles() {
    this.usuarioService.obtenerTodosLosAlimentos().subscribe({
      next: (alimentos) => {
        this.alimentosDelSistema = alimentos;
        // Opcional: Si quieres que el usuario solo vea sus propios alimentos, puedes descomentar la siguiente línea:
        // this.alimentosDelSistema = alimentos.filter(a => a.idUsuario === this.usuario.idUsuario);

        this.alimentosFiltradosParaSelect = [...this.alimentosDelSistema];
      },
      error: (err) => console.error('Error cargando alimentos para recetas:', err)
    });
  }

  // 🚀 Se ejecuta cuando el usuario selecciona un alimento en el desplegable
  alimentoCambioSelect() {
    if (!this.idAlimentoSeleccionadoActual) return;

    const idBuscado = Number(this.idAlimentoSeleccionadoActual);
    const alimentoEncontrado = this.alimentosFiltradosParaSelect.find(a => a.idAlimento === idBuscado);

    if (alimentoEncontrado) {
      // 1. Lo metemos en el arreglo de los chips visuales
      this.alimentosAgregadosAReceta.push(alimentoEncontrado);

      // 2. Lo removemos del select para que no lo escoja dos veces por duplicado
      this.alimentosFiltradosParaSelect = this.alimentosFiltradosParaSelect.filter(a => a.idAlimento !== idBuscado);
    }

    // Reseteamos el valor por defecto del select
    this.idAlimentoSeleccionadoActual = '';
  }

  // 🚀 Se ejecuta al darle clic a la (X) del chip
  removerAlimentoDeReceta(alimento: AlimentoDTO) {
    // 1. Lo sacamos de la lista de chips
    this.alimentosAgregadosAReceta = this.alimentosAgregadosAReceta.filter(a => a.idAlimento !== alimento.idAlimento);

    // 2. Lo devolvemos al select para que vuelva a estar disponible
    this.alimentosFiltradosParaSelect.push(alimento);
    // Ordenamos alfabéticamente el select de nuevo
    this.alimentosFiltradosParaSelect.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  // 🚀 Procesa el guardado completo de la Receta Creada
  registrarNuevaReceta() {
    if (!this.nombreReceta.trim()) {
      alert('Please enter a name for your recipe.');
      return;
    }

    if (this.alimentosAgregadosAReceta.length === 0) {
      alert('Your recipe must contain at least one food.');
      return;
    }

    // Mapeamos los objetos de alimentos agregados a un simple vector purificado de IDs númericos
    const listaIds: number[] = this.alimentosAgregadosAReceta.map(a => a.idAlimento!);

    // Formateamos la fecha a estricto YYYY-MM-DD para java.sql.Date
    const fechaHoyStr = new Date().toISOString().substring(0, 10);

    const nuevaRecetaDTO: RecetaCreadaDTO = {
      nombre: this.nombreReceta.trim(),
      fecha: fechaHoyStr,
      idUsuario: this.usuario.idUsuario,
      idAlimentos: listaIds
    };

    console.log('Despachando receta al Back-End...', nuevaRecetaDTO);

    this.usuarioService.guardarRecetaCreada(nuevaRecetaDTO).subscribe({
      next: (res) => {
        alert(`✔ Recipe "${nuevaRecetaDTO.nombre}" successfully saved with its macro breakdown!`);
        this.limpiarFormularioReceta();
      },
      error: (err) => {
        console.error('Error al guardar receta:', err);
        alert('Could not save recipe: ' + (err.error?.message || err.message));
      }
    });
  }

  limpiarFormularioReceta() {
    this.nombreReceta = '';
    this.alimentosAgregadosAReceta = [];
    this.idAlimentoSeleccionadoActual = '';
    this.alimentosFiltradosParaSelect = [...this.alimentosDelSistema];
  }

  //Metodos para el calculo de macronutrientes ingeridos y faltantes
  get totalCaloriasConsumidas(): number {
    return (this.comidasDelDia['BREAKFAST']?.caloria || 0) +
      (this.comidasDelDia['LUNCH']?.caloria || 0) +
      (this.comidasDelDia['DINNER']?.caloria || 0) +
      (this.comidasDelDia['SNACKS']?.caloria || 0);
  }

  get totalGrasasConsumidas(): number {
    return (this.comidasDelDia['BREAKFAST']?.grasa || 0) +
      (this.comidasDelDia['LUNCH']?.grasa || 0) +
      (this.comidasDelDia['DINNER']?.grasa || 0) +
      (this.comidasDelDia['SNACKS']?.grasa || 0);
  }

  get totalCarbohidratosConsumidos(): number {
    return (this.comidasDelDia['BREAKFAST']?.carbohidrato || 0) +
      (this.comidasDelDia['LUNCH']?.carbohidrato || 0) +
      (this.comidasDelDia['DINNER']?.carbohidrato || 0) +
      (this.comidasDelDia['SNACKS']?.carbohidrato || 0);
  }

  get totalProteinasConsumidas(): number {
    return (this.comidasDelDia['BREAKFAST']?.proteina || 0) +
      (this.comidasDelDia['LUNCH']?.proteina || 0) +
      (this.comidasDelDia['DINNER']?.proteina || 0) +
      (this.comidasDelDia['SNACKS']?.proteina || 0);
  }

  get totalAzucarConsumidas(): number {
    return (this.comidasDelDia['BREAKFAST']?.azucar || 0) +
      (this.comidasDelDia['LUNCH']?.azucar || 0) +
      (this.comidasDelDia['DINNER']?.azucar || 0) +
      (this.comidasDelDia['SNACKS']?.azucar || 0);
  }

  // 2. Métodos para obtener lo FALTANTE (Objetivo - Consumido)
  // Usamos Math.max(0, ...) para evitar que salgan números negativos si el usuario se pasa de su meta



  // --- 🚀 MÉTODOS GET RECOLECTORES Y REACTIVOS ---

  get caloriasFaltantes(): number {
    const objetivo = Number(this.usuario?.caloria) || 0;
    return Math.max(0, objetivo - this.totalCaloriasConsumidas);
  }

  get grasasFaltantes(): number {
    const objetivo = Number(this.usuario?.grasa) || 0;
    return Math.max(0, objetivo - this.totalGrasasConsumidas);
  }

  get carbohidratosFaltantes(): number {
    const objetivo = Number(this.usuario?.carbohidrato) || 0;
    return Math.max(0, objetivo - this.totalCarbohidratosConsumidos);
  }

  get proteinasFaltantes(): number {
    const objetivo = Number(this.usuario?.proteina) || 0;
    return Math.max(0, objetivo - this.totalProteinasConsumidas);
  }

  get azucarFaltantes(): number {
    const objetivo = Number(this.usuario?.azucar) || 0;
    return Math.max(0, objetivo - this.totalAzucarConsumidas);
  }
}
