import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import {pipe, switchMap, tap, exhaustMap, map, filter} from 'rxjs';

import { User} from '../../models/user.model';
import { Credentials } from '../../models/credentials.model';
import { AuthService} from '../../services/auth.service';

type AuthState = {
  currentUser: User | null;
  authToken: string | null;
  isLoading: boolean;
  error: string | null;
  credentials: Credentials | null;
};

const initialState: AuthState = {
  currentUser: null,
  authToken: null,
  isLoading: false,
  error: null,
  credentials: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    router: inject(Router),
    authService: inject(AuthService)
  })),
  withComputed(({ currentUser }) => ({
    isLoggedIn: computed(() => !!currentUser()),
    username: computed(() => currentUser()?.username),
    userId: computed(() => currentUser()?.id)
  })),
  withMethods((store) => ({
    login: rxMethod<Credentials | null>(
      pipe(
        filter((credentials) => !!credentials),
        tap(() => patchState(store, { isLoading: true, error: null })),
        exhaustMap((credentials) =>
          store.authService.getAllUsers().pipe(
            map((users: User[]) => {
              const user = users.find(u => u.username === credentials.username && u.password === credentials.password);

              if (!user) { throw new Error('Invalid credentials'); }

              return { user, token: `fake-jwt-token-for-${user.id}` };
            }),
            tapResponse({
              next: ({ user, token }) => {
                patchState(store, { currentUser: user, authToken: token });
                store.router.navigateByUrl('/library');
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
      store.router.navigateByUrl('/login');
    },

    register: rxMethod<Credentials>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((credentials) =>
          store.authService.register(credentials).pipe(
            tapResponse({
              next: () => patchState(store, { credentials }),
              error: () => patchState(store, { error: 'Użytkownik o tej nazwie już istnieje.', isLoading: false }),
            })
          )
        )
      )
    ),
  })),
  withHooks({
    onInit({login, credentials}) {
      login(credentials)
    }
  })
);
