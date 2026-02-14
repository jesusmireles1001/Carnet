export interface Contact {
  id: number;
  nom: string;
  prenom: string;
  adresseMail: string;       // <--- ¡CAMBIO AQUÍ! Con 'M' mayúscula
  numeroDeTelephone: string;
  adresse: string;
  ville: string;
  categorie?: string;
}
