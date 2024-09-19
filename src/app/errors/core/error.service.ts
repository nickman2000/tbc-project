import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  public errorText = signal('Could not load');
  public hasError = signal<boolean>(false);

  onError(text: string) {
    this.errorText.set(text);
    this.hasError.set(true);
    setTimeout(() => this.hasError.set(false), 3000);
  }
}
