import {Injectable, signal, computed, effect, inject, OnInit} from '@angular/core';
import { User } from '../models/user.model';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //private storageService = inject(StorageService);

  // Sygnały do przechowywania stanu użytkowników i bieżącego logowania
  allUsers = signal<User[]>([]);
  currentUser = signal<User | null>(null);

  // Sygnał obliczeniowy, który automatycznie zwraca true/false
  isLoggedIn = computed(() => !!this.currentUser());

  constructor(private storageService: StorageService) {
    // Przy starcie serwisu ładujemy dane z localStorage
    // metody na init lepiej wywoływać w hook z Angulara ngOnInit() niż w constructor(), w samym konstruktorze można wstrzykiwać zależności (stare podejście zastąpione przez inject) oraz wywoływać effect
    this.loadUsersFromStorage();

    // Efekt, który automatycznie zapisuje listę użytkowników, gdy się zmieni
    effect(() => {
      const users = this.allUsers();
      const currentState = this.storageService.loadState() || {};
      this.storageService.saveState({ ...currentState, users });
    });
  }

  // podkreśleń przed metodą używało się do określania metody prywatnej, więc nie trzeba tego dublować i wystarczy jak przed metodą damy prefix private
  // i co do reguły metody prywatne powinny być deklarowane na samym dole komponentu pod metodami publicznymi
  private loadUsersFromStorage() {
    const state = this.storageService.loadState();
    if (state && state.users) {
      this.allUsers.set(state.users);
    }
  }

  register(username: string, password: string): boolean {
    // Sprawdzamy, czy użytkownik już istnieje

    // do if lepiej przekazywać zmienną opisową która nam powie co dokłądnie sprawdza (dla lepszej czytelności kodu)
    /*if (this.allUsers().some(u => u.username === username)) {
      return false; // Rejestracja nieudana
    }*/

    const userExists = this.allUsers().some(u => u.username === username);

    if (!userExists) return false;

    const newUser: User = {
      id: crypto.randomUUID(), // Generujemy proste, unikalne ID
      username,
      password
    };

    // Aktualizujemy sygnał, co automatycznie uruchomi efekt zapisu
    this.allUsers.update(users => [...users, newUser]);
    return userExists;
  }

  login(username: string, password: string): boolean {
    const user = this.allUsers().find(u => u.username === username && u.password === password);
    if (user) {
      this.currentUser.set(user);
     // return true; // Logowanie udane
    }
  //  return false; // Logowanie nieudane

    // można po prostu zwrócić obecną wartość zmiennej niż na sztywno pisać true/ false

    return !!user
  }

  logout(): void {
    this.currentUser.set(null);
  }
}
