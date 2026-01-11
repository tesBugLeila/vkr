
/**
 * Форматирует дату в DD.MM.YYYY HH:MM
 */
export function formatDate(date?: Date | number): string {
  const d = date ? new Date(date) : new Date();
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

/**
 * Парсит дату из DD.MM.YYYY HH:MM в timestamp
 */
export function parseDate(dateStr: string): number {
  // Проверка формата
  if (!dateStr || typeof dateStr !== 'string') {
    throw new Error(`Неверный формат даты: ${dateStr}`);
  }
  
  const parts = dateStr.split(' ');
  if (parts.length !== 2) {
    throw new Error(`Дата должна содержать дату и время: ${dateStr}`);
  }
  
  const [datePart, timePart] = parts;
  const [day, month, year] = datePart.split('.').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  
  // Проверка валидности
  if (!day || !month || !year || isNaN(hours) || isNaN(minutes)) {
    throw new Error(`Не удалось распарсить дату: ${dateStr}`);
  }
  
  // Создаём Date (месяц в JS начинается с 0)
  const date = new Date(year, month - 1, day, hours, minutes);
  
  // Проверяем что дата валидна
  if (isNaN(date.getTime())) {
    throw new Error(`Невалидная дата: ${dateStr}`);
  }
  
  return date.getTime();
}