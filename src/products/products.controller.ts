// src/products/products.controller.ts
import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from 'src/validators/product.validator';
import { UpdateProductDto } from 'src/validators/product.validator';
import { JwtAuthGuard } from 'src/authguard/jwt-auth.guard';
import { Roles } from 'src/validators/RolesGuard/Roles';
import { UserRole } from 'src/users/user.enum';
import { Product } from './products.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { existsSync, unlink } from 'fs';


  @UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}


      @Roles(UserRole.ADMIN)
 @Post()
  @UseInterceptors(
    FileInterceptor('image_url', {
      storage: diskStorage({
        destination: './uploads/productImage',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async create(@UploadedFile() file: Express.Multer.File, @Body() dto: CreateProductDto): Promise<Product> {
    const image_url = file ? `/uploads/productImage/${file.filename}` : undefined;
    return this.productsService.create({ ...dto, image_url });
  }


  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

       @Roles(UserRole.ADMIN)
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/productImage',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async update(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateProductDto,
  ): Promise<Product> {
    const existing = await this.productsService.findOne(id);
    if (!existing) throw new NotFoundException('Product not found');

    // eski rasmni o‘chirish
    if (existing.image_url && file) {
      const oldPath = `.${existing.image_url}`;
      if (existsSync(oldPath)) {
        unlink(oldPath, (err) => {
          if (err) console.error('Old image not deleted:', err);
        });
      }
    }

    const image_url = file ? `/uploads/productImage/${file.filename}` : existing.image_url;
    return this.productsService.update(id, { ...dto, image_url });
  }

  @Get('/search/q')
  search(@Query('q') query: string) {
    return this.productsService.search(query);
  }

  // 🏷 Category filter route
  @Get('/category/:categoryId')
  findByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.productsService.findByCategory(categoryId);
  }

       @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<{ message: string }> {
    await this.productsService.remove(id);
    return { message: '✅ Product and its image deleted successfully' };
  }

  @Get('raw/finished')
findFinished() {
  return this.productsService.findFinishedProducts();
}
}
