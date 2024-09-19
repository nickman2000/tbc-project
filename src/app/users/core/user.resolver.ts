import { inject } from '@angular/core';
import { UserService } from './user.service';
import { Observable } from 'rxjs';
import { IClient } from './users.model';
import { ResolveFn } from '@angular/router';

export const userResolver: ResolveFn<Observable<IClient[]>> = () => {
  return inject(UserService).getUsers();
};
