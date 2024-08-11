import { IsNotEmpty, IsOptional, IsUrl, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateWishDto {
  @Length(1, 250)
  @IsNotEmpty()
  name: string;

  @IsUrl()
  @IsNotEmpty()
  image: string;

  @IsUrl()
  @IsNotEmpty()
  link: string;

  @Transform(({ value }) => Number.parseFloat(value).toFixed(2))
  @IsNotEmpty()
  price: number;

  @IsOptional()
  description: string;
}
