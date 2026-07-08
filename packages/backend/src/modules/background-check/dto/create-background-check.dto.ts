import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBackgroundCheckDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  passportVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  criminalClearance?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  referenceCheck?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  creditCheck?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
