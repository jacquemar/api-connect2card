import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserDocument } from '../common/schemas/user.schema';
import * as bcrypt from 'bcryptjs';

async function seedAdmin() {
  console.log('🚀 Démarrage du script de création de l\'administrateur...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    console.log('📡 Connexion à la base de données...');
    
    // Obtenir le modèle User
    const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await userModel.findOne({ 
      email: 'arnaud.timite12@gmail.com',
      role: 'admin'
    });

    if (existingAdmin) {
      console.log('✅ L\'administrateur existe déjà dans la base de données');
      console.log('📧 Email: arnaud.timite12@gmail.com');
      console.log('👤 Rôle: admin');
      return;
    }

    console.log('🔐 Création de l\'administrateur...');
    
    // Hasher le mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('azerty123', saltRounds);

    // Créer l'utilisateur admin
    const adminUser = new userModel({
      userName: 'admin',
      email: 'arnaud.timite12@gmail.com',
      password: hashedPassword,
      nomComplet: 'Arnaud Timite',
      role: 'admin',
      isActive: true,
      isSuspended: false,
      credit: 1000,
      level: '1',
      profil: 'admin',
    });

    await adminUser.save();
    
    console.log('✅ Administrateur créé avec succès !');
    console.log('📧 Email: arnaud.timite12@gmail.com');
    console.log('🔑 Mot de passe: azerty123');
    console.log('👤 Rôle: admin');
    console.log('🎉 Vous pouvez maintenant vous connecter au dashboard admin !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
    console.error('Détails de l\'erreur:', error.message);
  } finally {
    console.log('🔌 Fermeture de la connexion...');
    await app.close();
    console.log('✅ Script terminé');
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  seedAdmin().catch(console.error);
}

export { seedAdmin }; 