import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  errorMessage: string | null = null;

  onSubmit() {
    this.errorMessage = null;
    const success = this.authService.register(this.username, this.password);

    if (success) {
      // Po pomyślnej rejestracji od razu logujemy i przechodzimy do biblioteki
      this.authService.login(this.username, this.password);
      this.router.navigate(['/library']);
    } else {
      this.errorMessage = 'Użytkownik o tej nazwie już istnieje.';
    }
  }
}