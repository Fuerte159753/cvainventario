import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import Swal from 'sweetalert2';
import { Notyf } from 'notyf';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgFor, NgIf],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit {
  clients: any[] = [];
  isClientModalOpen = false;
  editingClient: any = null;
  isClientAccordionOpen: {[key: number]: boolean} = {};
  clientForm: FormGroup;


  constructor(private fb: FormBuilder, private service:AuthService,  private notificationService: NotificationService,) {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],  // Nuevo campo
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });
  }
  ngOnInit(): void {
    this.loadClients();
  }
  loadClients(): void {
    this.service.getClients().subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
        // Puedes mostrar un mensaje de error al usuario aquí
      }
    });
  }

  openClientModal(): void {
    this.editingClient = null;
    this.clientForm.reset();
    this.isClientModalOpen = true;
  }

  closeClientModal(): void {
    this.isClientModalOpen = false;
  }

  editClient(client: any): void {
    this.editingClient = client;
    this.clientForm.patchValue({
      name: client.nombre,
      lastname: client.apellidos,
      email: client.correo,
      phone: client.telefono
    });
    this.isClientModalOpen = true;
  }
  saveClient(): void {
    if (this.clientForm.invalid) return;

    const clientData = this.clientForm.value;

    if (this.editingClient) {
      // Actualizar cliente existente
      this.service.updateClient(this.editingClient.id, clientData).subscribe({
        next: () => {
          this.loadClients();
          this.closeClientModal();
          this.notyf.success('Cliente actualizado con éxito');
        },
        error: (err) => {
          console.error('Error al actualizar cliente:', err);
          this.notyf.error('ocurrio un error');
          // Mostrar mensaje de error al usuario
        }
      });
    } else {
      // Crear nuevo cliente
      this.service.createClient(clientData).subscribe({
        next: () => {
          this.loadClients();
          this.closeClientModal();
          this.notyf.success('Cliente agregado con éxito');
        },
        error: (err) => {
          console.error('Error al crear cliente:', err);
          this.notyf.error('Ocurrio un error');
          // Mostrar mensaje de error al usuario
        }
      });
    }
  }
  notyf = new Notyf({
    duration: 1500, // Duración en milisegundos
    position: {
      x: 'right',  // 'left' | 'center' | 'right'
      y: 'top'     // 'top' | 'bottom'
    }
  });
  async deleteClient(client: any): Promise<void> {
    // Confirmación con SweetAlert2
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      html: `<p>Vas a eliminar al cliente: <strong>${client.name}</strong></p>
             <p class="text-sm text-gray-500">Esta acción no se puede deshacer.</p>`,
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
        // Lógica para eliminar el cliente (usando tu servicio)
        await this.service.deleteClient(client.id).toPromise();
        
        // Actualizar la lista local
        this.clients = this.clients.filter(c => c.id !== client.id);
        
        // Notificación de éxito con Notyf
        this.notyf.success('Cliente eliminado con éxito');
  
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        
        // Notificación de error con Notyf
        this.notyf.error({
          message: 'Error al eliminar el cliente',
          duration: 5000,
          icon: '<i class="bi bi-exclamation-triangle-fill"></i>',
          dismissible: true
        });
      }
    }
  }

  toggleClientAccordion(clientId: number): void {
    this.isClientAccordionOpen[clientId] = !this.isClientAccordionOpen[clientId];
  }
}
