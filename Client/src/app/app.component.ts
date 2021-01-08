import {Component, OnInit} from '@angular/core';
import {AuthService} from './core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(public authService: AuthService) {}

  title = 'teux-deux-clone';
  loggedIn = false;
  username = '';

  ngOnInit(): void {
    this.authService.user$
      .subscribe(user => {
        if (user){
          this.loggedIn = true;
          this.username = user.username;
        } else {
          this.loggedIn = false;
          this.username = 'login';
        }
      });
  }

  logout(): void {
    this.authService.logout();
  }
}
