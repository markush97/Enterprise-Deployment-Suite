import { Module } from "@nestjs/common";
import { ServeStaticModule } from '@nestjs/serve-static';
import { StaticFileConfigService } from "./static-file.config.service";

@Module({
    imports: [
      ServeStaticModule.forRootAsync({useClass: StaticFileConfigService}),
    ],
    controllers: [],
    providers: [StaticFileConfigService],
  })
  export class StaticFileModule {}