import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink  } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  username = '';
  password = '';
  errorMessage: string | null = null;

  onSubmit() {
    this.errorMessage = null;
    const success = this.authService.login(this.username, this.password);

    if (success) {
      this.router.navigate(['/library']);
    } else {
      this.errorMessage = 'Nieprawidłowa nazwa użytkownika lub hasło.';
    }
  }
}