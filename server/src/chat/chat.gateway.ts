import { PostChatMessageDto } from "@common/dto/post-chat-message.dto";
import { ReceiveChatMessageDto } from "@common/dto/receive-chat-message.dto";
import { User } from "@common/models/user.entity";
import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Request } from "express";
import { Server, Socket } from "socket.io";
import { UsersService } from "users/users.service";

type ChatSocket = Socket & { user: User };

@WebSocketGateway(+process.env.CHAT_PORT)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  private server: Server;

  private logger = new Logger("Chat");

  constructor(private jwt: JwtService, private users: UsersService) {}

  async handleConnection(@ConnectedSocket() socket: ChatSocket) {
    try {
      const token = (socket.request as Request).headers.authorization.replace(/Bearer /g, "");
      const { id } = this.jwt.verify<{ id: number }>(token);
      const user = await this.users.findOne(id);
      socket.user = user;
    } catch (e) {
      this.logger.error('User was not authorized to enter this websocket.');
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    socket.leaveAll();
  }

  afterInit(server: any) {
  }

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() socket: ChatSocket, @MessageBody() payload: { id: number, userId: number }) {
    socket.join(`room${payload.id}`);
    this.logger.log(`Connected user ${socket.client.id} to room ${payload.id}.`);
  }

  @SubscribeMessage('post_message')
  handlePost(@ConnectedSocket() socket: ChatSocket, @MessageBody() payload: PostChatMessageDto) {
    const room = Object.keys(socket.rooms).find((value) => value.includes("room"));
    if (!room) {
      socket.disconnect(true);
      return;
    }
    this.server.in(room).emit('message', { message: payload.message, userId: socket.user.id } as ReceiveChatMessageDto);
  }
}
