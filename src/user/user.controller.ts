import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseDto } from '../shared/dtos/shared-dtos/response.dto';
import { AddOrUpdateUserDto, UserDto } from '../shared/dtos/admin/user.dto';
import { AuthService } from '../auth/services/auth.service';
import { DocumentType } from '@typegoose/typegoose';
import { User } from './models/user.model';
import { plainToClass } from 'class-transformer';
import { UserJwtGuard } from '../auth/guards/user-jwt.guard';
import { LoginDto } from '../shared/dtos/shared-dtos/login.dto';
import { FastifyReply } from 'fastify';
import { ServerResponse } from 'http';
import { UserLocalGuard } from '../auth/guards/user-local.guard';
import { AdminLang } from '../shared/decorators/lang.decorator';
import { Language } from '../shared/enums/language.enum';
import { ValidatedUser } from '../shared/decorators/validated-user.decorator';

@UsePipes(new ValidationPipe({ transform: true }))
@Controller('admin/user')
export class UserController {

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) { }

  @UseGuards(UserJwtGuard)
  @Get()
  async getUser(@ValidatedUser() user: DocumentType<User>): Promise<ResponseDto<UserDto>> {
    const dto = plainToClass(UserDto, user.toJSON(), { excludeExtraneousValues: true });

    return {
      data: dto
    };
  }

  @UseGuards(UserJwtGuard)
  @Get('list')
  async getAllUsers(@Req() req): Promise<ResponseDto<UserDto[]>> {
    const users = await this.userService.getAllUsers();

    return {
      data: plainToClass(UserDto, users, { excludeExtraneousValues: true })
    };
  }

  @UseGuards(UserJwtGuard)
  @Post()
  async addNewUser(
    @Body() addUserDto: AddOrUpdateUserDto,
    @ValidatedUser() user: DocumentType<User>,
    @AdminLang() lang: Language
  ): Promise<ResponseDto<UserDto>> {
    const newUser = await this.userService.addNewUser(addUserDto, user, lang);

    return {
      data: plainToClass(UserDto, newUser, { excludeExtraneousValues: true })
    };
  }

  /**
   * @returns ResponseDto<UserDto>
   */
  @UseGuards(UserLocalGuard)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @ValidatedUser() user: DocumentType<User>,
    @Res() res: FastifyReply<ServerResponse>
  ) {
    const userDto = plainToClass(UserDto, user, { excludeExtraneousValues: true });

    return this.authService.loginUser(userDto, res);
  }

  @Post('logout')
  async logout(@Res() res: FastifyReply<ServerResponse>) {
    return this.authService.logoutUser(res);
  }

  @UseGuards(UserJwtGuard)
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: AddOrUpdateUserDto,
    @ValidatedUser() user: DocumentType<User>,
    @AdminLang() lang: Language
  ): Promise<ResponseDto<UserDto>> {
    const updated = await this.userService.updateUser(id, updateUserDto, user, lang);

    return {
      data: plainToClass(UserDto, updated, { excludeExtraneousValues: true })
    };
  }

  @UseGuards(UserJwtGuard)
  @Delete(':id')
  async deleteUser(
    @Param('id') id: string,
    @ValidatedUser() user: DocumentType<User>,
    @AdminLang() lang: Language
  ): Promise<ResponseDto<UserDto>> {
    const updated = await this.userService.deleteUser(id, user, lang);

    return {
      data: plainToClass(UserDto, updated, { excludeExtraneousValues: true })
    }
  }
}
