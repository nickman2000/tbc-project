import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, shareReplay, switchMap, tap } from 'rxjs';
import { IClient, IClientFilter } from './users.model';
import { ErrorService } from '../../errors/core/error.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private errorService = inject(ErrorService);
  private http = inject(HttpClient);

  private apiUrl!: string;

  public users = signal<IClient[]>([]);
  public filteredUsers = signal<IClient[]>([]);
  public paginationData = signal<IClient[]>([]);
  public sortingMethod: string = 'asc';

  public getUsers(): Observable<IClient[]> {
    return this.http.get<IClient[]>(`${this.apiUrl}/clients`).pipe(
      tap((users) => {
        this.users.set(users);
        this.setInitialUsers();
      }),
      shareReplay(1),
      catchError(() => {
        this.errorService.onError('Could not load, please try again.');
        return of([]);
      }),
    );
  }

  public setInitialUsers(): void {
    this.filteredUsers.set(this.users());
    this.paginationData.set(this.filteredUsers().slice(0, 10));
  }

  public filterUsers(filters: IClientFilter) {
    const users = this.users().filter(
      (user) =>
        user.name.toLowerCase().startsWith(filters.name?.toLowerCase() || '') &&
        user.clientNumber.toString().startsWith(filters?.clientNumber || '') &&
        user.personalNumber
          .toString()
          .startsWith(filters?.personalNumber || '') &&
        user.surname
          ?.toLowerCase()
          .startsWith(filters?.surname?.toLowerCase() || ''),
    );
    this.filteredUsers.set(users);
    this.paginationData.set(this.filteredUsers().slice(0, 10));
  }

  public deleteUser(id: number): Observable<IClient[]> {
    return this.http
      .delete<void>(`${this.apiUrl}/clients/${id}`)
      .pipe(switchMap(() => this.getUsers()));
  }

  public setApiUrl(url: string) {
    this.apiUrl = url;
  }

  public addUser(user: IClient): Observable<IClient> {
    return this.http.post<IClient>(`${this.apiUrl}/clients`, user);
  }

  public editUser(user: IClient): Observable<IClient> {
    return this.http.put<IClient>(`${this.apiUrl}/clients/${user.id}`, user);
  }

  public sortUsers(): void {
    if (this.sortingMethod === 'asc') {
      this.filteredUsers().sort((a, b) => a.id - b.id);
      this.paginationData.set(this.filteredUsers().slice(0, 10));
    } else {
      this.filteredUsers().sort((a, b) => b.id - a.id);
      this.paginationData.set(this.filteredUsers().slice(0, 10));
    }
  }
}
