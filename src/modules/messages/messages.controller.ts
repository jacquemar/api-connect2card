import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('messages')
  async createMessage(@Body() createMessageDto: any) {
    return this.messagesService.createMessage(createMessageDto);
  }

  @Get('users/:userName/messages')
  async getMessagesByUser(
    @Param('userName') userName: string,
    @Query('statut') statut?: string,
  ) {
    return this.messagesService.getMessagesByUser(userName, statut);
  }

  @Patch('messages/:id/statut')
  async updateMessageStatus(
    @Param('id') id: string,
    @Body('statut') statut: string,
  ) {
    return this.messagesService.updateMessageStatus(id, statut);
  }
}
