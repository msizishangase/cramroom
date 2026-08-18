import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-step-indicator',
  standalone: true,
  templateUrl: './step-indicator.html',
  styleUrl: './step-indicator.scss',
})
export class StepIndicator {
  @Input({ required: true }) total!: number;
  @Input({ required: true }) current!: number; // 1-based

  get steps(): number[] {
    return Array.from({ length: this.total }, (_, i) => i + 1);
  }
}
