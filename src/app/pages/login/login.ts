import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  signal,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { Common } from '../../services/common';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: {
    expirationDate: string;
    token: string;
  };
  requiredAuthenticatorType: any;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export default class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);
  private common = inject(Common);

  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  hidePassword = signal(true);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    // Zaten giriş yapmışsa dashboard'a yönlendir
    if (this.common.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const credentials: LoginRequest = this.loginForm.value;

      this.http.post<LoginResponse>('api/auth/login', credentials).subscribe({
        next: (response) => {
          try {
            // Common service'deki loginSuccess metodunu kullan
            this.common.loginSuccess(response.accessToken.token);
            
            // Dashboard'a yönlendir
            this.router.navigate(['/dashboard']);
          } catch (error) {
            console.error('Login success handling error:', error);
            this.errorMessage.set('Giriş işlemi başarılı ancak yönlendirme hatası oluştu.');
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.errorMessage.set(
            error.error?.message || 'Giriş yapılırken bir hata oluştu.'
          );
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  // Form field hatalarını göster
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Bu alan gereklidir';
      }
      if (field.errors['email']) {
        return 'Geçerli bir email adresi girin';
      }
      if (field.errors['minlength']) {
        return 'Şifre en az 6 karakter olmalıdır';
      }
    }
    return '';
  }
}