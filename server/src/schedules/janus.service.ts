import { Injectable, OnModuleInit } from "@nestjs/common";
import Janus from "janus-gateway-js";


@Injectable()
export class JanusService implements OnModuleInit {
  private pluginHandle: any

  async onModuleInit() {
    var janus = new Janus.Client("ws://localhost:8188", {
      token: '',
      apisecret: '',
      keepalive: 'true'
    });

    var connection = await janus.createConnection()
    var session = await connection.createSession()
    this.pluginHandle = await session.attachHandle("janus.plugin.videoroom")
  }


  async createRoom(id: number, pin: string, secret: string) {
    await this.pluginHandle.sendWithTransaction({ body: { request: "create", room: id, pin: pin, secret: secret } })
  }

  async deleteRoom(id: number, secret: string) {
    await this.pluginHandle.sendWithTransaction({ body: { request: "destriy", room: id, secret: secret } })
  }
}