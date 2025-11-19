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
import { RegistrationsService } from './registrations.service';
import { ApplyTopicDto } from './dto/apply-topic.dto';
import { ReviewApplicationDto } from './dto/review-application.dto';
import { RegistrationFilterDto } from './dto/registration-filter.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
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

@ApiTags('registrations')
@Controller('registrations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post('apply')
  @ApiOperation({ summary: 'Apply for a topic (Student only)' })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Registration period is closed or topic is full',
  })
  @ApiResponse({
    status: 409,
    description: 'Already applied to this topic',
  })
  applyForTopic(
    @CurrentUser('id') studentId: string,
    @Body() applyDto: ApplyTopicDto,
  ) {
    return this.registrationsService.applyForTopic(studentId, applyDto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @Get('my-applications')
  @ApiOperation({ summary: 'Get student\'s applications' })
  @ApiResponse({
    status: 200,
    description: 'Applications retrieved successfully',
  })
  getMyApplications(
    @CurrentUser('id') studentId: string,
    @Query() filterDto: RegistrationFilterDto,
  ) {
    return this.registrationsService.getMyApplications(studentId, filterDto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @Delete(':id')
  @ApiOperation({ summary: 'Withdraw application (Student only)' })
  @ApiResponse({
    status: 200,
    description: 'Application withdrawn successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to withdraw this application',
  })
  withdrawApplication(
    @CurrentUser('id') studentId: string,
    @Param('id') id: string,
  ) {
    return this.registrationsService.withdrawApplication(studentId, id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @Patch(':id')
  @ApiOperation({ summary: 'Update application (Student only)' })
  @ApiResponse({
    status: 200,
    description: 'Application updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to update this application',
  })
  updateApplication(
    @CurrentUser('id') studentId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateRegistrationDto,
  ) {
    return this.registrationsService.updateApplication(studentId, id, updateDto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Get('pending-reviews')
  @ApiOperation({ summary: 'Get pending applications for review (Instructor only)' })
  @ApiResponse({
    status: 200,
    description: 'Pending applications retrieved successfully',
  })
  getPendingReviews(@CurrentUser('id') instructorId: string) {
    return this.registrationsService.getPendingReviews(instructorId);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Post('review')
  @ApiOperation({ summary: 'Review application (Instructor only)' })
  @ApiResponse({
    status: 200,
    description: 'Application reviewed successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to review this application',
  })
  reviewApplication(
    @CurrentUser('id') instructorId: string,
    @Body() reviewDto: ReviewApplicationDto,
  ) {
    return this.registrationsService.reviewApplication(instructorId, reviewDto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Get('my-students')
  @ApiOperation({ summary: 'Get accepted students (Instructor only)' })
  @ApiResponse({
    status: 200,
    description: 'Accepted students retrieved successfully',
  })
  getMyStudents(@CurrentUser('id') instructorId: string) {
    return this.registrationsService.getMyStudents(instructorId);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.DEPARTMENT, UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all registrations (Department/Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Registrations retrieved successfully',
  })
  getAllRegistrations(@Query() filterDto: RegistrationFilterDto) {
    return this.registrationsService.getAllRegistrations(filterDto);
  }
}
