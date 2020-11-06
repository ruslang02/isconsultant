import { OnGatewayConnection, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket, Client } from 'socket.io';

@WebSocketGateway({
  path: 'gateway'
})
export class CallGateway implements OnGatewayConnection {

  handleConnection(client: Client, ...args: any[]) {
    throw new Error('Method not implemented.');
  }
  
  @SubscribeMessage('message')
  handleMessage(client: Client, payload: any): string {
    return 'Hello world!';
  }
}
