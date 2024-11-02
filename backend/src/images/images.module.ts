import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { ImageEntity } from './entities/image.entity';

@Module({
  imports: [MikroOrmModule.forFeature([ImageEntity])],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}