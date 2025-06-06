import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common';
import { Activity, Team } from '@prisma/client';
import { Permissions } from '@/libs/decorators';
import { ActivityService } from '@/domain/activity/activity.service';
import {
  createActivitySchema,
  CreateActivityDto,
  updateActivitySchema,
  UpdateActivityDto,
  listActivitySchema,
  ListActivityDto,
} from '@/api/activity/dto';
import { ZodValidationPipe } from '@/libs/pipes/zod-validation.pipe';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import {
  CreateActivitySwagger,
  UpdateActivitySwagger,
  ListActivitySwaggerDto,
} from '@/api/activity/swagger';
import { PaginationResponse } from '@/libs/response/pagination';
import { GrpcMethod } from '@nestjs/microservices';

interface ActivityById {
  id: number;
}

interface ActivityResponse {
  id: number;
  name: string;
  description: string;
  team: TeamResponse;
}

interface TeamResponse {
  id: number;
  lead: string;
}

@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @GrpcMethod('ActivityService')
  async findOne(data: ActivityById): Promise<ActivityResponse> {
    const activity = (await this.activityService.getActivity(
      data.id,
    )) as Activity & { team: Team };
    if (!activity) {
      throw new Error('Activity not found');
    }

    return {
      id: activity.id,
      name: activity.name,
      description: activity.description ?? '',
      team: {
        id: activity.team_id,
        lead: activity.team.lead ?? '',
      },
    };
  }

  @Post('')
  @ApiBody({ type: CreateActivitySwagger })
  @Permissions(['create:activities'])
  @UsePipes(new ZodValidationPipe(createActivitySchema))
  async createActivity(
    @Body() dto: CreateActivityDto,
  ): Promise<Activity | null> {
    return await this.activityService.createActivity(dto);
  }

  @Get(':id')
  @Permissions(['read:activities'])
  async getActivity(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Activity | null> {
    return await this.activityService.getActivity(id);
  }

  @Get('')
  @ApiQuery({ type: ListActivitySwaggerDto, required: false })
  @UsePipes(new ZodValidationPipe(listActivitySchema))
  @Permissions(['read:activities'])
  async listActivities(
    @Query() dto: ListActivityDto,
  ): Promise<PaginationResponse<Activity>> {
    return await this.activityService.listActivities(dto);
  }

  @Put(':id')
  @ApiBody({ type: UpdateActivitySwagger, required: false })
  @Permissions(['update:activities'])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateActivitySchema)) dto: UpdateActivityDto,
  ): Promise<Activity | null> {
    return await this.activityService.updateAcitivty(id, dto);
  }
}
