import { Injectable } from "@angular/core";


@Injectable({
    providedIn: 'root'
})

export class StorageService {
  // Zapisuje stan do localStorage, konwertując obiekt na string JSON
  saveState(state: any): void {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem('appState', serializedState);
    } catch (e) {
      console.error('Wystąpił błąd przy zapisaniu stanu do local storage', e);
    }
  }

  // Odczytuje stan z localStorage, konwertując string JSON na obiekt
  loadState(): any {
    try {
      const serializedState = localStorage.getItem('appState');
      if (serializedState === null) {
        return undefined; // Brak zapisanego stanu
      }
      return JSON.parse(serializedState);
    } catch (e) {
      console.error('Wystąpił błąd przy ładowaniu stanu z local storage', e);
      return undefined;
    }
  }
}