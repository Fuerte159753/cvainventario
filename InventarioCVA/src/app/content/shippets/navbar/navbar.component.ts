import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HostListener } from '@angular/core';
import { Notyf } from 'notyf';
import { Router } from '@angular/router';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgClass, RouterLink, NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isMenuOpen = false; 
  constructor(private router: Router) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  isMenuOpenuser = false;

  // Alternar visibilidad del menú
  toggleMenuuser() {
    this.isMenuOpenuser = !this.isMenuOpenuser;
  }

  // Cerrar menú al hacer clic fuera
  @HostListener('document:click', ['$event'])
  closeMenu(event: Event) {
    if (!(event.target as Element).closest('.flex-shrink-0')) {
      this.isMenuOpenuser = false;
      //this.isMenuOpen = false
    }
  }
  private notyf = new Notyf();
  logout(): void {
    sessionStorage.removeItem('userId');
    this.notyf.success('Sesión cerrada correctamente');
    this.router.navigate(['/Login']);
  }
}
