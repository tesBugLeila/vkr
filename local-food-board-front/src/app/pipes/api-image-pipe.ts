import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'apiImage',
  standalone: true,
})
export class ApiImagePipe implements PipeTransform {
  transform(path: string | null | undefined): string | null {
    if (!path) return null;


    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    if (path.startsWith('/uploads')) {
      
    return path; 
  
    }

    // Относительные пути
    return '/uploads/' + path;
  }
}
