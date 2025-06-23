import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Appointment, AppointmentDocument } from '../../common/schemas/appointment.schema';
import { User, UserDocument } from '../../common/schemas/user.schema';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService
  ) {}

  async createAppointment(createAppointmentDto: any): Promise<AppointmentDocument> {
    try {
      const { profileUsername, userName, userEmail, userPhone, date, time, message } = createAppointmentDto;

      // Trouver l'utilisateur propriétaire du profil
      const profileOwner = await this.userModel.findOne({ userName: profileUsername });
      
      if (!profileOwner) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      const newAppointment = new this.appointmentModel({
        profileOwner: profileOwner._id,
        userName,
        userEmail,
        userPhone,
        date: new Date(date),
        time,
        message,
        status: 'pending'
      });

      // Sauvegarder le rendez-vous
      await newAppointment.save();

      return newAppointment;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getMyAppointments(token: string): Promise<AppointmentDocument[]> {
    try {
      if (!token) {
        throw new UnauthorizedException('Aucun token, authentification refusée');
      }

      const decoded = this.jwtService.verify(token);
      
      // Trouver l'utilisateur par userName
      const user = await this.userModel.findOne({ userName: decoded.userName });
      
      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }
      
      // Récupérer les rendez-vous de l'utilisateur
      const appointments = await this.appointmentModel
        .find({ profileOwner: user._id })
        .sort({ createdAt: -1 });
      
      return appointments;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteAppointment(id: string, token: string): Promise<{ message: string }> {
    try {
      if (!token) {
        throw new UnauthorizedException('Aucun token, authentification refusée');
      }

      const decoded = this.jwtService.verify(token);
      
      // Trouver l'utilisateur par userName
      const user = await this.userModel.findOne({ userName: decoded.userName });
      
      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }
      
      // Trouver et vérifier le rendez-vous
      const appointment = await this.appointmentModel.findById(id);
      
      if (!appointment) {
        throw new NotFoundException('Rendez-vous non trouvé');
      }

      // Vérifier si l'utilisateur est bien le propriétaire du rendez-vous
      if (appointment.profileOwner.toString() !== (user._id as string).toString()) {
        throw new UnauthorizedException('Non autorisé');
      }

      // Supprimer le rendez-vous
      await appointment.deleteOne();

      return { message: 'Rendez-vous supprimé' };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
} 