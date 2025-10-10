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

  // TODO: cała logika z przechowywaniem danych do wyniesienia do AuthStore. (patrz BooksStore)
  // Serwis który ma HTTP to niech się tylko tym zajmuje, bez logiki
  // Sama logika zawsze w storze aby nie robić tego w serwisach i komponentach.
  currentUser = signal<User | null>(null);
  // Sygnał obliczeniowy - czy ktoś jest zalogowany
  isLoggedIn = computed(() => !!this.currentUser());

  private http = inject(HttpClient);
  // Listę wszystkich użytkowników
  private allUsers = signal<User[]>([]);

  constructor() {
    // Na starcie serwisu od razu ładuje listę użytkowników z serwera

    // TODO: wynieść do AuthStore i wywołać w onInit.
    // jak będzie prawdziwy BE to nie będzie tego, BE załatwi to za nas
    this.loadInitialUsers();
  }

  // === METODY PUBLICZNE (API SERWISU) ===
  //   Rejestruje nowego użytkownika w systemie
  async register(username: string, password: string): Promise<boolean> {
    // TODO: ta metoda powinna mieć tylko request http (patrz BooksService)

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
    // TODO tutaj można w store bezpośrednio to zrobić, w prawdziwym BE będzie request aby załatwił to za nas

    // TODO: jak wywołamy to w store, to wystarczy top zrobić raz na init i przypisać do zmiennej aby nie wykonywać tego za każdym razem
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
    //TODO: jak w login()

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
