import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../core';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  busy = false;
  username = '';
  password = '';
  email = '';
  loginError = false;
  showLogin = true;
  private subscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.subscription = this.authService.user$.subscribe((x) => {
      if (this.route.snapshot.url[0].path === 'login') {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        if (x && accessToken && refreshToken) {
          const returnUrl = this.route.snapshot.queryParams?.returnUrl || '';
          // const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
          this.router.navigate([returnUrl]);
        }
      } // optional touch-up: if a tab shows login page, then refresh the page to reduce duplicate login
    });
  }

  login(): void {
    if (!this.username || !this.password) {
      return;
    }
    console.log('ok');
    this.busy = true;
    const returnUrl = this.route.snapshot.queryParams?.returnUrl || '';
    // const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
    this.authService
      .login(this.username, this.password)
      .pipe(finalize(() => (this.busy = false)))
      .subscribe(
        () => {
          this.router.navigate([returnUrl]);
        },
        () => {
          this.loginError = true;
        }
      );
  }

  register(): void {
    if (!this.username || !this.password || !this.email) {
      return;
    }
    this.busy = true;
    const returnUrl = this.route.snapshot.queryParams?.returnUrl || '';
    this.authService.register(this.username, this.email, this.password)
      .pipe(finalize(() => { this.busy = false; }))
      .subscribe(() => {
        this.login();
      }, () => { this.loginError = true; });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
