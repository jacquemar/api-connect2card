export class CreateMessageDto {
  destinataireUserName: string;
  expediteur: {
    nom: string;
    contact: string;
  };
  message: string;
}

export class UpdateMessageStatusDto {
  statut: 'non_lu' | 'lu' | 'archive';
} 