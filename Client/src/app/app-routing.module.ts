
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './core';
import { TodoGridComponent } from './todo-grid/todo-grid.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: TodoGridComponent,
    canActivate: [AuthGuard],
  },
  { path: 'login', component: LoginComponent },
  // { path: 'demo-apis', component: DemoApisComponent, canActivate: [AuthGuard] },
  // {
  //   path: 'management',
  //   loadChildren: () =>
  //     import('./management/management.module').then((m) => m.ManagementModule),
  //   canActivate: [AuthGuard],
  // },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
