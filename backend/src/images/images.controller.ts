import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { ImageEntity } from './entities/image.entity';

@ApiTags('images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all images' })
  @ApiResponse({ status: 200, description: 'Returns all images' })
  async findAll(): Promise<ImageEntity[]> {
    return this.imagesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get image by id' })
  @ApiResponse({ status: 200, description: 'Returns an image' })
  async findOne(@Param('id') id: string): Promise<ImageEntity> {
    return this.imagesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new image' })
  @ApiResponse({ status: 201, description: 'Image created successfully' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createImageDto: CreateImageDto,
    @UploadedFile() file?,
  ): Promise<ImageEntity> {
    return this.imagesService.create(createImageDto, file);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an image' })
  @ApiResponse({ status: 200, description: 'Image updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateImageDto: Partial<CreateImageDto>,
  ): Promise<ImageEntity> {
    return this.imagesService.update(id, updateImageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an image' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.imagesService.remove(id);
  }
}