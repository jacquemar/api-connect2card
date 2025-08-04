import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // Définir NODE_ENV si non défini
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
  }

  const app = await NestFactory.create(AppModule);

  // Configuration CORS adaptée à l'environnement
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [
        'https://connect2card.com',
        'https://www.connect2card.com',
        'https://api.connect2card.com'
      ]
    : ['http://localhost:3000', 'http://localhost:2000', 'http://localhost:5173'];

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    credentials: true,
    maxAge: 86400, // Cache preflight requests for 24 hours
  });

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Préfixe global pour l'API
  app.setGlobalPrefix('api');

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Connect2Card API')
    .setDescription(
      'API pour la plateforme Connect2Card - Cartes de visite numériques',
    )
    .setVersion('1.0')
    .addTag('Auth', 'Authentification et gestion des sessions')
    .addTag('Users', 'Gestion des utilisateurs')
    .addTag('Demandes', 'Gestion des demandes de cartes')
    .addTag('Appointments', 'Gestion des rendez-vous')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entrer le token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Connect2Card API Documentation',
    customfavIcon: 'https://avatars.githubusercontent.com/u/20165699?s=200&v=4',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
  });

  const port = process.env.PORT || 2001;
  await app.listen(port);

  console.log(`🚀 Backend Connect2Card démarré sur le port ${port}`);
  console.log(`📖 API disponible sur: http://localhost:${port}/api`);
  console.log(`📚 Documentation Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
