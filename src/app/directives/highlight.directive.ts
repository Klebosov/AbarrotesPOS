import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true 
})
export class HighlightDirective {

  @HostBinding('style.transition') transition = 'all 0.3s ease';
  @HostBinding('style.transform') transform = 'scale(1)';
  
 
  @HostBinding('class.shadow-2xl') shadow = false;
  @HostBinding('class.rounded-xl') rounded = false;
  @HostBinding('class.border-red-500') borderActive = false;

  @HostListener('mouseenter') onMouseEnter() {
    this.transform = 'scale(1.05)';
    this.shadow = true;
    this.rounded = true;
    this.borderActive = true;
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.transform = 'scale(1)';
    this.shadow = false;
    this.rounded = false;
    this.borderActive = false;
  }
}
