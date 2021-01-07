import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  root() {
    return { name: 'ISConsultant' };
  }

  @Get('call')
  @Render('video')
  renderVideo() {
    return { name: 'ISConsultant демо' };
  }
}
