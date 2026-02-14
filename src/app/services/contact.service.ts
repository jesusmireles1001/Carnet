import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Contact } from '../models/contact';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  http = inject(HttpClient);

  // --- CONFIGURACIÓN AUTOMÁTICA (IP) ---
  private baseUrl = window.location.hostname;
  private apiUrl = `http://${this.baseUrl}:3000/contacts`;
  private apiCatUrl = `http://${this.baseUrl}:3000/categories`;

  // --- ESTRATEGIA DE REINTENTO (ANTIBLOQUEO) ---
  // Si Windows bloquea el archivo, reintenta 3 veces esperando 1 segundo
  private retryConfig = { count: 3, delay: 1000 };

  // --- ESTADO (SIGNALS) ---
  contacts = signal<Contact[]>([]);
  categories = signal<string[]>([]);
  contactActuel = signal<Contact>(this.initContact());
  enEdition = signal<boolean>(false);
  cargando = signal<boolean>(false);

  constructor() {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {
    this.cargarContactos();
    this.cargarCategorias();
  }

  // --- CRUD CONTACTOS ---

  cargarContactos() {
    this.http.get<Contact[]>(this.apiUrl)
      .pipe(
        retry(this.retryConfig),
        catchError(e => { console.error('Error red:', e); return of([]); })
      )
      .subscribe(data => this.contacts.set(data));
  }

  agregar(nuevoContacto: Contact) {
    this.cargando.set(true);
    return this.http.post<Contact>(this.apiUrl, nuevoContacto)
      .pipe(retry(this.retryConfig))
      .subscribe({
        next: () => {
          this.cargarContactos();
          this.resetFormulario();
          this.cargando.set(false);
        },
        error: (e) => {
          console.error('Error fatal:', e);
          this.cargando.set(false);
        }
      });
  }

  actualizar(contacto: Contact) {
    this.cargando.set(true);
    const url = `${this.apiUrl}/${String(contacto.id)}`;

    return this.http.put<Contact>(url, contacto)
      .pipe(retry(this.retryConfig))
      .subscribe({
        next: () => {
          this.cargarContactos();
          this.resetFormulario();
          this.cargando.set(false);
        },
        error: (e) => {
          console.error('Error actualizando:', e);
          this.cargando.set(false);
        }
      });
  }

  eliminar(id: number) {
    if (confirm('Confirmer la suppression ?')) {
      const url = `${this.apiUrl}/${String(id)}`;
      this.http.delete(url)
        .pipe(retry(this.retryConfig))
        .subscribe(() => this.cargarContactos());
    }
  }

  // --- CATEGORÍAS ---

  cargarCategorias() {
    this.http.get<any[]>(this.apiCatUrl)
      .pipe(retry(this.retryConfig), catchError(() => of([])))
      .subscribe(data => {
        const nombres = data.map(c => c.nom || c);
        this.categories.set(nombres);
      });
  }

  agregarCategoria(nombre: string) {
    this.http.post(this.apiCatUrl, { nom: nombre })
      .pipe(retry(this.retryConfig))
      .subscribe(() => this.cargarCategorias());
  }

  eliminarCategoria(nombre: string) {
    this.http.get<any[]>(this.apiCatUrl).subscribe(todas => {
      const encontrada = todas.find(c => c.nom === nombre);

      if (encontrada && encontrada.id) {
        const afectados = this.contacts().filter(c => c.categorie === nombre);

        const peticiones = afectados.map(c =>
          this.http.put(`${this.apiUrl}/${c.id}`, { ...c, categorie: '' }).pipe(retry(this.retryConfig))
        );

        const proceso = afectados.length > 0 ? forkJoin(peticiones) : of([]);

        proceso.subscribe({
          next: () => {
            this.http.delete(`${this.apiCatUrl}/${encontrada.id}`)
              .pipe(retry(this.retryConfig))
              .subscribe(() => this.cargarDatosIniciales());
          }
        });
      }
    });
  }

  // --- UTILIDADES ---

  prepararEdicion(contacto: Contact) {
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
