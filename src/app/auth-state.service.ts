import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private loginSubject = new BehaviorSubject<boolean>(false);
  loginEvent$ = this.loginSubject.asObservable();

  notifyLogin() {
    this.loginSubject.next(true);
  }
  constructor() { }

}
