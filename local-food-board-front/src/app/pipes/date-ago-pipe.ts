import { Pipe, PipeTransform } from '@angular/core';

const ru: { [index: string]: string[] } = {
  //       1     2     5
  year: ['год', 'годa', 'лет'],
  month: ['месяц', 'месяцa', 'месяцев'],
  week: ['неделя', 'недели', 'недель'],
  day: ['день', 'дня', 'дней'],
  hour: ['час', 'часa', 'часов'],
  minute: ['минута', 'минуты', 'минут'],
  second: ['секунда', 'секунды', 'секунд'],
};

@Pipe({
  name: 'dateAgo',
  standalone: true,
  pure: true,
})
export class DateAgoPipe implements PipeTransform {
  transform(value: Date, args?: any): string {
    if (value) {
      const seconds = Math.floor((+new Date() - +new Date(value)) / 1000);
      if (seconds < 29)
        return 'Только что';
      const intervals: { [key: string]: number } = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1,
      };
      let counter;
      for (const i in intervals) {
        counter = Math.floor(seconds / intervals[i]);
        if (counter > 0) {
          return `${counter} ${ru[i][this.ruIndex(counter)]} назад`; // singular (1 day ago)
        }
      }
    }
    return value.toString();
  }

  ruIndex(value: number): number {
    value = Math.abs(value) % 100;
    const num = value % 10;
    if (value > 10 && value < 20) return 2;
    if (num > 1 && num < 5) return 1;
    if (num == 1) return 0;
    return 2;
  }
}
