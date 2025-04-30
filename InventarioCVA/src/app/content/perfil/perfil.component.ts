import { DatePipe, DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgIf, NgClass],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

    // Variables para controlar las alertas
    showAlert = false;
    alertType: 'success' | 'error' | 'info' = 'success';
    alertTitle = '';
    alertMessage = '';
  

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
    // Método para mostrar alertas
    private showAlertMessage(type: 'success' | 'error' | 'info', title: string, message: string, duration: number = 3000) {
      this.alertType = type;
      this.alertTitle = title;
      this.alertMessage = message;
      this.showAlert = true;
      
      setTimeout(() => {
        this.showAlert = false;
      }, duration);
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
    if (this.profileForm.invalid) {
      this.showAlertMessage('error', 'Error', 'Por favor completa el formulario correctamente');
      return;
    }

    this.loading = true;
    const userId = sessionStorage.getItem('userId');
    if (!userId) return;

    this.authService.updateProfile(userId, this.profileForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        this.showAlertMessage('success', 'Éxito', 'Perfil actualizado correctamente');
      },
      error: (err) => {
        this.loading = false;
        this.showAlertMessage('error', 'Error', 'Error al actualizar el perfil');
        console.error(err);
      }
    });
  }

  updatePassword(): void {
    if (this.passwordForm.invalid) {
      if (this.passwordForm.hasError('mismatch')) {
        this.showAlertMessage('error', 'Error', 'Las contraseñas no coinciden');
      } else {
        this.showAlertMessage('error', 'Error', 'Por favor completa el formulario correctamente');
      }
      return;
    }

    this.loading = true;
    const userId = sessionStorage.getItem('userId');
    if (!userId) return;

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.updatePassword(userId, currentPassword, newPassword).subscribe({
      next: (response) => {
        this.loading = false;
        this.passwordForm.reset();
        this.showAlertMessage('success', 'Éxito', 'Contraseña actualizada correctamente');
      },
      error: (err) => {
        this.loading = false;
        const errorMsg = err.error?.message || 'Error al actualizar la contraseña';
        this.showAlertMessage('error', 'Error', errorMsg);
        console.error(err);
      }
    });
  }
}
