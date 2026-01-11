/**
 * Вычисляет расстояние между двумя точками на Земле по их широте и долготе
 * с использованием формулы гаверсинуса (Haversine formula).
 * 
 * @param lat1 - широта первой точки в градусах
 * @param lon1 - долгота первой точки в градусах
 * @param lat2 - широта второй точки в градусах
 * @param lon2 - долгота второй точки в градусах
 * @returns расстояние между точками в метрах
 */

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Радиус Земли в метрах
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}