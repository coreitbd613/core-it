import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024;

interface RequestUser {
  id: string;
}

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateOrganizationDto) {
    return this.organizationsService.createMine(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  getMine(@CurrentUser() user: RequestUser) {
    return this.organizationsService.getMine(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('mine')
  updateMine(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.updateMine(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mine/logo')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_LOGO_SIZE_BYTES } }),
  )
  async uploadLogo(
    @CurrentUser() user: RequestUser,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }
    return this.organizationsService.updateLogo(user.id, file);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('admin')
  listAll() {
    return this.organizationsService.listForAdmin();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('admin/:id')
  getOne(@Param('id') id: string) {
    return this.organizationsService.getForAdmin(id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch('admin/:id')
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.organizationsService.updateForAdmin(id, dto);
  }
}
