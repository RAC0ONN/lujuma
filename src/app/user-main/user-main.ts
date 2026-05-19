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
  mostrarGuiaBienvenida: boolean = false;

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
    SNACK: { tipo: 'SNACK', caloria: 0, grasa: 0, carbohidrato: 0, proteina: 0, azucar: 0, idUsuario: 0 }
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
      this.cargarLibroDeRecetas();
      this.inicializarDatosCalendario();
      this.mostrarGuiaBienvenida = true;
     this.seccionActiva = 'dashboard';
    } else {
      alert('Please sign in first.');
      this.router.navigate(['/']);
    }
  }
  cerrarGuiaBienvenida() {
    this.mostrarGuiaBienvenida = false;
  }

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
    const tipos: TipoComida[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
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

 guardarRecetasEnComida() {
    if (this.recetasSeleccionadasIds.length === 0) {
      alert("Please select at least one recipe");
      return;
    }
    const comidaActual = this.comidasDelDia[this.tipoComidaSeleccionadaModal];

        const comidaDTO: ComidaDTO = {
      ...comidaActual,
      idUsuario: this.usuario.idUsuario,
      idRecetas: this.recetasSeleccionadasIds.map(id => Number(id)) // Forzar casteo a número
    };

      if (comidaActual.idComida) {
        this.usuarioService.crearComida(comidaDTO).subscribe({
        next: () => this.procesarRespuestaExitosa(),
        error: (err) => console.error(err)
      });
    } else {
       this.usuarioService.crearComida(comidaDTO).subscribe({
        next: () => this.procesarRespuestaExitosa(),
        error: (err) => {
           alert('Could not save your meal selection');
        }
      });
    }
  }

  procesarRespuestaExitosa() {
    alert(`Your ${this.tipoComidaSeleccionadaModal.toLowerCase()} macros have been synchronized😉!`);
    this.cerrarModalComida();
    this.cargarComidasDelUsuario();
  }

  cargarRecetasParaModal() {
    this.usuarioService.obtenerRecetas().subscribe({
      next: (recetas) => this.listaRecetasDisponibles = recetas,
      error: (err) => console.error('Error al cargar recetas:', err)
    });
  }

  abrirModalComida(tipo: TipoComida) {
    this.tipoComidaSeleccionadaModal = tipo;
    this.recetasSeleccionadasIds = [];
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

       this.nuevoAlimento.esLiquido = (this.estadoAlimentoSeleccionado === 'liquido');

     this.usuarioService.guardarAlimento(this.nuevoAlimento).subscribe({
      next: (res) => {
          alert(`Success: ${this.nuevoAlimento.nombre} has been saved successfully🧀.`);
        this.limpiarFormularioAlimento();
      },
      error: (err) => {
          alert('Could not save food: ' + (err.error?.message || err.message));
      }
    });
  }

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
  cargarAlimentosDisponibles() {
    this.usuarioService.obtenerTodosLosAlimentos().subscribe({
      next: (alimentos) => {
        this.alimentosDelSistema = alimentos;

        this.alimentosFiltradosParaSelect = [...this.alimentosDelSistema];
      },
      error: (err) => console.error('eRROR', err)
    });
  }

   alimentoCambioSelect() {
    if (!this.idAlimentoSeleccionadoActual) return;

    const idBuscado = Number(this.idAlimentoSeleccionadoActual);
    const alimentoEncontrado = this.alimentosFiltradosParaSelect.find(a => a.idAlimento === idBuscado);

    if (alimentoEncontrado) {
       this.alimentosAgregadosAReceta.push(alimentoEncontrado);

       this.alimentosFiltradosParaSelect = this.alimentosFiltradosParaSelect.filter(a => a.idAlimento !== idBuscado);
    }

     this.idAlimentoSeleccionadoActual = '';
  }

   removerAlimentoDeReceta(alimento: AlimentoDTO) {
     this.alimentosAgregadosAReceta = this.alimentosAgregadosAReceta.filter(a => a.idAlimento !== alimento.idAlimento);
     this.alimentosFiltradosParaSelect.push(alimento);
     this.alimentosFiltradosParaSelect.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  registrarNuevaReceta() {
    if (!this.nombreReceta.trim()) {
      alert('Please enter a name for your recipe🍜');
      return;
    }

    if (this.alimentosAgregadosAReceta.length === 0) {
      alert('Your recipe must contain at least one food🍵');
      return;
    }

     const listaIds: number[] = this.alimentosAgregadosAReceta.map(a => a.idAlimento!);

     const fechaHoyStr = new Date().toISOString().substring(0, 10);

    const nuevaRecetaDTO: RecetaCreadaDTO = {
      nombre: this.nombreReceta.trim(),
      fecha: fechaHoyStr,
      idUsuario: this.usuario.idUsuario,
      idAlimentos: listaIds
    };

    this.usuarioService.guardarRecetaCreada(nuevaRecetaDTO).subscribe({
      next: (res) => {
        alert(`Recipe "${nuevaRecetaDTO.nombre}" successfully saved🍜!`);
        this.limpiarFormularioReceta();
      },
      error: (err) => {
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

   get totalCaloriasConsumidas(): number {
    return (this.comidasDelDia['BREAKFAST']?.caloria || 0) +
      (this.comidasDelDia['LUNCH']?.caloria || 0) +
      (this.comidasDelDia['DINNER']?.caloria || 0) +
      (this.comidasDelDia['SNACK']?.caloria || 0);
  }

  get totalGrasasConsumidas(): number {
    return (this.comidasDelDia['BREAKFAST']?.grasa || 0) +
      (this.comidasDelDia['LUNCH']?.grasa || 0) +
      (this.comidasDelDia['DINNER']?.grasa || 0) +
      (this.comidasDelDia['SNACK']?.grasa || 0);
  }

  get totalCarbohidratosConsumidos(): number {
    return (this.comidasDelDia['BREAKFAST']?.carbohidrato || 0) +
      (this.comidasDelDia['LUNCH']?.carbohidrato || 0) +
      (this.comidasDelDia['DINNER']?.carbohidrato || 0) +
      (this.comidasDelDia['SNACK']?.carbohidrato || 0);
  }

  get totalProteinasConsumidas(): number {
    return (this.comidasDelDia['BREAKFAST']?.proteina || 0) +
      (this.comidasDelDia['LUNCH']?.proteina || 0) +
      (this.comidasDelDia['DINNER']?.proteina || 0) +
      (this.comidasDelDia['SNACK']?.proteina || 0);
  }

  get totalAzucarConsumidas(): number {
    return (this.comidasDelDia['BREAKFAST']?.azucar || 0) +
      (this.comidasDelDia['LUNCH']?.azucar || 0) +
      (this.comidasDelDia['DINNER']?.azucar || 0) +
      (this.comidasDelDia['SNACK']?.azucar || 0);
  }

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

  // Libro de recetas
  listaRecetasPredeterminadas: any[] = [];
  paginaActual: number = 0;

    cargarLibroDeRecetas() {
    this.usuarioService.obtenerRecetasPredeterminadas().subscribe({
      next: (recetas) => {
        this.listaRecetasPredeterminadas = recetas;
          },
      error: (err) => console.error('Error :', err)
    });
  }
//Para pasar las paginas del libro
  paginaSiguiente() {
    if (this.paginaActual < this.listaRecetasPredeterminadas.length) {
      this.paginaActual++;
    }
  }

  paginaAnterior() {
    if (this.paginaActual > 0) {
      this.paginaActual--;
    }
  }
 get recetaActiva(): any {
    if (this.paginaActual === 0 || this.listaRecetasPredeterminadas.length === 0) {
      return null;
    }
    return this.listaRecetasPredeterminadas[this.paginaActual - 1];
  }

  //Metodos opara los reportes
  mostrarModalReporte: boolean = false;
  listaReportes: any[] = [];

  navegarASeccion(target: string) {
    this.seccionActiva = target;
  }

  abrirModalReporte() {
    this.mostrarModalReporte = true;
  }

  cerrarModalReporte() {
    this.mostrarModalReporte = false;
  }

  confirmarYGenerarReporte() {
    if (!this.usuario || !this.usuario.idUsuario) {
      alert('User session not found. Please log in again.');
      return;
    }

    const idUsuario = this.usuario.idUsuario;
    const idComidasActuales: number[] = [];
    const ahora = new Date();

    const infoReporte = `Your macronutrients intakes has been of: ${this.totalCaloriasConsumidas} kcal (Proteins: ${this.totalProteinasConsumidas}g, Carbs: ${this.totalCarbohidratosConsumidos}g, Fats: ${this.totalGrasasConsumidas}g, Sugar: ${this.totalAzucarConsumidas}g)`;

    const reporteDTO = {
      fecha: ahora,
      informacion: infoReporte,
      idUsuario: idUsuario
    };

    this.usuarioService.guardarReporte(reporteDTO, idComidasActuales).subscribe({
      next: (response) => {

        this.cerrarModalReporte();

        this.listaReportes = [{
          idReporte: response?.idReporte || 1,
          fecha: response?.fecha ? new Date(response.fecha).toLocaleString() : ahora.toLocaleString(),
          informacion: response?.informacion || infoReporte
        }];

        alert('Report successfully generated!');
      },
      error: (err) => {
        alert('Could not save the report');
      }
    });
  }
// Metodos para el reporte
  fechaActual: Date = new Date();
  diaSeleccionado: number = new Date().getDate();
  mesSeleccionadoIndex: number = new Date().getMonth();
  anioSeleccionado: number = new Date().getFullYear();

  diasDelMes: number[] = [];
  espaciosBlancosInicio: number[] = [];

  datosCalendarioBack: any = null;
  reportesDelDiaSeleccionado: any[] = [];

  mesesAnio: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  diasSemana: string[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  inicializarDatosCalendario() {
    if (!this.usuario || !this.usuario.idUsuario) return;

    this.usuarioService.obtenerCalendarioPorUsuario(this.usuario.idUsuario).subscribe({
      next: (data) => this.datosCalendarioBack = data,
      error: (err) => console.error('Error Calendario DTO:', err)
    });

    this.usuarioService.obtenerReportes(this.usuario.idUsuario).subscribe({
      next: (reportes) => {
        if (reportes) {
          this.listaReportes = reportes;
          this.generarCalendarioMalla();
          this.seleccionarDia(this.diaSeleccionado);
        }
      }
    });
  }

  generarCalendarioMalla() {
    this.diasDelMes = [];
    this.espaciosBlancosInicio = [];

    const primerDia = new Date(this.anioSeleccionado, this.mesSeleccionadoIndex, 1);

    const ultimoDia = new Date(this.anioSeleccionado, this.mesSeleccionadoIndex + 1, 0);

     const diaSemanaInicio = primerDia.getDay();
    for (let i = 0; i < diaSemanaInicio; i++) {
      this.espaciosBlancosInicio.push(i);
    }

    const totalDias = ultimoDia.getDate();
    for (let d = 1; d <= totalDias; d++) {
      this.diasDelMes.push(d);
    }
  }

  seleccionarDia(dia: number) {
    this.diaSeleccionado = dia;
    this.reportesDelDiaSeleccionado = this.listaReportes.filter(rep => {
      if (!rep.fecha) return false;
      const f = new Date(rep.fecha);
      return f.getDate() === dia &&
        f.getMonth() === this.mesSeleccionadoIndex &&
        f.getFullYear() === this.anioSeleccionado;
    });
  }

  diaTieneReporte(dia: number): boolean {
    return this.listaReportes.some(rep => {
      if (!rep.fecha) return false;
      const f = new Date(rep.fecha);
      return f.getDate() === dia &&
        f.getMonth() === this.mesSeleccionadoIndex &&
        f.getFullYear() === this.anioSeleccionado;
    });
  }

  cambiarMes(direccion: number) {
    this.mesSeleccionadoIndex += direccion;
    if (this.mesSeleccionadoIndex > 11) {
      this.mesSeleccionadoIndex = 0;
      this.anioSeleccionado++;
    } else if (this.mesSeleccionadoIndex < 0) {
      this.mesSeleccionadoIndex = 11;
      this.anioSeleccionado--;
    }
    this.generarCalendarioMalla();
    this.seleccionarDia(1);
  }






}
