import { Controller, Get, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto';
import { CurrentUser } from '../common/decorators';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@CurrentUser('id') userId: string) {
    return this.usersService.findMe(userId);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  updateMe(@CurrentUser('id') userId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(userId, dto);
  }

  @Get('me/mer-records')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get MER records for current user' })
  getMerRecords(@CurrentUser('id') userId: string) {
    return this.usersService.getMerRecords(userId);
  }

  @Get('me/mer-records/:discipline')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get MER records for a specific discipline' })
  getMerRecordsByDiscipline(
    @CurrentUser('id') userId: string,
    @Param('discipline') discipline: string,
  ) {
    return this.usersService.getMerRecords(userId, discipline);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (public profile)' })
  getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
