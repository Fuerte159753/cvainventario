import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import Swal from 'sweetalert2';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

@Component({
  selector: 'app-existencia',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgFor, NgIf, DatePipe, DecimalPipe],
  templateUrl: './existencia.component.html',
  styleUrl: './existencia.component.css'
})
export class ExistenciaComponent {
  productos: any[] = [];
  proveedores: any[] = [];

  showScanner = false;
  scannerStatus: 'loading' | 'scanning' | 'success' | 'error' | 'idle' = 'idle';
  manualBarcode = '';
  private mediaStream: MediaStream | null = null;
  @ViewChild('scannerVideo') scannerVideo!: ElementRef<HTMLVideoElement>;
  
  // Tipos de productos predefinidos
  tiposProducto: string[] = [
    'Electrónico', 
    'Alimenticio', 
    'Farmacéutico', 
    'Textil', 
    'Hogar', 
    'Oficina', 
    'Limpieza',
    'Herramientas',
    'Jardineria',
    'Otro'
  ];

  // Estado del modal y formulario
  isProductoModalOpen = false;
  editingProducto: any = null;
  isProductoAccordionOpen: {[key: number]: boolean} = {};
  productoForm: FormGroup;

  // Configuración de notificaciones
  notyf = new Notyf({
    duration: 3000,
    position: { x: 'right', y: 'top' },
    types: [
      {
        type: 'success',
        background: '#6b46c1',
        icon: '<i class="bi bi-check-circle-fill"></i>'
      },
      {
        type: 'error',
        background: '#e53e3e',
        icon: '<i class="bi bi-exclamation-triangle-fill"></i>'
      },
      {
        type: 'warning',
        background: '#ed8936',
        icon: '<i class="bi bi-exclamation-triangle-fill"></i>'
      }
    ]
  });

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    // Inicialización del formulario con validaciones
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      tipo: ['', Validators.required],
      descripcion: ['', Validators.maxLength(500)],
      codigo_barras: ['', [Validators.maxLength(50)]],
      cantidad: [1, [Validators.required, Validators.min(1), Validators.max(9999)]],
      precio_unitario: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
      proveedor_id: ['', Validators.required],
      fecha_llegada: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadProductos();
    this.loadProveedores();
  }
  ngOnDestroy() {
    this.closeScanner();
  }

  /**
   * Carga la lista de productos desde el servidor
   */
  loadProductos(): void {
    this.authService.getProductos().subscribe({
      next: (data) => {
        this.productos = data.map(p => ({
          ...p,
          // Formatear fechas para visualización
          fecha_llegada: p.fecha_llegada ? new Date(p.fecha_llegada) : null,
        }));
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.notyf.error('Error al cargar los productos');
      }
    });
  }

  /**
   * Carga la lista de proveedores para el select
   */
  loadProveedores(): void {
    this.authService.getProveedores().subscribe({
      next: (data) => {
        this.proveedores = data;
      },
      error: (err) => {
        console.error('Error al cargar proveedores:', err);
        this.notyf.error('Error al cargar los proveedores');
      }
    });
  }

  /**
   * Abre el modal para agregar un nuevo producto
   */
  openProductoModal(): void {
    this.editingProducto = null;
    this.productoForm.reset({
      cantidad: 1,
      precio_unitario: 0,
      fecha_llegada: this.formatDate(new Date())
    });
    this.isProductoModalOpen = true;
  }

  /**
   * Cierra el modal de producto
   */
  closeProductoModal(): void {
    this.isProductoModalOpen = false;
  }

  /**
   * Abre el modal para editar un producto existente
   * @param producto El producto a editar
   */
  editProducto(producto: any): void {
    this.editingProducto = producto;
    this.productoForm.patchValue({
      ...producto,
      fecha_llegada: this.formatDate(producto.fecha_llegada),
      proveedor_id: producto.proveedor_id // Campo bloqueado en la vista
    });
    this.isProductoModalOpen = true;
  }

  /**
   * Guarda el producto (creación o actualización)
   */
  saveProducto(): void {
    if (this.productoForm.invalid) {
      this.markFormGroupTouched(this.productoForm);
      this.notyf.error('Por favor complete todos los campos requeridos');
      return;
    }

    const productoData = {
      ...this.productoForm.value,
      // Asegurar que cantidad y precio sean números
      cantidad: Number(this.productoForm.value.cantidad),
      precio_unitario: Number(this.productoForm.value.precio_unitario)
    };

    if (this.editingProducto) {
      this.updateProducto(productoData);
    } else {
      this.createProducto(productoData);
    }
  }

  /**
   * Crea un nuevo producto
   * @param productoData Datos del producto a crear
   */
  private createProducto(productoData: any): void {
    this.authService.createProducto(productoData).subscribe({
      next: () => {
        this.notyf.success('Producto creado exitosamente');
        this.loadProductos();
        this.closeProductoModal();
      },
      error: (err) => {
        console.error('Error al crear producto:', err);
        this.handleError(err, 'crear');
      }
    });
  }

  /**
   * Actualiza un producto existente
   * @param productoData Datos actualizados del producto
   */
  private updateProducto(productoData: any): void {
    this.authService.updateProducto(this.editingProducto.id, productoData).subscribe({
      next: () => {
        this.notyf.success('Producto actualizado exitosamente');
        this.loadProductos();
        this.closeProductoModal();
      },
      error: (err) => {
        console.error('Error al actualizar producto:', err);
        this.handleError(err, 'actualizar');
      }
    });
  }

  /**
   * Maneja errores de las operaciones CRUD
   * @param error El error ocurrido
   * @param action La acción que se intentaba realizar
   */
  private handleError(error: any, action: string): void {
    let errorMessage = `Error al ${action} el producto`;
    
    if (error.error && error.error.error) {
      errorMessage += `: ${error.error.error}`;
    } else if (error.message) {
      errorMessage += `: ${error.message}`;
    }

    this.notyf.error(errorMessage);
  }

  /**
   * Elimina un producto con confirmación
   * @param producto El producto a eliminar
   */
  async deleteProducto(producto: any): Promise<void> {
    const result = await Swal.fire({
      title: 'Confirmar eliminación',
      html: `
        <div class="text-left">
          <p>¿Está seguro de eliminar el siguiente producto?</p>
          <div class="mt-2 p-2 bg-gray-100 rounded">
            <p class="font-bold">${producto.nombre}</p>
            <p class="text-sm">Código: ${producto.codigo_barras}</p>
            <p class="text-sm">Proveedor: ${producto.proveedor_empresa}</p>
          </div>
          <p class="mt-2 text-red-500 text-sm">Esta acción no se puede deshacer</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b46c1',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-lg'
      }
    });

    if (result.isConfirmed) {
      try {
        await this.authService.deleteProducto(producto.id).toPromise();
        this.productos = this.productos.filter(p => p.id !== producto.id);
        this.notyf.success('Producto eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        this.notyf.error('Error al eliminar el producto');
      }
    }
  }

  /**
   * Alterna la visualización del acordeón en móviles
   * @param productoId ID del producto
   */
  toggleProductoAccordion(productoId: number): void {
    this.isProductoAccordionOpen[productoId] = !this.isProductoAccordionOpen[productoId];
  }

  /**
   * Formatea una fecha para el input type="date"
   * @param date Fecha a formatear
   * @returns Fecha en formato YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  /**
   * Marca todos los campos del formulario como touched para mostrar errores
   * @param formGroup Grupo de formulario a marcar
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Verifica si un campo del formulario es inválido y ha sido tocado
   * @param field Nombre del campo
   * @returns boolean
   */
  isFieldInvalid(field: string): boolean {
    const control = this.productoForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  /**
   * Obtiene el mensaje de error para un campo
   * @param field Nombre del campo
   * @returns Mensaje de error
   */
  getErrorMessage(field: string): string {
    const control = this.productoForm.get(field);
    
    if (!control || !control.errors) return '';
    
    if (control.hasError('required')) {
      return 'Este campo es requerido';
    } else if (control.hasError('maxlength')) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    } else if (control.hasError('min')) {
      return `El valor mínimo es ${control.errors['min'].min}`;
    } else if (control.hasError('max')) {
      return `El valor máximo es ${control.errors['max'].max}`;
    } else if (control.hasError('email')) {
      return 'Email inválido';
    }
    
    return 'Valor inválido';
  }

  // Método para abrir el escáner
  async openScanner() {
    this.showScanner = true;
    this.scannerStatus = 'loading';
    this.manualBarcode = '';
  
    // 1. Verificar compatibilidad
    if (!this.checkBrowserCompatibility()) return;
  
    // 3. Intentar acceder a la cámara
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
  
      if (this.scannerVideo?.nativeElement) {
        this.scannerVideo.nativeElement.srcObject = this.mediaStream;
        await this.scannerVideo.nativeElement.play();
        this.scannerStatus = 'scanning';
        this.startBarcodeDetection();
      }
    } catch (error) {
      this.handleCameraError(error);
    }
  }
  
  private checkBrowserCompatibility(): boolean {
    const isCompatible = 'mediaDevices' in navigator && 
                        'getUserMedia' in navigator.mediaDevices &&
                        'BarcodeDetector' in window;
    
    if (!isCompatible) {
      this.scannerStatus = 'error';
      alert('Tu navegador no soporta el escaneo de códigos de barras. Prueba con Chrome en Android o iOS.');
    }
    
    return isCompatible;
  }
  
  private handleCameraError(error: any) {
    console.error('Error de cámara:', error);
    this.scannerStatus = 'error';
    
    // Mapear errores conocidos a mensajes amigables
    const errorMessages = {
      'NotFoundError': 'No se encontró ninguna cámara disponible',
      'NotAllowedError': 'Permiso para usar la cámara denegado',
      'NotReadableError': 'La cámara está siendo usada por otra aplicación',
      'OverconstrainedError': 'No se puede satisfacer la configuración de la cámara',
      'default': 'No se pudo acceder a la cámara. Error: ' + error.message
    };
  }

// Método simplificado de detección (implementación real dependerá de la API usada)
private startBarcodeDetection() {
  const detector = new (window as any).BarcodeDetector({
    formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_39', 'code_128']
  });
  
  const detectInterval = setInterval(async () => {
    if (this.scannerStatus !== 'scanning') {
      clearInterval(detectInterval);
      return;
    }
    
    try {
      const barcodes = await detector.detect(this.scannerVideo.nativeElement);
      if (barcodes.length > 0) {
        this.scannerStatus = 'success';
        this.productoForm.patchValue({ codigo_barras: barcodes[0].rawValue });
        setTimeout(() => this.closeScanner(), 1000); // Cierra automáticamente después de 1 segundo
        clearInterval(detectInterval);
      }
    } catch (error) {
      console.error('Error en detección:', error);
    }
  }, 500);
}

// Método para usar código manual
useManualBarcode() {
  if (this.manualBarcode) {
    this.productoForm.patchValue({ codigo_barras: this.manualBarcode });
    this.scannerStatus = 'success';
    setTimeout(() => this.closeScanner(), 1000);
  }
}

// Método para cerrar el escáner
closeScanner() {
  if (this.mediaStream) {
    this.mediaStream.getTracks().forEach(track => track.stop());
    this.mediaStream = null;
  }
  this.showScanner = false;
  this.scannerStatus = 'idle';
}
}
