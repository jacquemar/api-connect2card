# Système d'Upload S3 - Connect2Card API

Ce document décrit le système d'upload de photos de profil et bannière via AWS S3 avec URLs pré-signées.

## Configuration Requise

### Variables d'environnement

Assurez-vous d'avoir configuré les variables d'environnement suivantes dans votre fichier `.env` :

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Base URL (pour les URLs pré-signées)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Endpoints Disponibles

### 1. Génération d'URLs Pré-signées

#### GET `/s3/presigned-url`
Génère une URL pré-signée pour uploader directement vers S3.

**Paramètres de requête :**
- `fileName` (requis) : Nom du fichier
- `fileType` (requis) : Type MIME du fichier (ex: `image/jpeg`)
- `folder` (optionnel) : Dossier de destination (défaut: `uploads`)

**Exemple :**
```bash
GET /s3/presigned-url?fileName=photo.jpg&fileType=image/jpeg&folder=profile-photos
```

**Réponse :**
```json
{
  "url": "https://bucket.s3.region.amazonaws.com/...",
  "method": "PUT",
  "publicUrl": "https://bucket.s3.region.amazonaws.com/folder/file.jpg",
  "fields": {
    "Content-Type": "image/jpeg",
    "key": "folder/file.jpg",
    "bucket": "bucket-name"
  }
}
```

### 2. Upload de Photos de Profil

#### POST `/s3/upload-profile-photo`
Upload une photo de profil en base64 et met à jour automatiquement l'URL dans la base de données.

**Corps de la requête :**
```json
{
  "photo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
  "fileName": "profile-photo.jpg" // optionnel
}
```

**Réponse :**
```json
{
  "message": "Photo de profil uploadée avec succès",
  "photoUrl": "https://bucket.s3.region.amazonaws.com/profile-photos/1234567890-profile-photo.jpg",
  "remainingCredits": 99
}
```

#### POST `/s3/upload-banner-photo`
Upload une photo de bannière en base64 et met à jour automatiquement l'URL dans la base de données.

**Corps de la requête :**
```json
{
  "photo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
  "fileName": "banner-photo.jpg" // optionnel
}
```

**Réponse :**
```json
{
  "message": "Photo de bannière uploadée avec succès",
  "photoUrl": "https://bucket.s3.region.amazonaws.com/banner-photos/1234567890-banner-photo.jpg",
  "remainingCredits": 99
}
```

### 3. Upload via Fichiers (Alternative)

#### POST `/upload/photoProfil`
Upload une photo de profil via un fichier multipart.

**Corps de la requête :**
```
Content-Type: multipart/form-data
file: [fichier image]
```

#### POST `/upload/banniere`
Upload une bannière via un fichier multipart.

**Corps de la requête :**
```
Content-Type: multipart/form-data
file: [fichier image]
```

### 4. Upload Base64 via Upload Module

#### POST `/upload/photo-profil-base64`
Upload une photo de profil en base64 via le module upload.

#### POST `/upload/banniere-base64`
Upload une bannière en base64 via le module upload.

## Utilisation côté Client

### Exemple JavaScript/TypeScript

```javascript
// Upload d'une photo de profil
async function uploadProfilePhoto(base64Photo) {
  try {
    const response = await fetch('/s3/upload-profile-photo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        photo: base64Photo,
        fileName: 'profile-photo.jpg'
      })
    });

    const result = await response.json();
    console.log('Photo uploadée:', result.photoUrl);
    return result;
  } catch (error) {
    console.error('Erreur upload:', error);
  }
}

// Upload d'une bannière
async function uploadBannerPhoto(base64Photo) {
  try {
    const response = await fetch('/s3/upload-banner-photo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        photo: base64Photo,
        fileName: 'banner-photo.jpg'
      })
    });

    const result = await response.json();
    console.log('Bannière uploadée:', result.photoUrl);
    return result;
  } catch (error) {
    console.error('Erreur upload:', error);
  }
}
```

### Exemple React Native

```javascript
import { Image } from 'react-native-image-crop-picker';

const uploadPhoto = async () => {
  try {
    // Sélectionner une image
    const image = await Image.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      includeBase64: true,
    });

    // Upload vers l'API
    const response = await fetch('/s3/upload-profile-photo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        photo: `data:${image.mime};base64,${image.data}`,
        fileName: 'profile-photo.jpg'
      })
    });

    const result = await response.json();
    console.log('URL de la photo:', result.photoUrl);
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

## Fonctionnalités

### Gestion des Erreurs
- Retry automatique en cas d'échec (3 tentatives)
- Validation des formats d'image
- Limite de taille (20 MB max)
- Gestion des erreurs de conversion base64

### Sécurité
- URLs pré-signées avec expiration (1 heure)
- Validation JWT obligatoire
- Nettoyage des noms de fichiers
- ACL public-read pour les images

### Performance
- Upload direct vers S3 (pas de stockage temporaire)
- Compression automatique des images
- Cache des URLs publiques

## Structure des Dossiers S3

```
bucket-name/
├── profile-photos/
│   ├── 1234567890-profile-user1.jpg
│   └── 1234567891-profile-user2.jpg
├── banner-photos/
│   ├── 1234567890-banner-user1.jpg
│   └── 1234567891-banner-user2.jpg
└── uploads/
    └── autres-fichiers/
```

## Notes Importantes

1. **Authentification** : Tous les endpoints nécessitent un token JWT valide
2. **Crédits** : Chaque upload consomme 1 crédit utilisateur
3. **Formats supportés** : JPEG, PNG, GIF, WebP
4. **Taille maximale** : 20 MB par fichier
5. **Retry** : 3 tentatives automatiques en cas d'échec
6. **URLs publiques** : Les images sont accessibles publiquement via les URLs S3

## Dépannage

### Erreurs courantes

1. **"Photo non valide"** : Vérifiez le format base64
2. **"Image trop grande"** : Réduisez la taille de l'image
3. **"URL pré-signée non reçue"** : Vérifiez la configuration AWS
4. **"Upload échoué"** : Vérifiez les permissions S3

### Logs
Les erreurs sont loggées dans la console avec des détails pour faciliter le débogage. 