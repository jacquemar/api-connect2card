export class CreateRendezVousDto {
  utilisateurUserName: string;
  date: string;
  heure: string;
  demandeur: {
    nom: string;
    telephone: string;
    motif: string;
  };
}

export class UpdateRendezVousStatusDto {
  statut: 'en_attente' | 'confirme' | 'annule' | 'termine';
}
