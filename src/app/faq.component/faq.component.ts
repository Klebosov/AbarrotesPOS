import { Component, ViewChild, ElementRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-faq-component',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './faq.component.html', 
  styleUrl: './faq.component.css'       
})
export class FAQComponent {          
  @ViewChild('respuesta1') r1!: ElementRef;
  @ViewChild('respuesta2') r2!: ElementRef;
  @ViewChild('respuesta3') r3!: ElementRef;
  @ViewChild('respuesta4') r4!: ElementRef;
  @ViewChild('respuesta5') r5!: ElementRef;
  @ViewChild('respuesta6') r6!: ElementRef;
  @ViewChild('respuesta7') r7!: ElementRef;
  toggle(respuesta: HTMLElement) {
    respuesta.classList.toggle('hidden');
  }

  clicPregunta1() {
    this.toggle(this.r1.nativeElement);
  }

  clicPregunta2() {
    this.toggle(this.r2.nativeElement);
  }

   clicPregunta3() {
    this.toggle(this.r3.nativeElement);
  }

   clicPregunta4() {
    this.toggle(this.r4.nativeElement);
  }

  clicPregunta5() {
    this.toggle(this.r5.nativeElement);
  }

  clicPregunta6() {
    this.toggle(this.r6.nativeElement);
  }

  clicPregunta7() {
    this.toggle(this.r7.nativeElement);
  }
}