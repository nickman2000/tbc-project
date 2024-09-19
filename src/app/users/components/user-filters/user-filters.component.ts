import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { UserService } from '../../core/user.service';
import { IClientFilter } from '../../core/users.model';
import { Router } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatOption, MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-user-filters',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatLabel,
    MatInputModule,
    MatButton,
    MatDialogModule,
    FormsModule,
    MatSelect,
    MatOption,
  ],
  templateUrl: './user-filters.component.html',
  styleUrl: './user-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFiltersComponent {
  public userService = inject(UserService);
  private router = inject(Router);

  public searchForm = input.required<FormGroup>();

  filterForm() {
    this.router
      .navigate([''], {
        queryParams: {
          name: this.searchForm().value.name || null,
          surname: this.searchForm().value.surname || null,
          clientNumber: this.searchForm().value.clientNumber || null,
          personalNumber: this.searchForm().value.personalNumber || null,
        },
        queryParamsHandling: 'merge',
      })
      .then(() => {
        this.userService.filterUsers(this.searchForm().value as IClientFilter);
      });
  }

  removeFilters() {
    this.router
      .navigate([''], {
        queryParams: {
          name: null,
          surname: null,
          clientNumber: null,
          personalNumber: null,
        },
        queryParamsHandling: 'merge',
      })
      .then(() => {
        this.searchForm().reset();
        this.userService.setInitialUsers();
      });
  }

  addUser() {
    this.router.navigate(['/form'], {
      queryParams: {
        action: 'add',
      },
    });
  }

  sortTable() {
    this.router.navigate([''], {
      queryParams: {
        sort: this.userService.sortingMethod,
      },
      queryParamsHandling: 'merge',
    });
    this.userService.sortUsers();
  }
}
