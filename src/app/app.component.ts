import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importamos los hijos desde la carpeta components
import { CategoryManagerComponent } from './components/category-manager/category-manager.component';
import { ContactFormComponent } from './components/contact-form/contact-form.component';
import { ContactListComponent } from './components/contact-list/contact-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CategoryManagerComponent,
    ContactFormComponent,
    ContactListComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  // El padre ya no hace nada, solo organiza a los hijos
}
