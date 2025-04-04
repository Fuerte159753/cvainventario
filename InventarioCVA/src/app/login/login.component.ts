import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  spinner: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { 
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, completa el formulario correctamente.';
      return;
    }
  
    this.errorMessage = null;
    this.spinner = true;
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe(
        (response) => {
          setTimeout(() => {
          console.log('Respuesta del servidor:', response);
          this.router.navigate(['/Welcome']);
          this.spinner = false;
        }, 1000);
        },
        (error) => {
          setTimeout(() => {
            console.error('Error completo:', error);
            this.errorMessage = error.error?.message || 'Error al ingresar. Inténtalo de nuevo.';
            this.spinner = false;
          }, 500);
        }
      );
  }
}
