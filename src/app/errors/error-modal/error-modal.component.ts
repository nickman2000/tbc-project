import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Inject,
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { animate, style, transition, trigger } from '@angular/animations';
import { ErrorService } from '../core/error.service';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [],
  templateUrl: './error-modal.component.html',
  styleUrl: './error-modal.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translate(100px, 0)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translate(0, 0)' }),
        ),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorModalComponent {
  private errorService = inject(ErrorService);
  public errorText = computed(() => this.errorService.errorText());
}
