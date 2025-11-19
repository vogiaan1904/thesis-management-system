import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { TopicFilterDto } from './dto/topic-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('topics')
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new topic (Instructor only)' })
  @ApiResponse({
    status: 201,
    description: 'Topic created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Topic code already exists',
  })
  create(
    @CurrentUser('id') instructorId: string,
    @Body() createTopicDto: CreateTopicDto,
  ) {
    return this.topicsService.create(instructorId, createTopicDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all topics with filters' })
  @ApiResponse({
    status: 200,
    description: 'Topics retrieved successfully',
  })
  findAll(@Query() filterDto: TopicFilterDto) {
    return this.topicsService.findAll(filterDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Get('my-topics')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get instructor\'s topics' })
  @ApiResponse({
    status: 200,
    description: 'Instructor topics retrieved successfully',
  })
  findByInstructor(@CurrentUser('id') instructorId: string) {
    return this.topicsService.findByInstructor(instructorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get topic by ID' })
  @ApiResponse({
    status: 200,
    description: 'Topic retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Topic not found',
  })
  findOne(@Param('id') id: string) {
    return this.topicsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update topic (Own topics only)' })
  @ApiResponse({
    status: 200,
    description: 'Topic updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only update your own topics',
  })
  @ApiResponse({
    status: 404,
    description: 'Topic not found',
  })
  update(
    @Param('id') id: string,
    @CurrentUser('id') instructorId: string,
    @Body() updateTopicDto: UpdateTopicDto,
  ) {
    return this.topicsService.update(id, instructorId, updateTopicDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete topic (Own topics only)' })
  @ApiResponse({
    status: 200,
    description: 'Topic deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only delete your own topics',
  })
  @ApiResponse({
    status: 404,
    description: 'Topic not found',
  })
  remove(@Param('id') id: string, @CurrentUser('id') instructorId: string) {
    return this.topicsService.remove(id, instructorId);
  }
}
