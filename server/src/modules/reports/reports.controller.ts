import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get overall system summary' })
  @ApiResponse({
    status: 200,
    description: 'Summary retrieved successfully',
  })
  getSummary() {
    return this.reportsService.getSummary();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.DEPARTMENT, UserRole.ADMIN)
  @Get('instructor-load')
  @ApiOperation({ summary: 'Get instructor workload report (Department/Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Instructor load retrieved successfully',
  })
  getInstructorLoad() {
    return this.reportsService.getInstructorLoad();
  }

  @Get('department-stats')
  @ApiOperation({ summary: 'Get department statistics' })
  @ApiQuery({ name: 'department', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Department statistics retrieved successfully',
  })
  getDepartmentStats(@Query('department') department?: string) {
    return this.reportsService.getDepartmentStats(department);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.DEPARTMENT, UserRole.ADMIN)
  @Get('export')
  @ApiOperation({ summary: 'Export data to Excel (Department/Admin only)' })
  @ApiQuery({
    name: 'type',
    required: true,
    enum: ['topics', 'registrations', 'instructor-load'],
  })
  @ApiResponse({
    status: 200,
    description: 'Excel file generated successfully',
  })
  async exportToExcel(
    @Query('type') type: 'topics' | 'registrations' | 'instructor-load',
    @Res() res: Response,
  ) {
    const workbook = await this.reportsService.exportToExcel(type);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${type}-${Date.now()}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
