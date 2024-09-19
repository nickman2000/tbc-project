import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormAction, IAccount, IClient } from '../../core/users.model';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatCheckbox } from '@angular/material/checkbox';
import { UserService } from '../../core/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, take } from 'rxjs';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    MatError,
    MatSelect,
    MatOption,
    MatCheckbox,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  public url = signal<string | null | undefined | ArrayBuffer>('');

  private mainAction = FormAction.AddUser;
  public isSubmitted = signal<boolean>(false);
  public hasUnsavedChanges = signal<boolean>(false);

  private editUser: IClient | null = null;

  public clientForm: FormGroup = this.fb.group({
    id: [
      (
        +this.userService.users()[this.userService.users().length - 1].id + 1
      ).toString(),
    ],
    photoUrl: ['', Validators.required],
    clientNumber: [
      '',
      [
        Validators.required,
        Validators.pattern('^[0-9]+$'),
        this.checkIfValueExists('clientNumber'),
      ],
    ],
    personalNumber: [
      '',
      [Validators.required, Validators.pattern('^[0-9]{11}$')],
    ],
    surname: [
      '',
      [
        Validators.required,
        this.onlyEnglishOrGeorgianLettersValidator(),
        Validators.minLength(2),
        Validators.maxLength(50),
      ],
    ],
    name: [
      '',
      [
        Validators.required,
        this.onlyEnglishOrGeorgianLettersValidator(),
        Validators.minLength(2),
        Validators.maxLength(50),
      ],
    ],
    mobileNumber: [
      '',
      [Validators.required, Validators.pattern('^5[0-9]{8}$')],
    ],
    gender: ['', Validators.required],
    country: ['', Validators.required],
    city: ['', Validators.required],
    address: ['', Validators.required],
    realCountry: ['', Validators.required],
    realCity: ['', Validators.required],
    realAddress: ['', Validators.required],
    isSameAddress: false,
    accounts: this.fb.array([]),
  });

  private sameAddressValue!: string;

  ngOnInit() {
    this.sameAddressValue = this.clientForm?.get('isSameAddress')?.value;
    this.trackFormValues();

    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((param) => {
        if (param['action'] === 'edit') {
          this.mainAction = FormAction.EditUser;
          if (param['id']) {
            this.fillFormValues(param['id']);
          }
          return;
        } else {
          this.mainAction = FormAction.AddUser;
        }
      });
  }

  private trackFormValues(): void {
    this.clientForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.hasUnsavedChanges.set(true);
        if (value.isSameAddress !== this.sameAddressValue) {
          this.sameAddressValue = value.isSameAddress;
          this.onCopyAddressChange();
        }
      });
  }

  private checkIfValueExists(
    key: keyof IClient | keyof IAccount,
    value?: number,
  ) {
    return (control: AbstractControl) => {
      let userExists = false;
      let userAccountCount = 0;
      if (key === 'clientNumber') {
        userExists = !!this.userService.users().filter((user) => {
          return (
            user[key] === +control.value &&
            +control.value !== this.editUser?.clientNumber
          );
        })?.length;
      } else {
        this.userService.users().forEach((user) => {
          userAccountCount +=
            user.accounts?.filter((account) => {
              return (
                account[key as keyof IAccount] === +control.value &&
                +control.value !== value
              );
            }).length || 0;
        });
      }
      if (userExists || userAccountCount > 0) {
        return {
          exists: true,
        };
      }
      return null;
    };
  }

  fillFormValues(id: number): void {
    const [user] = this.userService.users().filter((user) => user.id === id);
    this.editUser = user;
    Object.keys(user).forEach((key) => {
      this.clientForm.get(key)?.patchValue((user as any)[key]);
    });
    if (user.accounts?.length) {
      user.accounts.forEach((account: IAccount) => {
        this.addAccountsForm(account);
      });
    }
  }

  addAccountsForm(account?: IAccount): void {
    const accountForm = this.fb.group({
      accountNumber: [
        account?.accountNumber || null,
        [
          this.checkIfValueExists('accountNumber', account?.accountNumber),
          Validators.pattern('^[0-9]+$'),
          Validators.required,
        ],
      ],
      clientAccountNumber: [
        account?.clientAccountNumber || null,
        [
          this.checkIfValueExists(
            'clientAccountNumber',
            Number(account?.clientAccountNumber),
          ),
          Validators.pattern('^[0-9]+$'),
          Validators.required,
        ],
      ],
      accountType: [account?.accountType || null, Validators.required],
      currency: [account?.currency || null, Validators.required],
      accountStatus: [account?.accountStatus || null, Validators.required],
    });

    this.accountsFormArray.push(accountForm);
  }

  onlyEnglishOrGeorgianLettersValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value || '';
      const englishPattern = /^[A-Za-z]+$/;
      const georgianPattern = /^[ა-ჰ]+$/;

      if (!value) {
        return null;
      }

      const isValidEnglish = englishPattern.test(value);
      const isValidGeorgian = georgianPattern.test(value);

      if (isValidEnglish || isValidGeorgian) {
        return null;
      }

      return { lettersNotAllowed: true };
    };
  }

  onCopyAddressChange(): void {
    if (this.clientForm.get('isSameAddress')?.value) {
      this.clientForm.patchValue({
        realCountry: this.clientForm.get('country')?.value,
        realCity: this.clientForm.get('city')?.value,
        realAddress: this.clientForm.get('country')?.value,
      });
      this.clientForm.get('realCountry')?.disable();
      this.clientForm.get('realCity')?.disable();
      this.clientForm.get('realAddress')?.disable();

      this.clientForm.get('realCountry')?.clearValidators();
      this.clientForm.get('realCity')?.clearValidators();
      this.clientForm.get('realAddress')?.clearValidators();

      this.clientForm.get('realCountry')?.markAsPristine();
      this.clientForm.get('realCity')?.markAsPristine();
      this.clientForm.get('realAddress')?.markAsPristine();

      this.clientForm.get('realCountry')?.updateValueAndValidity();
      this.clientForm.get('realCity')?.updateValueAndValidity();
      this.clientForm.get('realAddress')?.updateValueAndValidity();
    } else {
      this.clientForm.patchValue({
        realCountry: '',
        realCity: '',
        realAddress: '',
      });

      this.clientForm.get('realCountry')?.enable();
      this.clientForm.get('realCity')?.enable();
      this.clientForm.get('realAddress')?.enable();

      this.clientForm.get('realCountry')?.setValidators(Validators.required);
      this.clientForm.get('realCity')?.setValidators(Validators.required);
      this.clientForm.get('realAddress')?.setValidators(Validators.required);

      this.clientForm.get('realCountry')?.updateValueAndValidity();
      this.clientForm.get('realCity')?.updateValueAndValidity();
      this.clientForm.get('realAddress')?.updateValueAndValidity();
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.url.set(e.target?.result);
        this.clientForm.patchValue({
          photoUrl: this.url(),
        });
        this.cdr.detectChanges();
      };

      reader.onerror = (e: ProgressEvent<FileReader>) => {
        console.error('File reading error:', e);
      };

      reader.readAsDataURL(file);
    }
  }

  get accountsFormArray() {
    return this.clientForm.get('accounts') as FormArray;
  }

  back(): void {
    this.router.navigateByUrl('');
  }

  transformFormValues(): IClient {
    const formValue = this.clientForm.value;
    return {
      ...formValue,
      clientNumber: +formValue.clientNumber,
      personalNumber: +formValue.personalNumber,
      mobileNumber: +formValue.mobileNumber,
      accounts: formValue.accounts.map((account: IAccount) => {
        return {
          ...account,
          clientAccountNumber: +account.clientAccountNumber,
          accountNumber: +account.accountNumber,
        };
      }),
    };
  }

  onSubmit(): void {
    this.isSubmitted.set(true);

    if (this.clientForm.invalid) return;
    this.hasUnsavedChanges.set(false);

    const formValue = this.transformFormValues();

    if (this.mainAction === FormAction.AddUser) {
      this.userService
        .addUser(formValue)
        .pipe(
          take(1),
          finalize(() => {
            this.router.navigateByUrl('');
          }),
        )
        .subscribe();
    }
    if (this.mainAction === FormAction.EditUser) {
      this.userService
        .editUser(formValue)
        .pipe(
          take(1),
          finalize(() => {
            this.router.navigateByUrl('');
          }),
        )
        .subscribe();
    }
  }

  removeAccount(i: number) {
    this.accountsFormArray.removeAt(i);
  }
}
