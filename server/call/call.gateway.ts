import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  path: 'gateway'
})
export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private activeSockets: string[] = [];

  handleConnection(socket: Socket, ...args: any[]) {
    const existingSocket = this.activeSockets.find(
      existingSocket => existingSocket === socket.id
    );

    if (!existingSocket) {
      this.activeSockets.push(socket.id);

      socket.emit("update-user-list", {
        users: this.activeSockets.filter(
          existingSocket => existingSocket !== socket.id
        )
      });

      socket.broadcast.emit("update-user-list", {
        users: [socket.id]
      });
    }
  }

  handleDisconnect(socket: Socket) {
    this.activeSockets = this.activeSockets.filter(
      existingSocket => existingSocket !== socket.id
    );
    socket.broadcast.emit("remove-user", {
      socketId: socket.id
    });
  }
  
  @SubscribeMessage('message')
  handleMessage(socket: Socket, payload: any): string {
    return 'Hello world!';
  }
}
