import { Module } from '@nestjs/common';
import { ProbationService } from './probation.service';
import { ProbationController } from './probation.controller';

@Module({
  controllers: [ProbationController],
  providers: [ProbationService],
  exports: [ProbationService],
})
export class ProbationModule {}
