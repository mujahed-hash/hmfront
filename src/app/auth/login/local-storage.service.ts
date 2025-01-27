import { Injectable } from '@angular/core';
const Token = 'jwtToken'

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }


  
  setItem(data:any): void {
    localStorage.setItem(Token, data);
  }

  getItem(key?:any) {
    return localStorage.getItem(Token)
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
  
  isTokenValid(key: string) {
    const token = this.getItem(key);
        if (!token) {
      return false; // No token found
    }

    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const tokenExpiration = tokenData.exp * 1000; // Convert to milliseconds

    return Date.now() < tokenExpiration;
  }




  setToken(data:any){
    localStorage.setItem(Token, data);
  }
  getToken(){
    return localStorage.getItem(Token)
  }
removeToken(){
  localStorage.removeItem(Token)
}

isValidToken(){
  const token = this.getToken();

  if(token){
    const tokenDecode = JSON.parse(atob(token.split('.')[1]));
    return !this._tokenExpired(tokenDecode.exp)
  }

  else{
    localStorage.removeItem(Token)
    return false

  }
}
getUserIdFromToken(){
  const token = this.getToken();

  if(token){
    const tokenDecode = JSON.parse(atob(token.split('.')[1]));
    if(tokenDecode){
      console.log(tokenDecode.userId);

      return tokenDecode.userId

    }
    else {
      return null;
    }
  }

  else{
    return false
  }
}
getUserIdNameToken(){
  const token = this.getToken();

  if(token){
    const tokenDecode = JSON.parse(atob(token.split('.')[1]));
    if(tokenDecode){
      console.log(tokenDecode.name);

      return tokenDecode.name
    }
    else {
      return null;
    }
  }

  else{
    return false
  }
}
getUserID(): string {
  const token = localStorage.getItem('token');
  if (token) {
    const tokenDecode = JSON.parse(atob(token.split('.')[1]));
    if (tokenDecode) {

      if(tokenDecode.userId) return tokenDecode.userId;
    }
  }
  return '';
}
private _tokenExpired(expiration:any):boolean{
   return Math.floor(new Date().getTime() / 1000) >=expiration;
}
}
