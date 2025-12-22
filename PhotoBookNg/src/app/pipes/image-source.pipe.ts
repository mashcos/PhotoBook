import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'imageSource',
    standalone: true,
    pure: true
})
export class ImageSourcePipe implements PipeTransform {
    transform(filename: string): string {
        return 'assets/local/' + filename;
    }
}
