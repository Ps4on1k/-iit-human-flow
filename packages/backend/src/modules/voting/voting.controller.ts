import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VotingService } from './voting.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Voting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('voting')
export class VotingController {
  constructor(private votingService: VotingService) {}

  @Post(':candidateId')
  @ApiOperation({ summary: 'Vote for/against/neutral on candidate' })
  vote(
    @Param('candidateId') candidateId: string,
    @CurrentUser('id') userId: string,
    @Body('vote') vote: string,
    @Body('comment') comment?: string,
  ) {
    return this.votingService.vote(candidateId, userId, vote, comment);
  }

  @Get(':candidateId')
  @ApiOperation({ summary: 'Get all votes for candidate' })
  getVotes(@Param('candidateId') candidateId: string) {
    return this.votingService.getVotes(candidateId);
  }

  @Get(':candidateId/summary')
  @ApiOperation({ summary: 'Get vote summary (for/against/neutral counts)' })
  getSummary(@Param('candidateId') candidateId: string) {
    return this.votingService.getVoteSummary(candidateId);
  }
}
