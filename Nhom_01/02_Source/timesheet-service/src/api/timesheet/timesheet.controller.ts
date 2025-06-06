import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UsePipes,
} from '@nestjs/common';
import { Timesheet } from '@prisma/client';
import { Permissions } from '@/libs/decorators';
import { TimesheetService } from '@/domain/timesheet/timesheet.service';
import {
  startTimesheetSchema,
  StartTimesheetDto,
  listTimesheetsSchema,
  ListTimesheetsDto,
  ListTimesheetsMeDto,
  listTimesheetsMeSchema,
  UpdateTimesheetDto,
} from '@/api/timesheet/dto';
import { ZodValidationPipe } from '@/libs/pipes/zod-validation.pipe';
import { PaginationResponse } from '@/libs/response/pagination';
import {
  StartTimesheetSwagger,
  ListTimesheetsMeSwaggerDto,
  ListTimesheetsSwaggerDto,
  StartTimesheetManuallySwagger,
} from '@/api/timesheet/swagger';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import {
  StartTimesheetManuallyDto,
  startTimesheetManuallySchema,
} from './dto/start-timesheet-manually.dto';

@Controller('timesheets')
export class TimesheetController {
  constructor(private readonly timesheetService: TimesheetService) {}
  @Post('start')
  @ApiBody({ type: StartTimesheetSwagger })
  @UsePipes(new ZodValidationPipe(startTimesheetSchema))
  async startTimesheet(
    @Req() req: Request,
    @Body() dto: StartTimesheetDto,
  ): Promise<Timesheet | null> {
    const userId = req['user'] as { sub: string };
    return await this.timesheetService.startTimesheet(userId.sub, dto);
  }

  @Post('start/manually')
  @ApiBody({ type: StartTimesheetManuallySwagger })
  @UsePipes(new ZodValidationPipe(startTimesheetManuallySchema))
  async startTimesheetManually(
    @Req() req: Request,
    @Body() dto: StartTimesheetManuallyDto,
  ): Promise<Timesheet | null> {
    const userId = req['user'] as { sub: string };
    return await this.timesheetService.startTimesheetManually(userId.sub, dto);
  }

  @Post('end')
  async endTimesheet(@Req() req: Request): Promise<Timesheet | null> {
    const userId = req['user'] as { sub: string };
    return await this.timesheetService.endTimesheet(userId.sub);
  }

  @Get('')
  @ApiQuery({ type: ListTimesheetsSwaggerDto, required: false })
  @Permissions(['read:timesheets'])
  @UsePipes(new ZodValidationPipe(listTimesheetsSchema))
  async listTimesheets(
    @Query() dto: ListTimesheetsDto,
  ): Promise<PaginationResponse<Timesheet>> {
    return await this.timesheetService.listTimesheets(dto);
  }

  @Get('me')
  @ApiQuery({ type: ListTimesheetsMeSwaggerDto, required: false })
  @UsePipes(new ZodValidationPipe(listTimesheetsMeSchema))
  async listTimesheetsMe(
    @Req() req: Request,
    @Query() dto: ListTimesheetsMeDto,
  ): Promise<PaginationResponse<Timesheet>> {
    const userId = req['user'] as { sub: string };
    return await this.timesheetService.listTimesheetsMe(userId.sub, dto);
  }

  @Get(':id')
  async getTimesheet(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Timesheet | null> {
    return await this.timesheetService.getTimesheet(id);
  }

  @Put(':id')
  async updateTimesheet(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTimesheetDto,
  ): Promise<Timesheet | null> {
    return await this.timesheetService.updateTimesheet(id, dto);
  }
}
