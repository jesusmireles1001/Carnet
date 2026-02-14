import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { Contact } from '../models/contact';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  http = inject(HttpClient);

  // --- CONFIGURACIÓN DE RED ---
  private baseUrl = window.location.hostname;
  private apiUrl = `http://${this.baseUrl}:3000/contacts`;
  private apiCatUrl = `http://${this.baseUrl}:3000/categories`;

  // --- SIGNALS (ESTADO) ---
  contacts = signal<Contact[]>([]);
  categories = signal<string[]>([]);
  contactActuel = signal<Contact>(this.initContact());
  enEdition = signal<boolean>(false);

  constructor() {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {
    this.cargarContactos();
    this.cargarCategorias();
  }

  // --- CRUD CONTACTOS CON "FRENO" (setTimeout) ---

  cargarContactos() {
    this.http.get<Contact[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error cargando contactos:', error);
        return of([]);
      })
    ).subscribe(data => this.contacts.set(data));
  }

  agregar(nuevoContacto: Contact) {
    return this.http.post<Contact>(this.apiUrl, nuevoContacto).subscribe({
      next: () => {
        // ESPERAMOS 500ms para que Windows suelte el archivo db.json
        setTimeout(() => {
          this.cargarContactos();
          this.resetFormulario();
        }, 500);
      },
      error: (e) => console.error('Error al guardar:', e)
    });
  }

  actualizar(contacto: Contact) {
    const url = `${this.apiUrl}/${contacto.id}`;

    // MIRA TU CONSOLA: Esto te confirmará que Angular sí está enviando el cambio
    console.log('ENVIANDO ACTUALIZACIÓN:', contacto);

    return this.http.put<Contact>(url, contacto).subscribe({
      next: () => {
        // Esperamos a que el servidor con delay termine de escribir
        setTimeout(() => {
          this.cargarContactos(); // Recarga la lista
          this.resetFormulario(); // Cierra el formulario y limpia
        }, 600); // Un poco más que el delay del servidor (500ms)
      },
      error: (e) => console.error('El servidor no responde:', e)
    });
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar contacto?')) {
      const url = `${this.apiUrl}/${String(id)}`;
      this.http.delete(url).subscribe({
        next: () => {
          setTimeout(() => this.cargarContactos(), 500);
        },
        error: (e) => console.error('Error al eliminar:', e)
      });
    }
  }

  // --- GESTIÓN DE CATEGORÍAS CON LIMPIEZA SEGURA ---

  cargarCategorias() {
    this.http.get<any[]>(this.apiCatUrl).pipe(
      catchError(() => of([]))
    ).subscribe(data => {
      const nombres = data.map(c => c.nom || c);
      this.categories.set(nombres);
    });
  }

  agregarCategoria(nombre: string) {
    this.http.post(this.apiCatUrl, { nom: nombre }).subscribe(() => {
      setTimeout(() => this.cargarCategorias(), 500);
    });
  }

  eliminarCategoria(nombre: string) {
    this.http.get<any[]>(this.apiCatUrl).subscribe(todas => {
      const encontrada = todas.find(c => c.nom === nombre);

      if (encontrada && encontrada.id) {
        // 1. Buscamos afectados
        const afectados = this.contacts().filter(c => c.categorie === nombre);

        // 2. Preparamos peticiones
        const peticiones = afectados.map(c =>
          this.http.put(`${this.apiUrl}/${c.id}`, { ...c, categorie: '' })
        );

        // 3. Ejecutamos limpieza
        const proceso = afectados.length > 0 ? forkJoin(peticiones) : of([]);

        proceso.subscribe({
          next: () => {
            // 4. Borramos la categoría con un pequeño retraso
            setTimeout(() => {
              this.http.delete(`${this.apiCatUrl}/${encontrada.id}`).subscribe(() => {
                setTimeout(() => this.cargarDatosIniciales(), 500);
              });
            }, 300);
          },
          error: (e) => console.error('Error en limpieza:', e)
        });
      }
    });
  }

  // --- UTILIDADES ---

  prepararEdicion(contacto: Contact) {
    // Clonamos el objeto para romper referencias viejas
    this.contactActuel.set({ ...contacto });
    this.enEdition.set(true);
  }

  resetFormulario() {
    this.contactActuel.set(this.initContact());
    this.enEdition.set(false);
  }

  private initContact(): Contact {
    return { id: 0, nom: '', prenom: '', adresseMail: '', numeroDeTelephone: '', adresse: '', ville: '', categorie: '' };
  }
}
