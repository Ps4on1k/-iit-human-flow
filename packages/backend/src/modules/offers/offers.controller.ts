import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Offers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('offers')
export class OffersController {
  constructor(private offersService: OffersService) {}

  @Get()
  @ApiOperation({ summary: 'List offers for candidate' })
  findByCandidate(@Query('candidateId') candidateId: string) {
    return this.offersService.findByCandidate(candidateId);
  }

  @Post()
  @ApiOperation({ summary: 'Create offer' })
  create(@Body() dto: CreateOfferDto, @CurrentUser('id') userId: string) {
    return this.offersService.create(dto, userId);
  }

  @Patch(':id/send-for-approval')
  @ApiOperation({ summary: 'Send offer for approval' })
  sendForApproval(@Param('id') id: string, @Body('approverIds') approverIds: string[]) {
    return this.offersService.sendForApproval(id, approverIds);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve or reject offer' })
  approve(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('approved') approved: boolean,
    @Body('comment') comment?: string,
  ) {
    return this.offersService.approve(id, userId, approved, comment);
  }

  @Patch(':id/send')
  @ApiOperation({ summary: 'Mark offer as sent to candidate' })
  send(@Param('id') id: string) {
    return this.offersService.markSent(id);
  }

  @Patch(':id/respond')
  @ApiOperation({ summary: 'Candidate responds to offer' })
  respond(@Param('id') id: string, @Body('accepted') accepted: boolean) {
    return this.offersService.respond(id, accepted);
  }
}
