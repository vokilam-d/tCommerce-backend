import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from './models/product.model';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryModule } from '../inventory/inventory.module';

const productModel = {
  name: Product.modelName,
  schema: Product.model.schema,
  collection: Product.collectionName
};

@Module({
  imports: [
    MongooseModule.forFeature([productModel]),
    InventoryModule
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService]
})
export class ProductModule {}