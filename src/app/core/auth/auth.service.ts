import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { firstValueFrom } from 'rxjs';

// Definiujemy URL do naszego API użytkowników
const USERS_API_URL = 'http://localhost:3000/users';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Sygnał aktualnie zalogowanego użytkownika
  currentUser = signal<User | null>(null);
  // Sygnał obliczeniowy - czy ktoś jest zalogowany
  isLoggedIn = computed(() => !!this.currentUser());

  private http = inject(HttpClient);
  // Listę wszystkich użytkowników
  private allUsers = signal<User[]>([]);

  constructor() {
    // Na starcie serwisu od razu ładuje listę użytkowników z serwera
    this.loadInitialUsers();
  }

  // === METODY PUBLICZNE (API SERWISU) ===
  //   Rejestruje nowego użytkownika w systemie
  async register(username: string, password: string): Promise<boolean> {
    // Sprawdzam, czy użytkownik o takiej nazwie już istnieje
    if (this.allUsers().some(u => u.username === username)) {
      console.error('Użytkownik o takiej nazwie już istnieje');
      return false;
    }

    const newUser: Omit<User, 'id'> = { username, password };

    try {
      // Wysyłam żądanie POST i czekamy na odpowiedź z serwera
      const addedUser = await firstValueFrom(this.http.post<User>(USERS_API_URL, newUser));
      // Aktualizujemy nasz lokalny stan (sygnał) z listą użytkowników
      this.allUsers.update(users => [...users, addedUser]);
      return true;
    } catch (error) {
      console.error('Rejestracja użytkownika nie powiodła się, spróbuj ponownie później', error);
      return false;
    }
  }


   // Loguje użytkownika do systemu. True jeśli logowanie się powiodło, false w przeciwnym razie
  async login(username: string, password: string): Promise<boolean> {
    // Przed każdą próbą logowania, odświeżam listę użytkowników z serwera, aby mieć pewność, że pracuje na aktualnych danych
    await this.loadInitialUsers();

    const user = this.allUsers().find(u => u.username === username && u.password === password);

    if (user) {
      // Ustawiamy sygnał z bieżącym użytkownikiem
      this.currentUser.set(user);
      return true;
    }
    return false;
  }

   // Wylogowuje bieżącego użytkownika.
  logout(): void {
    this.currentUser.set(null);
  }
  // === METODY PRYWATNE ===
   // Prywatna metoda do pobierania listy wszystkich użytkowników z serwera i aktualizowania stanu w sygnale.
  private async loadInitialUsers(): Promise<void> {
    try {
      const users = await firstValueFrom(this.http.get<User[]>(USERS_API_URL));
      this.allUsers.set(users);
    } catch (error) {
      console.error('Nie udało się załadować listy użytkowników', error);
      this.allUsers.set([]);
    }
  }
}
