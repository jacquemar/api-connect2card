# Guide de Migration - API Connect2Card

Ce guide vous aide à migrer votre application Express vers NestJS avec une architecture modulaire.

## 🚀 Installation des Dépendances

Avant de commencer, installez toutes les dépendances nécessaires :

```bash
# Dépendances principales NestJS
npm install @nestjs/common @nestjs/core @nestjs/platform-express
npm install @nestjs/config @nestjs/jwt @nestjs/platform-express

# Dépendances pour la validation
npm install class-validator class-transformer

# Dépendances pour l'upload de fichiers
npm install @nestjs/platform-express multer
npm install -D @types/multer

# Dépendances existantes de votre projet
npm install bcrypt nodemailer mongoose
npm install -D @types/bcrypt @types/nodemailer

# Dépendances pour Cloudinary et autres services
npm install cloudinary qrcode axios
npm install -D @types/qrcode

# Pour l'intégration Notion
npm install @notionhq/client

# Pour l'agent utilisateur
npm install useragent
npm install -D @types/useragent
```

## 📁 Structure Créée

La nouvelle structure modulaire comprend tous les modules nécessaires pour votre API.

## 🔧 Routes Migrées

### Module Auth (`/api`)
- `POST /api/login` - Connexion utilisateur
- `POST /api/forgot-password` - Mot de passe oublié

### Module Users (`/api`)
- `GET /api/user` - Profil utilisateur actuel
- `GET /api/users/:userName` - Profil par nom d'utilisateur
- `GET /api/users` - Tous les utilisateurs
- `GET /api/check-email` - Vérifier unicité email
- `GET /api/check-username` - Vérifier unicité nom d'utilisateur
- `POST /api/users/:userName/increment-download` - Incrémenter téléchargements vCard
- `POST /api/users/:userName/increment-visit` - Incrémenter visites
- `GET /api/users/:userName/visits-history` - Historique des visites
- `DELETE /api/user/:id` - Supprimer utilisateur

### Module Demandes
- `POST /create-demande` - Créer demande
- `GET /api/demandes` - Toutes les demandes
- `POST /api/demandes/:id/approve` - Approuver demande
- `POST /api/demandes/:id/reject` - Rejeter demande
- `DELETE /api/demandes/:id` - Supprimer demande

### Module Upload (`/upload`)
- `POST /upload/banniere` - Upload bannière
- `POST /upload/photoProfil` - Upload photo de profil

## 🔄 Prochaines Étapes

### 1. Compléter l'intégration MongoDB
Chaque service contient des commentaires `TODO` indiquant où ajouter les appels à MongoDB. Remplacez les simulations par les vraies requêtes.

### 2. Ajouter les Guards d'authentification
Créez des guards pour protéger les routes privées :

```typescript
// src/common/guards/jwt-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    
    if (!token) return false;
    
    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch {
      return false;
    }
  }
}
```

### 3. Configurer les variables d'environnement
Créez un fichier `.env` avec :

```env
JWT_SECRET=your_jwt_secret
USERHOST=your_email_host
USERSMTP=your_smtp_user
PASSWORDSMTP=your_smtp_password
NOTION_TOKEN=your_notion_token
NOTION_DEMANDE_DATABASE_ID=your_notion_db_id
```

### 4. Ajouter la validation avec class-validator
Les DTOs sont prêts pour la validation automatique.

### 5. Configurer Swagger (optionnel)
```bash
npm install @nestjs/swagger swagger-ui-express
```

## 🎯 Avantages de cette Architecture

1. **Modularité** : Chaque fonctionnalité est isolée dans son module
2. **Maintenabilité** : Code plus facile à maintenir et tester
3. **Évolutivité** : Facile d'ajouter de nouvelles fonctionnalités
4. **Validation** : Validation automatique des données avec class-validator
5. **TypeScript** : Typage complet pour une meilleure sécurité
6. **Guards** : Système d'authentification robuste
7. **Documentation** : Swagger pour documenter l'API

## 🔗 Ressources Utiles

- [Documentation NestJS](https://docs.nestjs.com/)
- [Guide de validation](https://docs.nestjs.com/techniques/validation)
- [Guards et authentification](https://docs.nestjs.com/guards)
- [Upload de fichiers](https://docs.nestjs.com/techniques/file-upload)

---

Votre API Express est maintenant structurée en modules NestJS ! 🎉 