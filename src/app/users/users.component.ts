import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserService } from './core/user.service';
import { UserFiltersComponent } from './components/user-filters/user-filters.component';
import { IClientFilter } from './core/users.model';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ErrorModalComponent } from '../errors/error-modal/error-modal.component';
import { ErrorService } from '../errors/core/error.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [UserListComponent, UserFiltersComponent, ErrorModalComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  public errorService = inject(ErrorService);

  public form: FormGroup = this.fb.group({
    name: '',
    surname: '',
    personalNumber: '',
    clientNumber: '',
  });

  ngOnInit(): void {
    this.filterByParams();
  }

  filterByParams(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        if (
          params['name'] ||
          params['surname'] ||
          params['clientNumber'] ||
          params['personalNumber']
        ) {
          this.setFormValuesFromParams({ ...params } as IClientFilter);
          this.userService.filterUsers({ ...params } as IClientFilter);
          this.cdr.markForCheck();
        } else {
          this.userService.setInitialUsers();
        }
      });
  }

  setFormValuesFromParams(params: IClientFilter): void {
    this.form.patchValue({
      name: params?.name || '',
      surname: params?.surname || '',
      personalNumber: params?.personalNumber || '',
      clientNumber: params?.clientNumber || '',
    });
  }
}
