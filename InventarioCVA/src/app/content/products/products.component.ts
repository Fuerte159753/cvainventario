import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule,FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-products',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  isAccordionOpen: {[key: number]: boolean} = {};
  isModalOpen = false;
  selectedImage: string | ArrayBuffer | null = null;
  agregarmueble: FormGroup;
  imageSelected = false;
  maxEvidences = 5;
  furnitureItems: any[] = [];
  baseUrl='http://192.168.15.93:3000';
  //baseUrl = 'http://localhost:3000';
  //baseUrl = 'https://cvainventario.onrender.com';
    isModalOpenima = false;
    selectedEvidence: any = null;
    currentImageIndex = 0;
  searchForm: FormGroup;
  originalFurnitureItems: any[] = [];
  searchTerm$ = new Subject<string>();


  videoStream: MediaStream | null = null;
  videoElement: HTMLVideoElement | null = null;
  canvasElement: HTMLCanvasElement | null = null;

  constructor(private fb: FormBuilder, private service:AuthService) {
    this.agregarmueble = this.fb.group({
      type: ['', Validators.required],
      numentrega: ['', Validators.required],
      description: ['', Validators.required],
      evidences: this.fb.array([this.createEvidence()])
    });
    this.searchForm = this.fb.group({
      searchTerm: [''],
      searchType: ['all']
    });
  }
  ngOnInit(): void {
    this.loadFurniture();
    this.searchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  loadFurniture(): void {
    this.service.getFurnitureWithImages().subscribe({
      next: (data) => {
        this.furnitureItems = data.map(item => ({
          ...item,
          image: item.evidencias.length > 0 ? 
                 item.evidencias[0].imagen : 
                 'assets/default-furniture.png',
          // Agrega una propiedad de fecha formateada si no existe
          formattedDate: item.date ? new Date(item.date).toLocaleDateString() : 'Sin fecha'
        }));
        this.originalFurnitureItems = [...this.furnitureItems];
      },
      error: (err) => console.error('Error loading furniture:', err)
    });
  }

  toggleAccordion(id: number): void {
    this.isAccordionOpen[id] = !this.isAccordionOpen[id];
  }
  get evidences() {
    return this.agregarmueble.get('evidences') as FormArray;
  }

  createEvidence() {
    return this.fb.group({
      image: ['', Validators.required],
      evidenceDescription: ['', Validators.required]
    });
  }

  addEvidence() {
    if (this.evidences.length < this.maxEvidences) {
      this.evidences.push(this.createEvidence());
    }
  }

  removeEvidence(index: number) {
    this.evidences.removeAt(index);
  }

  selectImage(index: number) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.evidences.at(index).patchValue({
            image: reader.result
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  takePhoto(index: number): void {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Tu navegador no soporta el acceso a la cámara');
      return;
    }
  
    // Crear elementos si no existen
    if (!this.videoElement) {
      this.videoElement = document.createElement('video');
      document.body.appendChild(this.videoElement);
    }
  
    // Detener cualquier stream anterior
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
    }
  
    // Crear modal para la vista previa
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.8);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    `;
  
    // Configurar video
    const video = document.createElement('video');
    video.style.cssText = `
      width: 90%;
      max-width: 500px;
      border-radius: 8px;
    `;
    video.autoplay = true;
  
    // Botón para capturar foto
    const captureBtn = document.createElement('button');
    captureBtn.textContent = 'Tomar Foto';
    captureBtn.style.cssText = `
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;
  
    // Botón para cancelar
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.cssText = `
      margin-top: 10px;
      padding: 10px 20px;
      background-color: #ef4444;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;
  
    // Configurar cámara
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment', // Usar cámara trasera
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    }).then(stream => {
      this.videoStream = stream;
      this.videoElement!.srcObject = stream;
      video.srcObject = stream;
  
      // Mostrar modal
      modal.appendChild(video);
      modal.appendChild(captureBtn);
      modal.appendChild(cancelBtn);
      document.body.appendChild(modal);
  
      // Capturar foto
      captureBtn.onclick = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          // Asignar la foto al formulario
          this.evidences.at(index).patchValue({
            image: imageDataUrl
          });
        }
  
        // Limpiar
        this.cleanupCamera();
        document.body.removeChild(modal);
      };
  
      // Cancelar
      cancelBtn.onclick = () => {
        this.cleanupCamera();
        document.body.removeChild(modal);
      };
  
    }).catch(error => {
      console.error('Error al acceder a la cámara:', error);
      alert(`No se pudo acceder a la cámara: ${error.message}`);
    });
  }
  

  private cleanupCamera(): void {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    // Limpiar el FormArray de evidencias
    this.evidences.clear();
    
    // Agregar una evidencia vacía (número 1)
    this.addEvidence();
    
    // Resetear el formulario principal
    this.agregarmueble.reset();
    
    // Cerrar el modal
    this.isModalOpen = false;
    
    // Limpiar recursos de cámara si existen
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    
    // Limpiar el elemento de video si existe
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement.remove();
      this.videoElement = null;
    }
  }
  nextId= 0;
  saveFurniture() {
    if (this.agregarmueble.invalid) return;
    this.service.getNextFurnitureId().subscribe(response => {
      this.nextId = response.nextId;
      const timestamp = new Date().toISOString().replace(/[-:T]/g, '_').split('.')[0];
      const furnitureData = {
        idmueble: this.nextId,
        type: this.agregarmueble.value.type,
        description: this.agregarmueble.value.description,
        evidences: this.agregarmueble.value.evidences.map((evidence: any, index: number) => {
          const filename = `${timestamp}_${this.nextId}_${index + 1}_de_${this.agregarmueble.value.evidences.length}.jpg`;
          return {
            image: evidence.image,
            filename,
            evidenceDescription: evidence.evidenceDescription
          };
        })
      };
      this.service.addFurniture(furnitureData).subscribe({
        next: (response) => {
          console.log('Mueble guardado correctamente:', response);
          this.loadFurniture();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al guardar mueble:', error);
        }
      });
  
    }, error => {
      console.error('Error al obtener el ID del mueble:', error);
    });
  }

  openEvidenceModal(evidencias: any[], index: number = 0) {
    this.selectedEvidence = {
      images: evidencias,
      currentIndex: index
    };
    this.isModalOpenima = true;
  }

  // Método para navegar entre imágenes en el modal
  navigateImage(direction: 'prev' | 'next') {
    if (!this.selectedEvidence) return;
    
    const { images, currentIndex } = this.selectedEvidence;
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + images.length) % images.length 
      : (currentIndex + 1) % images.length;
    
    this.selectedEvidence = {
      ...this.selectedEvidence,
      currentIndex: newIndex
    };
  }

  // Método para cerrar el modal
  closeModalima() {
    this.isModalOpenima = false;
    this.selectedEvidence = null;
  }
    // Método para aplicar los filtros
    applyFilters(): void {
      const searchTerm = this.searchForm.get('searchTerm')?.value?.toLowerCase().trim();
      const searchType = this.searchForm.get('searchType')?.value;
    
      // Si no hay término de búsqueda, mostrar todos los items
      if (!searchTerm) {
        this.furnitureItems = [...this.originalFurnitureItems];
        return;
      }
    
      this.furnitureItems = this.originalFurnitureItems.filter(item => {
        // Verifica si el item tiene las propiedades necesarias
        const itemId = item.id?.toString() || '';
        const itemType = item.type?.toLowerCase() || '';
        const itemDate = item.date ? new Date(item.date).toLocaleDateString().toLowerCase() : 
                       item.formattedDate?.toLowerCase() || '';
    
        switch (searchType) {
          case 'id':
            return itemId.includes(searchTerm);
          case 'type':
            return itemType.includes(searchTerm);
          case 'date':
            return itemDate.includes(searchTerm);
          default: // 'all'
            return (
              itemId.includes(searchTerm) ||
              itemType.includes(searchTerm) ||
              itemDate.includes(searchTerm)
            );
        }
      });
    }
  
    // Método para manejar cambios en la búsqueda
    onSearchChange(): void {
      this.searchTerm$.next(this.searchForm.get('searchTerm')?.value);
    }
}
