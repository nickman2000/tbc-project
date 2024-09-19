import { HttpClient } from '@angular/common/http';
import { UserService } from './users/core/user.service';
import { tap } from 'rxjs';

interface IConfig {
  apiUrl: string;
}

export function configInitializer(http: HttpClient, userService: UserService) {
  return () =>
    http.get<IConfig>('config/config.json').pipe(
      tap((url: IConfig) => {
        userService.setApiUrl(url.apiUrl);
      }),
    );
}
