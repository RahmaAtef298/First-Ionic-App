import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { Plugins } from '@capacitor/core';
import { map, tap } from 'rxjs/operators';
import { User } from './User.model';


export interface AuthResponseData{
  kind: string;
  idToken:	string;
  email:	string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy{

  private user = new BehaviorSubject<User>(null);
  private activeLogoutTimer: any;

  constructor(private http: HttpClient) { }

  get UserId(){
    return this.user.asObservable().pipe(map( user => {
      if (user) {
        return user.id;
      }else{
        return false;
      }
      }));
  }

  get UserIsAuthenticated(){
    return this.user.asObservable().pipe(map( user => {
      if (user) {
        return !!user.token;
      }else{
        return false;
      }
    }));
  }

  get token() {
    return this.user.asObservable().pipe(
      map(user => {
        if (user) {
          return user.token;
        } else {
          return null;
        }
      })
    );
  }

  SignUp(Email: string, Password: string){
    return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
      { email: Email, password: Password, returnSecureToken: true}
    ).pipe(tap(
      this.setUserData.bind(this)
    ));
  }

  Login(Email: string, Password: string){
    return this.http.post<AuthResponseData>(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${
        environment.firebaseAPIKey
      }`,
      { email: Email, password: Password, returnSecureToken: true }
    ).pipe(tap(
      this.setUserData.bind(this)
    ));
  }

  autoLogin() {
    return from(Plugins.Storage.get({ key: 'authData' })).pipe(
      map(storedData => {
        if (!storedData || !storedData.value) {
          return null;
        }
        const parsedData = JSON.parse(storedData.value) as {
          token: string;
          tokenExpirationDate: string;
          userId: string;
          email: string;
        };
        const expirationTime = new Date(parsedData.tokenExpirationDate);
        if (expirationTime <= new Date()) {
          return null;
        }
        const user = new User(
          parsedData.userId,
          parsedData.email,
          parsedData.token,
          expirationTime
        );
        return user;
      }),
      tap(user => {
        if (user) {
          this.user.next(user);
          this.autoLogout(user.tokenDuration);
        }
      }),
      map(user => {
        return !!user;
      })
    );
  }

  Logout(){
    this.user.next(null);
  }

  private autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.Logout();
    }, duration);
  }

  private setUserData(userData: AuthResponseData) {
    const expirationTime = new Date(
      new Date().getTime() + +userData.expiresIn * 1000
    );
    const user = new User(
      userData.localId,
      userData.email,
      userData.idToken,
      expirationTime
    );
    this.user.next(user);
    this.autoLogout(user.tokenDuration);
    this.storeAuthData(
      userData.localId,
      userData.idToken,
      expirationTime.toISOString(),
      userData.email
    );
  }

  private storeAuthData(
    userId: string,
    token: string,
    tokenExpirationDate: string,
    email: string
  ) {
    const data = JSON.stringify({
      userId: userId,
      token: token,
      tokenExpirationDate: tokenExpirationDate,
      email: email
    });
    Plugins.Storage.set({ key: 'authData', value: data });
  }

  ngOnDestroy() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }

}
