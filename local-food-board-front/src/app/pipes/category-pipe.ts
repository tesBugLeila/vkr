import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'category',
})
export class CategoryPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'OTHER':
        return 'Другое';
      case 'PIES':
        return 'Пироги';
      case 'JAMS':
        return 'Варенье и джемы';
      case 'VEGETABLES':
        return 'Овощи';
      case 'DAIRY':
        return 'Молочные продукты';
      case 'MEAT':
        return 'Мясо';
      case 'BAKERY':
        return 'Выпечка';
      default:
        return value;
    }
  }
}
