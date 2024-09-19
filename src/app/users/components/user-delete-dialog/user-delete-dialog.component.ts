import { ChangeDetectorRef, Component, Inject, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { UserService } from '../../core/user.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-user-delete-dialog',
  standalone: true,
  imports: [MatButton],
  templateUrl: './user-delete-dialog.component.html',
  styleUrl: './user-delete-dialog.component.scss',
})
export class UserDeleteDialogComponent {
  private userService = inject(UserService);
  private matDialogRef: MatDialogRef<UserDeleteDialogComponent> =
    inject(MatDialogRef);
  private cdr = inject(ChangeDetectorRef);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { id: number }) {}

  deleteUser(id: number) {
    this.userService
      .deleteUser(id)
      .pipe(
        finalize(() => {
          this.matDialogRef.close();
          this.cdr.detectChanges();
        }),
      )
      .subscribe();
  }

  closeModal() {
    this.matDialogRef.close();
  }
}
