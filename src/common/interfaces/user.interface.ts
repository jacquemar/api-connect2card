export interface IUser {
  _id?: string;
  userName: string;
  email: string;
  mail?: string;
  password: string;
  photoProfilURL?: string;
  banniereURL?: string;
  nomComplet?: string;
  titre?: string;
  phoneNumber?: string;
  facebook?: string;
  instagram?: string;
  snapchat?: string;
  youtube?: string;
  tiktok?: string;
  twitter?: string;
  whatsapp?: string;
  pinterest?: string;
  linkedin?: string;
  behance?: string;
  telegram?: string;
  web?: string;
  googleReview?: string;
  tripadvisor?: string;
  service1?: string;
  service2?: string;
  service3?: string;
  service4?: string;
  isLocationEnabled?: boolean;
  latitude?: number;
  longitude?: number;
  address?: string;
  visitscount?: number;
  vcardDownloadsCount?: number;
  role?: string;
  level?: string;
  profil?: string;
  qrCode?: string;
  credit?: number;
  isActive?: boolean;
  isSuspended?: boolean;
  visitsHistory?: Array<{
    date: Date;
    count: number;
  }>;
}

export interface IDemande {
  _id?: string;
  userName: string;
  email: string;
  nom?: string;
  prenom?: string;
  phoneNumber: string;
  password: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface IAppointment {
  _id?: string;
  profileOwner: string;
  userName: string;
  userPhone: string;
  date: string;
  time: string;
  message?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRendezVous {
  _id?: string;
  utilisateur: string;
  utilisateurUserName: string;
  date: Date;
  heure: string;
  demandeur: {
    nom: string;
    telephone: string;
    motif: string;
  };
  statut: 'en_attente' | 'confirme' | 'annule' | 'termine';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMessage {
  _id?: string;
  destinataire: string;
  destinataireUserName: string;
  expediteur: {
    nom: string;
    contact: string;
  };
  message: string;
  statut: 'non_lu' | 'lu' | 'archive';
  createdAt?: Date;
  updatedAt?: Date;
}
