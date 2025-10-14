import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { User } from '../models/user.model';
import { Credentials } from '../models/credentials.model'

// Definiujemy URL do naszego API użytkowników
const API_URL = 'http://localhost:3000';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  register(userData: Credentials):Observable<User> {
    return this.http.post<User>(`${API_URL}/users`, userData);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${API_URL}/users`);
  }
}
