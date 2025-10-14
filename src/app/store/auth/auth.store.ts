import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap, exhaustMap, map } from 'rxjs';

import { User} from '../../core/models/user.model';
import { Credentials } from '../../core/models/credentials.model';
import { AuthService} from '../../core/auth/auth.service';

type AuthState = {
  currentUser: User | null;
  authToken: string | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  currentUser: null,
  authToken: null,
  isLoading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ currentUser }) => ({
    isLoggedIn: computed(() => !!currentUser()),
  })),
  withMethods((store, router = inject(Router), authService = inject(AuthService)) => ({

    login: rxMethod<Credentials>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        exhaustMap((credentials) =>
          authService.getAllUsers().pipe(
            map((users: User[]) => {
              const user = users.find(u => u.username === credentials.username && u.password === credentials.password);
              if (!user) { throw new Error('Invalid credentials'); }
              return { user, token: `fake-jwt-token-for-${user.id}` };
            }),
            tapResponse({
              next: ({ user, token }) => {
                patchState(store, { currentUser: user, authToken: token });
                router.navigateByUrl('/library');
              },
              error: () => patchState(store, { error: 'Nieprawidłowa nazwa użytkownika lub hasło.' }),
              finalize: () => patchState(store, { isLoading: false }),
            })
          )
        )
      )
    ),

    logout(): void {
      patchState(store, initialState);
      router.navigateByUrl('/login');
    },
  })),

  // --- KROK 2: Definiujemy metody, które ZALEŻĄ od metod z poprzedniego kroku ---
  withMethods((store, authService = inject(AuthService)) => ({

    register: rxMethod<Credentials>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((credentials) =>
          authService.register(credentials).pipe(
            tapResponse({
              next: () => {
                store.login(credentials);
              },
              error: () => {
                patchState(store, { error: 'Użytkownik o tej nazwie już istnieje.', isLoading: false });
              }
            })
          )
        )
      )
    ),
  }))
);
