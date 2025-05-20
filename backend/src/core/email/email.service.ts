import { Injectable, Logger } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { EMailConfigService } from './email.config.service';
import { InternalMTIException } from '../errorhandling/exceptions/internal.mti-exception';
import { MTIErrorCodes } from '../errorhandling/exceptions/mti.error-codes.enum';

@Injectable()
export class EMailService {
    private transporter!: Transporter;
    private readonly logger = new Logger('EMailService');

    constructor(private readonly emailConfig: EMailConfigService) { }

    /**
     * Hook called on App initialization
     *
     * Starts and tests smtp connection
     */
    async onModuleInit(): Promise<void> {
        this.logger.log(
            `Connecting to Email-Server: '${this.emailConfig.transport.host}:${this.emailConfig.transport.port}'`,
        );
        this.transporter = createTransport(this.emailConfig.transport);

        if (await this.verifyConnection(this.transporter)) {
            this.logger.log('Connecting to Email-Server successful!');
        } else {
            this.logger.error('Connecting to Email-Server failed! Shutting down...');
            process.exit(5);
        }
    }

    async sendEmail(
        subject: string,
        html: string,
        receiver?: string | string[],
    ): Promise<void> {
        if (!receiver) {
            receiver = this.emailConfig.defaultReceiver;
            if (receiver === null) {
                throw new InternalMTIException(MTIErrorCodes.EMAIL_NO_RECEIVER, 'No receiver or default receiver configured. Cannot send email!');
            }
        }

        const info = this.transporter.sendMail({
            from: this.emailConfig.from,
            to: receiver,
            subject: subject,
            html: html,
        });

        info.then((res) => {
            this.logger.debug(`Email "${subject}" send successfully to ${res.receiver}`)
            this.logger.debug(res);
        }).catch(this.logger.error);

    }

    private async verifyConnection(mailer: Transporter): Promise<boolean> {
        try {
            return await mailer.verify();
        } catch (error: unknown) {
            if (error instanceof Error) {
                this.logger.error(error.message);
            }
        }
        return false;
    }
}
