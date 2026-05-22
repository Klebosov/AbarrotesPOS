import { Component, ViewChild, ElementRef, OnInit, OnDestroy, AfterViewInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { usuarios } from "../data/uss";
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  // Propiedades existentes
  uss: string = "";
  password: string = "";
  isLoading: boolean = false;
  cameraActive: boolean = false;
  modelsLoaded: boolean = false;
  detectionStatus: string = '';
  modelLoadError: string = ''; // ✅ Propiedad agregada
  
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  private stream: MediaStream | null = null;
  private detectionInterval: any = null;

  constructor(private router: Router) {}

  async ngOnInit() {
    await this.loadModels();
  }

  ngAfterViewInit() {
    this.setupCanvas();
  }

  ngOnDestroy() {
    this.stopCamera();
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
    }
  }

  async loadModels() {
  try {
    this.isLoading = true;
    this.modelLoadError = '';
    this.detectionStatus = 'Cargando modelos...';
    
    // Usar CDN de modelos
    const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
    
    console.log('Cargando modelos desde CDN:', MODEL_URL);
    
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ]);
    
    this.modelsLoaded = true;
    console.log("✅ Modelos cargados correctamente desde CDN");
    this.detectionStatus = '✅ Modelos listos';
    
  } catch(error) {
    console.error("❌ Error cargando modelos:", error);
    this.modelLoadError = `Error cargando modelos: ${error instanceof Error ? error.message : error}`;
    this.detectionStatus = '❌ Error en modelos';
    alert('⚠️ No se pudieron cargar los modelos faciales. Verifica tu conexión a internet.');
  } finally {
    this.isLoading = false;
  }
}

  setupCanvas() {
    if (this.canvas && this.video) {
      const video = this.video.nativeElement;
      const canvas = this.canvas.nativeElement;
      
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      
      const resizeObserver = new ResizeObserver(() => {
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;
      });
      
      resizeObserver.observe(video);
    }
  }

  async startCamera() {
    // Verificar si los modelos están cargados
    if (!this.modelsLoaded) {
      alert("⚠️ Los modelos faciales aún se están cargando. Espera un momento.");
      return;
    }

    try {
      if (this.stream) {
        this.stopCamera();
      }

      this.isLoading = true;
      this.detectionStatus = 'Iniciando cámara...';
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        },
        audio: false
      });
      
      this.stream = stream;
      const videoElement = this.video.nativeElement;
      videoElement.srcObject = stream;
      
      await videoElement.play();
      this.cameraActive = true;
      
      console.log("✅ Cámara iniciada");
      this.detectionStatus = 'Cámara activa - Buscando rostro...';
      
      this.startRealTimeDetection();
      
    } catch(error) {
      console.error("❌ Error iniciando cámara:", error);
      this.detectionStatus = 'Error al acceder a la cámara';
      alert('No se pudo acceder a la cámara. Verifica los permisos.');
    } finally {
      this.isLoading = false;
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      this.cameraActive = false;
      
      const videoElement = this.video.nativeElement;
      if (videoElement) {
        videoElement.srcObject = null;
      }
      
      if (this.detectionInterval) {
        clearInterval(this.detectionInterval);
        this.detectionInterval = null;
      }
      
      if (this.canvas) {
        const context = this.canvas.nativeElement.getContext('2d');
        if (context) {
          context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
        }
      }
      
      console.log("🛑 Cámara detenida");
      this.detectionStatus = 'Cámara detenida';
    }
  }

  async startRealTimeDetection() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
    }
    
    this.detectionInterval = setInterval(async () => {
      if (this.cameraActive && this.video && this.video.nativeElement.readyState === 4) {
        await this.detectFace();
      }
    }, 100);
  }

  async detectFace() {
    if (!this.modelsLoaded || !this.cameraActive) return;
    
    try {
      const videoElement = this.video.nativeElement;
      
      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) return;
      
      const detection = await faceapi
        .detectSingleFace(videoElement, new faceapi.SsdMobilenetv1Options({
          minConfidence: 0.5
        }))
        .withFaceLandmarks()
        .withFaceDescriptor()
        .withFaceExpressions();
      
      if (this.canvas && detection) {
        const canvasElement = this.canvas.nativeElement;
        const displaySize = { width: videoElement.clientWidth, height: videoElement.clientHeight };
        
        faceapi.matchDimensions(canvasElement, displaySize);
        const resizedDetection = faceapi.resizeResults(detection, displaySize);
        
        const context = canvasElement.getContext('2d');
        if (context) {
          context.clearRect(0, 0, canvasElement.width, canvasElement.height);
          faceapi.draw.drawDetections(canvasElement, [resizedDetection]);
          faceapi.draw.drawFaceLandmarks(canvasElement, [resizedDetection]);
          
          if (detection.expressions) {
            let maxExpression = '';
            let maxValue = 0;
            
            for (const [expression, value] of Object.entries(detection.expressions)) {
              if (value > maxValue) {
                maxValue = value;
                maxExpression = expression;
              }
            }
            
            if (maxExpression) {
              const expressionEmoji = this.getExpressionEmoji(maxExpression);
              this.detectionStatus = `👤 Rostro detectado - ${expressionEmoji} ${maxExpression}`;
            } else {
              this.detectionStatus = '👤 Rostro detectado';
            }
          } else {
            this.detectionStatus = '👤 Rostro detectado';
          }
        }
      } else if (this.canvas) {
        const context = this.canvas.nativeElement.getContext('2d');
        if (context) {
          context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
        }
        this.detectionStatus = '🔍 Buscando rostro...';
      }
      
    } catch(error) {
      console.error("Error en detección facial:", error);
    }
  }

  getExpressionEmoji(expression: string): string {
    const emojis: {[key: string]: string} = {
      'neutral': '😐',
      'happy': '😊',
      'sad': '😢',
      'angry': '😠',
      'fearful': '😨',
      'disgusted': '🤢',
      'surprised': '😲'
    };
    return emojis[expression] || '😐';
  }

  login() {
    const user = usuarios.find(
      u => u.uss === this.uss && u.password === this.password
    );

    if (user) {
      this.navigateByRole(user.rol);
      this.limpiar();
    } else {
      alert("❌ Nombre de usuario o contraseña incorrectos");
    }
  }

  limpiar() {
    this.uss = "";
    this.password = "";
  }

  async registerFace() {
    if (!this.modelsLoaded) {
      alert("⚠️ Los modelos faciales no están listos. Espera un momento.");
      return;
    }

    if (!this.cameraActive) {
      alert("⚠️ Por favor, activa la cámara primero");
      return;
    }

    if (!this.uss) {
      alert("⚠️ Por favor, ingresa tu nombre de usuario primero");
      return;
    }

    try {
      this.isLoading = true;
      this.detectionStatus = '📸 Capturando rostro...';
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const detection = await faceapi
        .detectSingleFace(this.video.nativeElement, new faceapi.SsdMobilenetv1Options({
          minConfidence: 0.6
        }))
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (!detection) {
        alert("❌ No se detectó ningún rostro. Asegúrate de estar bien iluminado y mirando directamente a la cámara.");
        this.detectionStatus = 'No se detectó rostro';
        return;
      }
      
      const user = usuarios.find(u => u.uss === this.uss);
      
      if (!user) {
        alert(`❌ Usuario "${this.uss}" no encontrado. Verifica tu nombre de usuario.`);
        this.detectionStatus = 'Usuario no encontrado';
        return;
      }
      
      user.faceDescriptor = Array.from(detection.descriptor);
      
      console.log("✅ Rostro registrado exitosamente:", user.uss);
      this.detectionStatus = '✅ Rostro registrado exitosamente';
      alert(`✅ Rostro registrado correctamente para el usuario: ${user.uss}`);
      
    } catch(error) {
      console.error("❌ Error registrando rostro:", error);
      this.detectionStatus = 'Error al registrar rostro';
      alert("Error al registrar el rostro. Intenta nuevamente.");
    } finally {
      this.isLoading = false;
      setTimeout(() => {
        if (this.detectionStatus === '✅ Rostro registrado exitosamente') {
          this.detectionStatus = 'Cámara activa';
        }
      }, 2000);
    }
  }

  async loginFace() {
    if (!this.modelsLoaded) {
      alert("⚠️ Los modelos faciales no están listos. Espera un momento.");
      return;
    }

    if (!this.cameraActive) {
      alert("⚠️ Por favor, activa la cámara primero");
      return;
    }

    try {
      this.isLoading = true;
      this.detectionStatus = '🔍 Reconociendo rostro...';
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const detection = await faceapi
        .detectSingleFace(this.video.nativeElement, new faceapi.SsdMobilenetv1Options({
          minConfidence: 0.6
        }))
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (!detection) {
        alert("❌ No se detectó ningún rostro. Asegúrate de estar mirando directamente a la cámara.");
        this.detectionStatus = 'No se detectó rostro';
        return;
      }
      
      const descriptor = detection.descriptor;
      let usuarioEncontrado = null;
      let mejorDistancia = Infinity;
      
      for (let user of usuarios) {
        if (!user.faceDescriptor || user.faceDescriptor.length === 0) continue;
        
        const distancia = faceapi.euclideanDistance(
          descriptor,
          new Float32Array(user.faceDescriptor)
        );
        
        console.log(`📊 Distancia con ${user.uss}: ${distancia}`);
        
        if (distancia < 0.5 && distancia < mejorDistancia) {
          mejorDistancia = distancia;
          usuarioEncontrado = user;
        }
      }
      
      if (usuarioEncontrado) {
        console.log(`✅ Rostro reconocido: ${usuarioEncontrado.uss} (distancia: ${mejorDistancia})`);
        this.detectionStatus = `✅ Bienvenido ${usuarioEncontrado.uss}`;
        alert(`✅ ¡Bienvenido ${usuarioEncontrado.uss}!`);
        
        setTimeout(() => {
          this.navigateByRole(usuarioEncontrado!.rol);
        }, 1000);
        
      } else {
        alert("❌ Rostro no reconocido. ¿Ya has registrado tu rostro?");
        this.detectionStatus = 'Rostro no reconocido';
      }
      
    } catch(error) {
      console.error("❌ Error en login facial:", error);
      this.detectionStatus = 'Error en reconocimiento';
      alert("Error durante el reconocimiento facial. Intenta nuevamente.");
    } finally {
      this.isLoading = false;
    }
  }

  navigateByRole(rol: string) {
    this.stopCamera();
    if (rol === "admin") {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/principal']);
    }
  }
}