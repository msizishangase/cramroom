import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { TABLES } from '../../../core/constants/tables.const';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService).client;

  readonly currentUserId = signal<string | null>(null);

  async signUp(email: string, password: string): Promise<void> {
    const { error } = await this.supabase.auth.signUp({ email, password });
    if (error) throw error;
  }

  async verifyOtp(email: string, token: string): Promise<void> {
    const { data, error } = await this.supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });
    if (error) throw error;

    const userId = data.user?.id;
    if (!userId) throw new Error('Verification succeeded but no user was returned.');

    this.currentUserId.set(userId);

    // Bare profile row — the profile-completion feature fills in the rest later
    const { error: profileError } = await this.supabase
      .from(TABLES.PROFILES)
      .insert({ id: userId });
    if (profileError) throw profileError;
  }

  async logIn(email: string, password: string): Promise<void> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.currentUserId.set(data.user?.id ?? null);
  }

  async logOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this.currentUserId.set(null);
  }
}
