import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/users'; // URL de tu backend

  constructor(private http: HttpClient) {}

  // Método para realizar el login
  login(email: string, password: string): Observable<any> {
    const body = { user: email, password };
    return this.http.post(`${this.apiUrl}/login`, body);
  }
}
