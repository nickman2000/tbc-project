import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IClient } from '../../core/users.model';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserInfoComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { user: IClient }) {}
}
