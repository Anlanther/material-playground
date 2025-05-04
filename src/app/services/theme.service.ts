import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkThemeSubject = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.darkThemeSubject.asObservable();

  toggleTheme() {
    const isDarkTheme = !this.darkThemeSubject.value;
    this.darkThemeSubject.next(isDarkTheme);
    if (isDarkTheme) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }

  getCurrentTheme(): boolean {
    return this.darkThemeSubject.value;
  }
}
