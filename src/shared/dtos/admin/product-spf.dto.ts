import { AdminSPFDto } from './spf.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { queryParamArrayDelimiter } from '../../constants';

export class AdminProductSPFDto extends AdminSPFDto {
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  withVariants: boolean;

  @IsString()
  @IsOptional()
  orderedDates: string;

  hasOrderedDates(): boolean {
    return this.getOrderedDates().some(date => !!date);
  }

  getOrderedDates(): string[] {
    if (!this.orderedDates) { return []; }

    const decoded = decodeURIComponent(this.orderedDates);
    if (!decoded) { return []; }

    return decoded.split(queryParamArrayDelimiter);
  }
}
