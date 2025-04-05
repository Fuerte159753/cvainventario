import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Notyf } from 'notyf';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const notyf = new Notyf();

  // Verificar si existe userId en sessionStorage
  const userId = sessionStorage.getItem('userId');
  
  if (!userId) {
    // Mostrar notificación
    notyf.error('Por favor inicia sesión para acceder');
    
    // Redirigir al login
    router.navigate(['/Login']);
    return false;
  }
  
  return true;
};