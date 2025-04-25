import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //private apiUrl = 'http://localhost:3000/api';
  private apiUrl = 'https://cvainventario.onrender.com/api';
  //private apiUrl = 'http://192.168.15.93:3000/api'; 

  //private apiUrluserlog = 'http://localhost:3000/user';
  private apiUrluserlog = 'https://cvainventario.onrender.com/user';
  //private apiUrluserlog = 'http://192.168.15.93:3000/user';

  constructor(private http: HttpClient) {}
  login(email: string, password: string): Observable<any> {
    const body = { user: email, password };
    return this.http.post(`${this.apiUrl}/login`, body);
  }
  getNextFurnitureId(): Observable<{ nextId: number }> {
    return this.http.get<{ nextId: number }>(`${this.apiUrluserlog}/nextId`);
  }
  addFurniture(furnitureData: {
    type: string;
    description: string;
    evidences: Array<{
      image: string; // base64
      filename: string;
      evidenceDescription: string;
    }>;
  }): Observable<any> {
    return this.http.post(`${this.apiUrluserlog}/addFurniture`, furnitureData);
  }
  getFurnitureWithImages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrluserlog}/muebles`);
  }

  // En tu AuthService
  createClient(clientData: any): Observable<any> {
    return this.http.post(`${this.apiUrluserlog}/clients`, clientData);
  }

  getClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrluserlog}/clients`);
  }

  updateClient(id: number, clientData: any): Observable<any> {
    return this.http.put(`${this.apiUrluserlog}/clients/${id}`, clientData);
  }

  deleteClient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrluserlog}/clients/${id}`);
  }

  createProveedor(proveedorData: any): Observable<any> {
    return this.http.post(`${this.apiUrluserlog}/proveedores`, proveedorData);
  }

  getProveedores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrluserlog}/proveedores`);
  }

  updateProveedor(id: number, proveedorData: any): Observable<any> {
    return this.http.put(`${this.apiUrluserlog}/proveedores/${id}`, proveedorData);
  }

  deleteProveedor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrluserlog}/proveedores/${id}`);
  }
  // Métodos adicionales para productos en tu AuthService
createProducto(productoData: any): Observable<any> {
  return this.http.post(`${this.apiUrluserlog}/productos`, productoData);
}

getProductos(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrluserlog}/productos`);
}

getProducto(id: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrluserlog}/productos/${id}`);
}

updateProducto(id: number, productoData: any): Observable<any> {
  return this.http.put(`${this.apiUrluserlog}/productos/${id}`, productoData);
}

deleteProducto(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrluserlog}/productos/${id}`);
}

// profile
getUserProfile(userId: string) {
  return this.http.get(`${this.apiUrl}/profile/${userId}`);
}

updateProfile(userId: string, profileData: any) {
  return this.http.put(`${this.apiUrl}/profile/${userId}`, profileData);
}

updatePassword(userId: string, currentPassword: string, newPassword: string) {
  return this.http.put(`${this.apiUrl}/profile/${userId}/password`, {
    currentPassword,
    newPassword
  });
}
}
