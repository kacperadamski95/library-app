import {Injectable, signal, computed, effect } from '@angular/core';
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
    this.loadUsersFromStorage();

    // Efekt, który automatycznie zapisuje listę użytkowników, gdy się zmieni
    effect(() => {
      const users = this.allUsers();
      const currentState = this.storageService.loadState() || {};
      this.storageService.saveState({ ...currentState, users });
    });
  }

  register(username: string, password: string): boolean {

    const userExists = this.allUsers().some(u => u.username === username);

    if (userExists) {
      return false;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      password
    };
    // Aktualizujemy sygnał, co automatycznie uruchomi efekt zapisu
    this.allUsers.update(users => [...users, newUser]);
    return true;
  }

  login(username: string, password: string): boolean {
    const user = this.allUsers().find(u => u.username === username && u.password === password);
    if (user) {
      this.currentUser.set(user);
    }
    // można po prostu zwrócić obecną wartość zmiennej niż na sztywno pisać true/ false
    return !!user
  }

  logout(): void {
    this.currentUser.set(null);
  }

  private loadUsersFromStorage() {
    const state = this.storageService.loadState();
    if (state && state.users) {
      this.allUsers.set(state.users);
    }
  }
}
