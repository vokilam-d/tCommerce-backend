import { Expose, Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { AdminShippingAddressDto } from './customer.dto';
import { AdminOrderItemDto } from './order-item.dto';

export class AdminAddOrUpdateOrderDto {
  @Expose()
  @IsOptional()
  @IsNumber()
  customerId: number;

  @Expose()
  @IsString()
  customerFirstName: string;

  @Expose()
  @IsString()
  customerLastName: string;

  @Expose()
  @IsOptional()
  @IsString()
  customerEmail: string;

  @Expose()
  @IsOptional()
  @IsString()
  customerPhoneNumber: string;

  @Expose()
  @ValidateNested()
  @Type(() => AdminShippingAddressDto)
  address: AdminShippingAddressDto;

  @Expose()
  @IsBoolean()
  shouldSaveAddress: boolean;

  @Expose()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdDate: Date;

  @Expose()
  @IsOptional()
  @IsBoolean()
  isConfirmationEmailSent: boolean;

  @Expose()
  @IsString()
  paymentMethodId: string;

  @Expose()
  @IsString()
  paymentMethodName: string;

  @Expose()
  @IsString()
  shippingMethodId: string;

  @Expose()
  @IsString()
  shippingMethodName: string;

  @Expose()
  @IsBoolean()
  isCallbackNeeded: boolean;

  @Expose()
  @IsOptional()
  novaposhtaTrackingId: any;

  @Expose()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AdminOrderItemDto)
  items: AdminOrderItemDto[];

  @Expose()
  status: any;

  @Expose()
  @IsString()
  clientNote: string;

  @Expose()
  @IsString()
  adminNote: string;

  @Expose()
  @IsString({ each: true })
  logs: string[];

  @Expose()
  @IsOptional()
  @IsNumber()
  orderTotalPrice: number;
}

export class AdminOrderDto extends AdminAddOrUpdateOrderDto {
  @Expose()
  @Transform(((value, obj) => value ? value : obj._id && obj._id.toString()))
  id: number;
}
