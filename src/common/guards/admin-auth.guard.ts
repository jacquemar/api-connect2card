import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException("Token d'authentification manquant");
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      // Vérifier que l'utilisateur a le rôle admin
      if (payload.role !== 'admin') {
        throw new UnauthorizedException(
          'Accès refusé. Rôle administrateur requis.',
        );
      }

      // Ajouter les informations de l'utilisateur à la requête
      request['user'] = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
