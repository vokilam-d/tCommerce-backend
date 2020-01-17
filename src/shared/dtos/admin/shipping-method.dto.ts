import { Expose, Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsString, Matches } from 'class-validator';
import { notEmptyStringRegex } from '../../constants';

export class ShippingMethodDto {
  @Expose()
  @Transform(((value, obj) => obj._id && obj._id.toString()))
  id: string;

  @Expose()
  @IsBoolean()
  isEnabled: boolean;

  @Expose()
  @IsString()
  @Matches(notEmptyStringRegex, { message: 'Field \'name\' should not be empty'})
  name: string;

  @Expose()
  @IsNumber()
  price: number;

  @Expose()
  @IsNumber()
  sortOrder: number;
}
