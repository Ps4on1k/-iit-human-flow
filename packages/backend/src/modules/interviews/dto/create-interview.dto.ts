import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInterviewDto {
  @ApiProperty()
  @IsString()
  candidateId: string;

  @ApiProperty()
  @IsEnum(['SCREENING', 'TECHNICAL', 'FINAL'])
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  interviewerId?: string;

  @ApiProperty()
  @IsString()
  vacancyId: string;
}
