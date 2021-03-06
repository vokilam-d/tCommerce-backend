import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Order } from '../../order/models/order.model';
import { TelegramApiService } from './telegram-api.service';
import { AdminProductReviewDto } from '../../shared/dtos/admin/product-review.dto';
import { ITelegramInlineKeyboardMarkup } from '../interfaces/inline-keyboard-markup.interface';
import { AdminStoreReviewDto } from '../../shared/dtos/admin/store-review.dto';
import { beautifyPhoneNumber } from '../../shared/helpers/beautify-phone-number.function';
import { BotConfigurationService } from './bot-configuration.service';

@Injectable()
export class BotService implements OnApplicationBootstrap {

  private logger = new Logger(BotService.name);

  constructor(
    private readonly telegramApiService: TelegramApiService,
    private readonly botConfig: BotConfigurationService,
  ) { }

  async onApplicationBootstrap() {
  }

  async onNewOrder(order: Order): Promise<void> {
    if (!this.botConfig.adminOrderChat) { return; }
    const phone = beautifyPhoneNumber(order.customerPhoneNumber || order.shipment.recipient.phone);
    const _ = this.escapeString;

    let text = `Заказ №${order.id}\n`
      + `${_(order.customerFirstName)} ${_(order.customerLastName)}, ${_(phone)}\\.\n`;

    if (order.customerNote) {
      text += `\\(${_(order.customerNote)}\\)\\.\n`
    }

    text += `${_(order.shipment.recipient.settlement)}, ${_(order.shipment.recipient.address)}\\.\n`
      + `${_(order.paymentMethodAdminName.ru)}\\.\n`
      + `${order.isCallbackNeeded ? 'Перезвонить' : 'Не звонить'}\\.\n`;

    if (order.clientNote) {
      text += `Коммент клиента: _${order.clientNote}_\\.\n`
    }

    const itemsPluralText = order.items.length === 1 ? 'товар' : order.items.length > 4 ? 'товаров' : 'товара';
    text += `\n*${order.items.length}* ${itemsPluralText} на сумму *${order.prices.totalCost}* грн:\n\n`

    for (let i = 0; i < order.items.length; i++){
      text += `${i + 1}\\. ${_(order.items[i].name.ru)}, ${order.items[i].qty} шт\\.\n`
    }

    const reply: ITelegramInlineKeyboardMarkup = {
      inline_keyboard: [[{
        text: 'Посмотреть в админке',
        url: this.getFrontendUrl('order', order.id)
      }]]
    };

    this.telegramApiService.sendMessage(this.botConfig.adminOrderChat, text, reply);
  }

  async onNewProductReview(review: AdminProductReviewDto): Promise<void> {
    if (!this.botConfig.adminReviewsChat) { return; }

    let text = `*${this.escapeString(review.name)}* оставил\\(а\\) отзыв о товаре *"${this.escapeString(review.productName)}"*\n`
      + `Оценка: *${review.rating}*\n`
      + `Откуда: *${review.source}*\n`;

    if (review.medias.length) {
      text += `Кол\\-во фото: *${review.medias.length}*\n`;
    }
    text += `Текст:\n\n`
      + `_${this.escapeString(review.text)}_`;

    const reply: ITelegramInlineKeyboardMarkup = {
      inline_keyboard: [[{
        text: 'Посмотреть в админке',
        url: this.getFrontendUrl('product-review', review.id)
      }]]
    };

    this.telegramApiService.sendMessage(this.botConfig.adminReviewsChat, text, reply);
  }

  async onNewStoreReview(review: AdminStoreReviewDto): Promise<void> {
    if (!this.botConfig.adminReviewsChat) { return; }

    let text = `*${this.escapeString(review.name)}* оставил\\(а\\) отзыв о магазине\n`
      + `Оценка: *${review.rating}*\n`
      + `Откуда: *${review.source}*\n`;

    if (review.medias.length) {
      text += `Кол\\-во фото: *${review.medias.length}*\n`;
    }
    text += `\n_${this.escapeString(review.text)}_`;

    const reply: ITelegramInlineKeyboardMarkup = {
      inline_keyboard: [[{
        text: 'Посмотреть в админке',
        url: this.getFrontendUrl('store-review', review.id)
      }]]
    };

    this.telegramApiService.sendMessage(this.botConfig.adminReviewsChat, text, reply);
  }

  private escapeString(str: string): string {
    const toEscape = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!' ];
    let escapedStr: string = '';
    for (const strElement of str) {
      if (toEscape.includes(strElement)) {
        escapedStr += String.fromCharCode(92);
      }

      escapedStr += strElement;
    }

    return escapedStr;
  }

  private getFrontendUrl(type: 'order' | 'store-review' | 'product-review' | 'product', postfix: string | number = ''): string {
    const host = `https://klondike.com.ua`;
    const adminPrefix = `/admin`;

    let url = host + adminPrefix;
    switch (type) {
      case 'order':
        url += `/order/view/`;
        break;
      case 'store-review':
        url += `/store-review/edit/`;
        break;
      case 'product-review':
        url += `/product-review/edit/`;
        break;
      case 'product':
        url += `/product/edit/`;
        break;
    }

    return url + postfix;
  }

  async onInternalServerError(error: any) {
    const str = JSON.stringify(error, null, 2);
    const toEscape = ['`', '\\'];
    let escapedStr: string = '';
    for (const strElement of str) {
      if (toEscape.includes(strElement)) {
        escapedStr += String.fromCharCode(92);
      }

      escapedStr += strElement;
    }

    const message = '```json\n'
      + escapedStr
      + '\n```';

    this.telegramApiService.sendMessage(this.botConfig.adminHealthChat, message);
  }
}
