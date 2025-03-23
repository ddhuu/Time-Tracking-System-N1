import { CustomerModule } from '@/domain/customer/customer.module';
import { TeamModule } from '@/domain/team/team.module';
import { ProjectModule } from '@/domain/project/project.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [CustomerModule, TeamModule, ProjectModule],
  exports: [CustomerModule, TeamModule, ProjectModule],
})
export class DomainModule {}
