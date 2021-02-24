import { JoinChatRoomDto } from "@common/dto/join-chat-room.dto";
import { NewFileNotificationDto } from "@common/dto/new-file-notification.dto";
import { PostChatMessageDto } from "@common/dto/post-chat-message.dto";
import { ReceiveChatMessageDto } from "@common/dto/receive-chat-message.dto";
import { File } from "@common/models/file.entity";
import { User } from "@common/models/user.entity";
import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Request } from "express";
import { UsersService } from "users/users.service";
import Socket, { Server } from "ws";

type ChatSocket = Socket & { room?: string, user: User };

type Answer<T> = { event: string, data: T };

@WebSocketGateway(+process.env.CHAT_PORT)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  private server: Server;

  private logger = new Logger("Chat");

  constructor(private jwt: JwtService, private users: UsersService) {}

  async handleConnection(@ConnectedSocket() socket: ChatSocket, req: Request) {
    try {
      const params = req.url.split("/");
      const token = params[params.length - 1];
      console.log(token);
      const { id } = this.jwt.verify<{ id: number }>(token);
      const user = await this.users.findOne(id);
      socket.user = user;
    } catch (e) {
      this.logger.error('User was not authorized to enter this websocket.');
      socket.close(1001);
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
  }

  afterInit(server: any) {
  }

  notifyNewFile(file: File, roomId: string) {
    this.server.clients.forEach((socket: ChatSocket) => {
      if (socket.room === roomId) {
        socket.send(
          JSON.stringify(
            {
              event: 'new_file',
              data: { file }
            } as Answer<NewFileNotificationDto>
          )
        )
      }
    })
  }

  @SubscribeMessage('join')
  handleJoin(socket: ChatSocket, payload: JoinChatRoomDto) {
    socket.room = `${payload.id}`;
    this.logger.log(`Connected user to room ${payload.id}.`);
  }

  @SubscribeMessage('post_message')
  handlePost(@ConnectedSocket() socket: ChatSocket, @MessageBody() payload: PostChatMessageDto) {
    if (!socket.room) {
      socket.close(1001);
      return;
    } else {
      const m = {
        event: 'message',
        data: {
          message: payload.message,
          userId: socket.user.id
        }
      };

      for (const client of this.server.clients as Set<ChatSocket>) {
        if (client.room === socket.room) {
          client.send(m);
        }
      }
      
      return;
    }
  }
}
