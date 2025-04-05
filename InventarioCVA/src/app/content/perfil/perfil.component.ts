import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgIf],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      nombre: ['', Validators.required],
      user: ['', [Validators.required, Validators.minLength(4)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value 
      ? null 
      : { mismatch: true };
  }

  loadProfile(): void {
    const userId = sessionStorage.getItem('userId');
    if (!userId) return;

    this.authService.getUserProfile(userId).subscribe({
      next: (user: any) => {
        this.profileForm.patchValue({
          nombre: user.nombre,
          user: user.user
        });
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar el perfil';
        console.error(err);
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;

    this.loading = true;
    const userId = sessionStorage.getItem('userId');
    if (!userId) return;

    this.authService.updateProfile(userId, this.profileForm.value).subscribe({
      next: (response) => {
        this.successMessage = 'Perfil actualizado correctamente';
        this.loading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = 'Error al actualizar el perfil';
        this.loading = false;
        console.error(err);
      }
    });
  }

  updatePassword(): void {
    if (this.passwordForm.invalid) return;

    this.loading = true;
    const userId = sessionStorage.getItem('userId');
    if (!userId) return;

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.updatePassword(userId, currentPassword, newPassword).subscribe({
      next: (response) => {
        this.successMessage = 'Contraseña actualizada correctamente';
        this.passwordForm.reset();
        this.loading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Error al actualizar la contraseña';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
