import { Module } from '@nestjs/common';
import { BackgroundCheckService } from './background-check.service';
import { BackgroundCheckController } from './background-check.controller';

@Module({
  controllers: [BackgroundCheckController],
  providers: [BackgroundCheckService],
  exports: [BackgroundCheckService],
})
export class BackgroundCheckModule {}
