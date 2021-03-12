import { Injectable, OnModuleInit } from "@nestjs/common";
const Janus = require("janus-gateway-js")

const {
  JANUS
} = process.env;

@Injectable()
export class JanusService implements OnModuleInit {
  private pluginHandle: any

  async onModuleInit() {
    try {
      var client = new Janus.Client(JANUS, {
        token: '',
        apisecret: '',
        keepalive: 'true'
      });

      var connection = await client.createConnection()
      var session = await connection.createSession()
      this.pluginHandle = await session.attachPlugin("janus.plugin.videoroom")
    } catch (error) {
      console.log(error);
    }
  }
  


  async createRoom(id: number, pin: string, secret: string) {
    await this.pluginHandle.sendWithTransaction({ body: { request: "create", room: id, pin: pin, secret: secret } })
  }

  async destroyRoom(id: number, secret: string) {
    await this.pluginHandle.sendWithTransaction({ body: { request: "destroy", room: id, secret: secret } })
  }
}