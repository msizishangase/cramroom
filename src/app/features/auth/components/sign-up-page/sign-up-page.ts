import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CredentialsStep } from '../credentials-step/credentials-step';
import { OtpStep } from '../otp-step/otp-step';
import { StepIndicator } from '../../../../shared/components/step-indicator/step-indicator';
import { ROUTES } from '../../../../core/constants/routes.const';
import { TicketDemo } from '../../../../shared/components/ticket-demo/ticket-demo';

type SignUpStep = 'credentials' | 'otp';

@Component({
  selector: 'app-sign-up-page',
  standalone: true,
  imports: [CredentialsStep, OtpStep, StepIndicator, TicketDemo],
  templateUrl: './sign-up-page.html',
})
export class SignUpPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly step = signal<SignUpStep>('credentials');
  readonly email = signal('');
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  async onCredentialsSubmitted(value: { email: string; password: string }): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      await this.authService.signUp(value.email, value.password);
      this.email.set(value.email);
      this.step.set('otp');
    } catch {
      this.errorMessage.set('Could not create your account — check the email and try again.');
    } finally {
      this.loading.set(false);
    }
  }

  async onOtpSubmitted(code: string): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      await this.authService.verifyOtp(this.email(), code);
      this.router.navigateByUrl(ROUTES.dashboard);
    } catch {
      this.errorMessage.set("That code didn't work — check your inbox and try again.");
    } finally {
      this.loading.set(false);
    }
  }
}
