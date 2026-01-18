import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'parseDateTime',
})
export class ParseDateTimePipe implements PipeTransform {
  transform(value: string | Date, ...args: unknown[]): Date {
    if (typeof value !== 'string') {
      return value as Date;
    }
    // Разделяем дату и время
    const [datePart, timePart] = value.split(' ');

    // Разделяем компоненты даты и времени
    const [day, month, year] = datePart.split('.').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    // Важно: в JS месяцы начинаются с 0 (январь = 0, февраль = 1 и т.д.)
    return new Date(year, month - 1, day, hours, minutes);
  }
}
