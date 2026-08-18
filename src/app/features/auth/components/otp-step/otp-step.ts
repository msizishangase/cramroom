import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren,
  computed,
  effect,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-otp-step',
  standalone: true,
  templateUrl: './otp-step.html',
  styleUrl: './otp-step.scss',
})
export class OtpStep {
  @Input({ required: true }) email!: string;
  @Input() loading = false;
  @Output() submitted = new EventEmitter<string>();

  @ViewChildren('digitInput') private digitInputs!: QueryList<ElementRef<HTMLInputElement>>;

  readonly digits = signal<string[]>(['', '', '', '', '', '']);
  readonly code = computed(() => this.digits().join(''));
  readonly touched = signal(false);

  private lastAutoSubmitted = '';

  constructor() {
    // Auto-verify the instant all 6 digits are in — but only once per completed code,
    // and never while a verification is already in flight.
    effect(() => {
      const value = this.code();
      if (value.length === 6 && value !== this.lastAutoSubmitted && !this.loading) {
        this.lastAutoSubmitted = value;
        this.submitted.emit(value);
      }
    });
  }

  onDigitInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '').slice(-1);

    const next = [...this.digits()];
    next[index] = value;
    this.digits.set(next);
    this.touched.set(true);

    if (value && index < 5) {
      this.digitInputs.get(index + 1)?.nativeElement.focus();
    }
  }

  onKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.digits()[index] && index > 0) {
      this.digitInputs.get(index - 1)?.nativeElement.focus();
    }
  }

  onPaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData
      ?.getData('text')
      .replace(/[^0-9]/g, '')
      .slice(0, 6);
    if (!pasted) return;
    event.preventDefault();

    const next = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    this.digits.set(next);
    this.touched.set(true);

    this.digitInputs.get(Math.min(pasted.length, 5))?.nativeElement.focus();
  }

  onSubmit(): void {
    if (this.code().length !== 6) {
      this.touched.set(true);
      return;
    }
    this.lastAutoSubmitted = this.code();
    this.submitted.emit(this.code());
  }
}
