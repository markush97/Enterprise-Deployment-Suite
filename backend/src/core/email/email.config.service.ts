import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EMailConfigService {
  constructor(private readonly config: ConfigService) {}

  public get transport(): SmtpOptions {
    const options: SmtpOptions = {
      pool: false,
      ignoreTLS: this.ignoreTls,
      host: this.host,
      port: this.port,
      secure: this.secure,
      connectionTimeout: this.timeout,
    };

    // only provide auth-credentials if username is defined. This is needed since setting auth as undefined alone is not enough
    if (this.username) {
      options.auth = {
        user: this.username,
        pass: this.password,
      };
    }

    return options;
  }
  private get host(): string {
    return this.config.get('EMAIL_HOST', 'cwi-at.mail.protection.outlook.com');
  }

  private get port(): number {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    return this.config.get('EMAIL_PORT', 25);
  }

  private get password(): string | undefined {
    return this.config.get('EMAIL_PASSWORD');
  }

  private get secure(): boolean {
    return this.config.get<boolean>('EMAIL_SECURE', false);
  }

  private get ignoreTls(): boolean {
    return this.config.get<boolean>('EMAIL_IGNORE_TLS', false);
  }

  public get from(): string {
    return this.config.get('EMAIL_FROM', 'EDS Imaging <no_reply@example.com>');
  }

  public get defaultReceiver(): string | string[] | null {
    return this.config.get('EMAIL_DEFAULT_RECEIVER');
  }

  private get username(): string | undefined {
    return this.config.get('EMAIL_USERNAME');
  }

  private get timeout(): number {
    return this.config.get('EMAIL_TIMEOUT', 5000);
  }
}

// Defined manually since nodemailer does not export this interface. Duh.
interface SmtpOptions {
  pool: boolean;
  host: string;
  port: number;
  secure: boolean;
  connectionTimeout: number;
  ignoreTLS: boolean;
  auth?: {
    user?: string;
    pass?: string;
  };
}
