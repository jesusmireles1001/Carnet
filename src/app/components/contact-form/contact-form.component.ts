import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-form.component.html'
})
export class ContactFormComponent {

  constructor(public contactService: ContactService) {}

  guardar() {
    // Leemos el contacto actual del servicio
    const contacto = this.contactService.contactActuel();

    if (this.contactService.enEdition()) {
      this.contactService.actualizar(contacto);
    } else {
      contacto.id = Date.now();
      this.contactService.agregar(contacto);
    }
  }

  cancelar() {
    this.contactService.resetFormulario();
  }
}
