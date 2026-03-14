import { Sms } from '../models';
import {formatDate} from "./dateFormatter";

/**
 * Отправка sms для авторизации
 */
export async function sendCodeViaSms(
  phone: string,
  code: string
): Promise<void> {

    //TODO: Тут должно быть подключение API, SMS шлюза



    //TODO: убрать после подключения настоящего SMS шлюза, так как нельзя хранить отправляемые по SMS открытые пароли в базе.
      await Sms.create({
        phone,
        text: code,
        sendAt: formatDate()
      });
}