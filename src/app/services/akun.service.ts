import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Akun {
  accountEmail: string;
  accountPass: string;
  accountNama: string;
  accountGender: string;
  accountAlamat: string;
  accountTanggalLahir: string;
  accountFotoProfil: string;
}

@Injectable({
  providedIn: 'root'
})
export class AkunService {
  url = "https://ubaya.cloud/hybrid/160423183/project.php";

  constructor(private http: HttpClient) { }

  login(email: string, pass: string): Observable<any>{
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new URLSearchParams();
    body.set('action', "login"); 
    body.set('email', email);
    body.set('pass', pass); 
    const urlEncodedData = body.toString();

    return this.http.post(this.url, urlEncodedData, { headers });
  }

  //*jgn tanya knp logout ga ada disini, logout-nya di root (app.component.ts) :v
  //*semua function default returnnya bertipe observable, ada/tidak ada ":Observable<any>" hasilnya sama aja

  update(updated: Akun){
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new URLSearchParams();
    body.set('action', "update"); 
    body.set('email', updated.accountEmail);
    body.set('password', updated.accountPass);
    body.set('nama', updated.accountNama);
    body.set('gender', updated.accountGender);
    body.set('alamat', updated.accountAlamat);
    body.set('tanggal_lahir', updated.accountTanggalLahir);
    body.set('foto', updated.accountFotoProfil); 
    const urlEncodedData = body.toString();

    return this.http.post(this.url, urlEncodedData, { headers });
  }

  register(registerd:Akun){
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new URLSearchParams();
    body.set('action', "register"); 
    body.set('email', registerd.accountEmail);
    body.set('password', registerd.accountPass);
    body.set('nama', registerd.accountNama);
    body.set('gender', registerd.accountGender);
    body.set('alamat', registerd.accountAlamat);
    body.set('tanggal_lahir', registerd.accountTanggalLahir);
    body.set('foto', registerd.accountFotoProfil); 
    const urlEncodedData = body.toString();

    return this.http.post(this.url, urlEncodedData, { headers });
  }

  getDataUser(getData:Akun){
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new URLSearchParams();
    body.set('action', "getDataUser"); 
    body.set('email', getData.accountEmail);
    body.set('password', getData.accountPass);
    body.set('nama', getData.accountNama);
    body.set('gender', getData.accountGender);
    body.set('alamat', getData.accountAlamat);
    body.set('tanggal_lahir', getData.accountTanggalLahir);
    body.set('foto', getData.accountFotoProfil); 
    const urlEncodedData = body.toString();

    return this.http.post(this.url, urlEncodedData, { headers });
  }

}
