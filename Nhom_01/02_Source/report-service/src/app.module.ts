import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ApiModule } from './api/api.module';
import { DomainModule } from './domain/domain.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
// import { PrismaModule } from './prisma/prisma.module'; // Temporarily disabled

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    // PrismaModule, // Temporarily disabled
    DomainModule,
    InfrastructureModule,
    ApiModule,
  ],
})
export class AppModule {}
