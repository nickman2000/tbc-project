import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NgTemplateOutlet } from '@angular/common';
import { IClient } from '../../core/users.model';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserDeleteDialogComponent } from '../user-delete-dialog/user-delete-dialog.component';
import { UserInfoComponent } from '../user-info/user-info.component';
import { UserService } from '../../core/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    NgTemplateOutlet,
    MatPaginator,
    MatDialogModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent implements OnInit {
  private dialog = inject(MatDialog);
  public userService: UserService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public displayedColumns = [
    'name',
    'surname',
    'clientNumber',
    'personalNumber',
    'actions',
  ];
  pageIndex: number = 0;

  ngOnInit() {
    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      if (params['page']) {
        this.handlePageEvent({
          pageIndex: +params['page'] - 1,
          pageSize: 10,
          length: this.userService.filteredUsers().length,
        });
      }
      if (params['sort']) {
        this.userService.sortingMethod = params['sort'];
        this.userService.sortUsers();
      }
    });
  }

  editClient(event: Event, user: IClient) {
    event.stopPropagation();
    this.router.navigate(['/form'], {
      queryParams: {
        action: 'edit',
        id: user.id,
      },
    });
  }

  removeClient(event: Event, id: number) {
    event.stopPropagation();
    this.dialog.open(UserDeleteDialogComponent, {
      data: { id },
      width: '800px',
      height: '300px',
    });
  }

  openUserInfo({ ...user }: IClient) {
    this.dialog.open(UserInfoComponent, {
      width: '800px',
      height: '600px',
      data: {
        user,
      },
    });
  }

  handlePageEvent(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    const startIndex = event.pageIndex * event.pageSize;
    this.router
      .navigate([''], {
        queryParams: {
          page: event.pageIndex + 1,
        },
        queryParamsHandling: 'merge',
      })
      .then(() => {
        this.userService.paginationData.set(
          this.userService
            .filteredUsers()
            .slice(startIndex, startIndex + event.pageSize),
        );
      });
  }
}
