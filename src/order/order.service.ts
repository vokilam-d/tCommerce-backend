import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './models/order.model';
import { ReturnModelType } from '@typegoose/typegoose';
import { AdminSortingPaginatingDto } from '../shared/dtos/admin/filter.dto';
import { AdminAddOrUpdateOrderDto } from '../shared/dtos/admin/order.dto';
import { CounterService } from '../shared/counter/counter.service';
import { CustomerService } from '../customer/customer.service';
import { AdminAddOrUpdateCustomerDto } from '../shared/dtos/admin/customer.dto';

@Injectable()
export class OrderService {

  constructor(@InjectModel(Order.name) private readonly orderModel: ReturnModelType<typeof Order>,
              private counterService: CounterService,
              private customerService: CustomerService) {
  }

  async getAllOrders(sortingPaging: AdminSortingPaginatingDto = new AdminSortingPaginatingDto()): Promise<Order[]> {
    const found = await this.orderModel
      .find()
      .sort(sortingPaging.sort)
      .skip(sortingPaging.skip)
      .limit(sortingPaging.limit)
      .exec();

    return found;
  }

  async getOrderById(orderId: number): Promise<Order> {
    const found = await this.orderModel.findById(orderId).exec();
    if (!found) {
      throw new NotFoundException(`Order with id '${orderId}' not found`);
    }

    return found;
  }

  async createOrder(orderDto: AdminAddOrUpdateOrderDto): Promise<Order> {
    if (orderDto.customerId && orderDto.shouldSaveAddress) {
      await this.customerService.addCustomerAddress(orderDto.customerId, orderDto.address);

    } else if (!orderDto.customerId) {
      if (!orderDto.customerFirstName) { orderDto.customerFirstName = orderDto.address.firstName; }
      if (!orderDto.customerLastName) { orderDto.customerLastName = orderDto.address.lastName; }
      if (!orderDto.customerPhoneNumber) { orderDto.customerPhoneNumber = orderDto.address.phoneNumber; }

      const customer = new AdminAddOrUpdateCustomerDto();
      customer.firstName = orderDto.customerFirstName;
      customer.lastName = orderDto.customerLastName;
      customer.email = orderDto.customerEmail;
      customer.phoneNumber = orderDto.customerPhoneNumber;
      customer.addresses = [{ ...orderDto.address, isDefault: true }];

      const createdCustomer = await this.customerService.createCustomer(customer);

      orderDto.customerId = createdCustomer.id;
    }

    const newOrder = new this.orderModel(orderDto);
    newOrder.id = await this.counterService.getCounter(Order.collectionName);
    newOrder.createdDate = new Date();
    newOrder.orderTotalPrice = newOrder.items.reduce((acc, item) => acc + item.totalCost, 0);

    await newOrder.save();

    return newOrder;
  }

  async updateOrder(orderId: number, orderDto: AdminAddOrUpdateOrderDto): Promise<Order> {
    const found = await this.orderModel.findById(orderId).exec();
    if (!found) {
      throw new NotFoundException(`Order with id '${orderId}' not found`);
    }

    Object.keys(orderDto).forEach(key => found[key] = orderDto[key]);
    await found.save();

    return found;
  }

  async deleteOrder(orderId: number): Promise<Order> {
    const deleted = await this.orderModel.findByIdAndDelete(orderId).exec();
    if (!deleted) {
      throw new NotFoundException(`Order with id '${orderId}' not found`);
    }

    return deleted;
  }

  countOrders(): Promise<number> {
    return this.orderModel.estimatedDocumentCount().exec();
  }
}
