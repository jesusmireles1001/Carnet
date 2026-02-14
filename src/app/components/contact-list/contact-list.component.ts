import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../services/contact.service'; // Asegúrate que esta ruta es correcta

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-list.component.html'
  // Sin styleUrl para evitar errores de archivo no encontrado
})
export class ContactListComponent {
  contactService = inject(ContactService);

  // --- VARIABLES (Signals) ---
  filtroCategoria = signal<string>(''); // Categoría seleccionada
  ordenColumna = signal<string>('nom'); // Columna para ordenar
  ordenDireccion = signal<'asc' | 'desc'>('asc'); // Dirección A-Z o Z-A
  menuAbierto = signal<boolean>(false); // Menú desplegable

  // NUEVO: Variable para guardar lo que escribes en el buscador
  terminoBusqueda = signal<string>('');

  // --- LISTA INTELIGENTE (Calculada automáticamente) ---
  contactosFiltrados = computed(() => {
    // 1. Empezamos con todos los contactos
    let lista = [...this.contactService.contacts()];

    // 2. FILTRO POR CATEGORÍA
    const categoria = this.filtroCategoria();
    if (categoria) {
      if (categoria === 'SIN_CATEGORIA') {
        lista = lista.filter(c => !c.categorie);
      } else {
        lista = lista.filter(c => c.categorie === categoria);
      }
    }

    // 3. NUEVO: FILTRO POR BUSCADOR
    const termino = this.terminoBusqueda().toLowerCase().trim();
    if (termino) {
      // Filtramos si el nombre O el apellido contiene las letras
      lista = lista.filter(c =>
        (c.nom || '').toLowerCase().includes(termino) ||
        (c.prenom || '').toLowerCase().includes(termino)
      );
    }

    // 4. ORDENAMIENTO
    const columna = this.ordenColumna();
    const direccion = this.ordenDireccion() === 'asc' ? 1 : -1;

    lista.sort((a: any, b: any) => {
      const valorA = (a[columna] || '').toLowerCase();
      const valorB = (b[columna] || '').toLowerCase();

      if (valorA < valorB) return -1 * direccion;
      if (valorA > valorB) return 1 * direccion;
      return 0;
    });

    return lista;
  });

  // --- FUNCIONES ---

  // Ordenar al hacer clic en encabezados
  cambiarOrden(columna: string) {
    if (this.ordenColumna() === columna) {
      this.ordenDireccion.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.ordenColumna.set(columna);
      this.ordenDireccion.set('asc');
    }
  }

  // Filtrar por categoría
  filtrarPor(categoria: string) {
    this.filtroCategoria.set(categoria);
    this.menuAbierto.set(false);
  }

  // Abrir/Cerrar menú
  toggleMenu() {
    this.menuAbierto.update(v => !v);
  }

  // NUEVO: Función que conecta el Input con la lógica
  buscar(evento: Event) {
    const input = evento.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
  }
}
