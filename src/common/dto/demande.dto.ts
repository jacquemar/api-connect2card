export class CreateDemandeDto {
  userName: string;
  email: string;
  nom?: string;
  prenom?: string;
  phoneNumber: string;
  password: string;
  date: string;
}

export class UpdateDemandeStatusDto {
  status: 'pending' | 'approved' | 'rejected';
} 