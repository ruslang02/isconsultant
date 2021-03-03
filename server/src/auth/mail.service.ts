import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class VerifyService {
  constructor(private readonly mailerService: MailerService) {}

  public send(userEmail: string, verifyToken: string): void {
    this
      .mailerService
      .sendMail({
        to: userEmail, // list of receivers
        from: 'noreply@nestjs.com', // sender address
        subject: 'ISC Email Verification', // Subject line
        text: `Verify your email by clicking this link: https://consultant.infostrategic.com/verify?token=${verifyToken}`, // plaintext body
      })
      .then(() => {
        console.log("success")
      })
      .catch(() => {
        console.log("error")
      });
  }
}