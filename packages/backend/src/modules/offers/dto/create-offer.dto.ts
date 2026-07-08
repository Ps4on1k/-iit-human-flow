import { IsString, IsNumber, IsOptional, IsDateString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOfferDto {
  @ApiProperty()
  @IsString()
  candidateId: string;

  @ApiProperty()
  @IsString()
  vacancyId: string;

  @ApiProperty()
  @IsNumber()
  salary: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  benefits?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  letterHtml?: string;
}
