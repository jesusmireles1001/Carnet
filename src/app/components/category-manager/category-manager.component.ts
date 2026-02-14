import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-category-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-manager.component.html'
})
export class CategoryManagerComponent {
  nouvelleCategorie: string = '';

  constructor(public contactService: ContactService) {}

  agregarCategoria() {
    if (this.nouvelleCategorie.trim()) {
      // ANTES: Modificábamos la lista y llamábamos a guardarDatos()
      // AHORA: Llamamos a la función del servicio que se conecta al JSON Server
      this.contactService.agregarCategoria(this.nouvelleCategorie);

      this.nouvelleCategorie = '';
      // ¡YA NO ES NECESARIO guardarDatos()!
    }
  }

  eliminarCategoria(cat: string) {
    if (confirm('Supprimer la catégorie "' + cat + '" ?')) {
      // AHORA: Llamamos directamente a la función del servicio
      this.contactService.eliminarCategoria(cat);

      // ¡YA NO ES NECESARIO guardarDatos()!
    }
  }
}
