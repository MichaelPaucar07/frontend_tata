import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotifyService } from '@core/service/ui/notify/notify.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  protected readonly notify = inject(NotifyService);
}
