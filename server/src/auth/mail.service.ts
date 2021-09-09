import { MailerService } from "@nestjs-modules/mailer";
import { Inject, Injectable, LoggerService } from "@nestjs/common";

@Injectable()
export class MailService {
    constructor(
        @Inject("Logger")
        private logger: LoggerService,
        private readonly mailerService: MailerService
    ) { }

    public send(userEmail: string, verifyToken: string): void {
        this
            .mailerService
            .sendMail({
                to: userEmail, // list of receivers
                from: "noreply@nestjs.com", // sender address
                subject: "ISC Email Verification", // Subject line
                text: `Verify your email by clicking this link: https://consultant.infostrategic.com/api/auth/verify/${verifyToken}`, // plaintext body
            })
            .then(() => {
                this.logger.log("VerifyService:", `Sent an email for user ${userEmail}.`);
            })
            .catch(e => {
                this.logger.error("VerifyService:", `Failed to send email for user ${userEmail}.`, e);
            });
    }
}