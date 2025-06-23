import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class RendezVousService {
  async createRendezVous(createRendezVousDto: any): Promise<any> {
    try {
      const { utilisateurUserName, date, heure, demandeur } = createRendezVousDto;

      console.log('Recherche utilisateur avec userName:', utilisateurUserName);
      
      // TODO: Vérifier que l'utilisateur existe
      // const utilisateur = await User.findOne({ userName: utilisateurUserName });
      
      // Simulation pour l'exemple
      const utilisateur = null;
      
      if (!utilisateur) {
        console.log('Utilisateur non trouvé pour userName:', utilisateurUserName);
        throw new NotFoundException('Utilisateur non trouvé');
      }
      
      console.log('Utilisateur trouvé:', utilisateur);

      // Convertir la date française en format Date
      const [day, month, year] = date.split('/');
      const rendezVousDate = new Date(year, month - 1, day);

      // TODO: Créer le rendez-vous
      const nouveauRendezVous = {
        utilisateur: 'utilisateur._id',
        utilisateurUserName: utilisateurUserName,
        date: rendezVousDate,
        heure: heure,
        demandeur: {
          nom: demandeur.nom,
          telephone: demandeur.telephone,
          motif: demandeur.motif
        }
      };

      // TODO: Sauvegarder le rendez-vous
      // await nouveauRendezVous.save();

      return { 
        message: 'Rendez-vous créé avec succès',
        rendezVous: nouveauRendezVous
      };

    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error);
      throw error;
    }
  }

  async getRendezVousByUser(userName: string, statut?: string): Promise<any[]> {
    try {
      // TODO: Vérifier que l'utilisateur existe
      // const utilisateur = await User.findOne({ userName });
      
      // Simulation pour l'exemple
      const utilisateur = null;
      
      if (!utilisateur) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      // TODO: Construire la requête et récupérer les rendez-vous
      // let query = { utilisateur: utilisateur._id };
      // if (statut) {
      //   query.statut = statut;
      // }

      // const rendezVous = await RendezVous.find(query)
      //   .sort({ date: 1, heure: 1 })
      //   .populate('utilisateur', 'nomComplet userName');

      return [];

    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
      throw error;
    }
  }

  async updateRendezVousStatus(id: string, statut: string): Promise<any> {
    try {
      // TODO: Mettre à jour le statut du rendez-vous
      // const rendezVous = await RendezVous.findByIdAndUpdate(
      //   id,
      //   { statut: statut },
      //   { new: true }
      // );

      // if (!rendezVous) {
      //   throw new NotFoundException('Rendez-vous non trouvé');
      // }

      return {
        message: 'Statut du rendez-vous mis à jour avec succès',
        // rendezVous: rendezVous
      };

    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }
} 