import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { InitialsPipe } from '@shared/pipes/initials.pipe';

@Component({
  selector: 'app-product-logo',
  standalone: true,
  imports: [InitialsPipe],
  templateUrl: './product-logo.component.html',
  styleUrl: './product-logo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductLogoComponent {
  readonly src = input.required<string>();
  readonly name = input.required<string>();

  /** Remembers which src failed, so a new src automatically gets a fresh attempt. */
  private readonly failedSrc = signal<string | null>(null);
  protected readonly showImage = computed(() => !!this.src() && this.src() !== this.failedSrc());

  protected onError(): void {
    this.failedSrc.set(this.src());
  }
}
