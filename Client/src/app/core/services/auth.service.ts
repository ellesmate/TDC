import {Injectable, OnDestroy} from '@angular/core';
import {environment} from 'src/environments/environment';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {delay, finalize, map, tap} from 'rxjs/operators';
import {ApplicationUser} from '../models/application-user';

interface LoginResult {
  username: string;
  role: string;
  originalUserName: string;
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private readonly apiUrl = `${environment.apiUrl}/account`;
  // @ts-ignore
  private timer: Subscription;
  private user = new BehaviorSubject<ApplicationUser|null>(null);
  user$: Observable<ApplicationUser|null> = this.user.asObservable();

  private storageEventListener(event: StorageEvent): void {
    if (event.storageArea === localStorage) {
      if (event.key === 'logout-event') {
        console.log('Logout ok.');
        this.stopTokenTimer();
        this.user.next(null);
        this.router.navigate(['login']);
      }
      if (event.key === 'login-event') {
        this.stopTokenTimer();
        this.user.next({
          username: 'kirill',
          role: 'admin',
          originalUserName: 'kirill',
        });
        // this.http.get<LoginResult>(`${this.apiUrl}/user`).subscribe((x) => {
        //   this.user.next({
        //     username: x.username,
        //     role: x.role,
        //     originalUserName: x.originalUserName,
        //   });
        // });
      }
    }
  }

  constructor(private router: Router, private http: HttpClient) {
    window.addEventListener('storage', this.storageEventListener.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.storageEventListener.bind(this));
  }

  register(username: string, email: string, password: string): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/register`, {username, email, password});
  }

  login(username: string, password: string): Observable<LoginResult> {
    return this.http
      .post<LoginResult>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        map((x) => {
          this.user.next({
            username: x.username,
            role: x.role,
            originalUserName: x.originalUserName,
          });
          this.setLocalStorage(x);
          this.startTokenTimer();
          return x;
        })
      );
  }

  logout(): void {
    this.http
      .post<unknown>(`${this.apiUrl}/logout`, {})
      .pipe(
        finalize(() => {
          this.clearLocalStorage();
          this.user.next(null);
          this.stopTokenTimer();
          this.router.navigate(['login']);
        })
      )
      .subscribe();
  }

  refreshToken(): Observable<LoginResult|null> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      this.clearLocalStorage();
      return of(null);
    }

    return this.http
      .post<LoginResult>(`${this.apiUrl}/refresh-token`, { refreshToken })
      .pipe(
        map((x) => {
          this.user.next({
            username: x.username,
            role: x.role,
            originalUserName: x.originalUserName,
          });
          this.setLocalStorage(x);
          this.startTokenTimer();
          return x;
        })
      );
  }

  setLocalStorage(x: LoginResult): void {
    localStorage.setItem('access_token', x.accessToken);
    localStorage.setItem('refresh_token', x.refreshToken);
    localStorage.setItem('login-event', 'login' + Math.random());
  }

  clearLocalStorage(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.setItem('logout-event', 'logout' + Math.random());
  }

  private getTokenRemainingTime(): number {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      return 0;
    }
    const jwtToken = JSON.parse(atob(accessToken.split('.')[1]));
    const expires = new Date(jwtToken.exp * 1000);
    return expires.getTime() - Date.now();
  }

  private startTokenTimer(): void {
    const timeout = this.getTokenRemainingTime();
    this.timer = of(true)
      .pipe(
        delay(timeout),
        tap(() => this.refreshToken().subscribe())
      )
      .subscribe();
  }

  private stopTokenTimer(): void {
    this.timer?.unsubscribe();
  }
}
