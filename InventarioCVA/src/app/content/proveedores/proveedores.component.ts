import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import Swal from 'sweetalert2';
import { Notyf } from 'notyf';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgFor, NgIf],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.css'
})
export class ProveedoresComponent {
  proveedores: any[] = [];
  isProveedorModalOpen = false;
  editingProveedor: any = null;
  isProveedorAccordionOpen: {[key: number]: boolean} = {};
  proveedorForm: FormGroup;
  notyf = new Notyf({
    duration: 3000,
    position: { x: 'right', y: 'top' },
    types: [
      {
        type: 'success',
        background: '#38a169',
        icon: '<i class="bi bi-check-circle-fill"></i>'
      },
      {
        type: 'error',
        background: '#e53e3e',
        icon: '<i class="bi bi-exclamation-triangle-fill"></i>'
      }
    ]
  });

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.proveedorForm = this.fb.group({
      empresa: ['', Validators.required],
      nombre: ['', Validators.required],
      rfc: [''],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      productos: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProveedores();
  }

  loadProveedores(): void {
    this.authService.getProveedores().subscribe({
      next: (data) => {
        this.proveedores = data.map(p => ({
          ...p,
          productos: p.productos ? p.productos.split(',') : []
        }));
      },
      error: (err) => {
        console.error('Error al cargar proveedores:', err);
        this.notyf.error('Error al cargar proveedores');
      }
    });
  }

  openProveedorModal(): void {
    this.editingProveedor = null;
    this.proveedorForm.reset();
    this.isProveedorModalOpen = true;
  }

  closeProveedorModal(): void {
    this.isProveedorModalOpen = false;
  }

  editProveedor(proveedor: any): void {
    this.editingProveedor = proveedor;
    this.proveedorForm.patchValue({
      empresa: proveedor.empresa,
      nombre: proveedor.nombre,
      rfc: proveedor.rfc,
      email: proveedor.email,
      telefono: proveedor.telefono,
      productos: proveedor.productos.join(', ')
    });
    this.isProveedorModalOpen = true;
  }

  saveProveedor(): void {
    if (this.proveedorForm.invalid) {
      this.notyf.error('Por favor complete todos los campos requeridos');
      return;
    }

    const proveedorData = {
      ...this.proveedorForm.value,
      productos: this.proveedorForm.value.productos
    };

    if (this.editingProveedor) {
      this.authService.updateProveedor(this.editingProveedor.id, proveedorData).subscribe({
        next: () => {
          this.notyf.success('Proveedor actualizado con éxito');
          this.loadProveedores();
          this.closeProveedorModal();
        },
        error: (err) => {
          console.error('Error al actualizar proveedor:', err);
          this.notyf.error('Error al actualizar proveedor');
        }
      });
    } else {
      this.authService.createProveedor(proveedorData).subscribe({
        next: () => {
          this.notyf.success('Proveedor agregado con éxito');
          this.loadProveedores();
          this.closeProveedorModal();
        },
        error: (err) => {
          console.error('Error al crear proveedor:', err);
          this.notyf.error('Error al crear proveedor');
        }
      });
    }
  }

  async deleteProveedor(proveedor: any): Promise<void> {
    const result = await Swal.fire({
      title: '¿Eliminar proveedor?',
      html: `<p>Está a punto de eliminar a <strong>${proveedor.empresa}</strong></p>
             <p class="text-red-500">Esta acción no se puede deshacer</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      backdrop: `
        rgba(0,0,0,0.7)
        url("/assets/trash-icon.gif")
        center top
        no-repeat
      `,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });

    if (result.isConfirmed) {
      try {
        await this.authService.deleteProveedor(proveedor.id).toPromise();
        this.proveedores = this.proveedores.filter(p => p.id !== proveedor.id);
        this.notyf.success('Proveedor eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        this.notyf.error('Error al eliminar proveedor');
      }
    }
  }

  toggleProveedorAccordion(proveedorId: number): void {
    this.isProveedorAccordionOpen[proveedorId] = !this.isProveedorAccordionOpen[proveedorId];
  }
}
