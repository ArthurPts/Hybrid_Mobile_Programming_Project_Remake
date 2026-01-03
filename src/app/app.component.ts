import { Component } from '@angular/core';
import { AkunService, Akun } from './services/akun.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  email: string = '';
  pass: string = '';
  confirmPass: string = '';
  nama: string = '';
  gender: string = '';
  alamat: string = '';
  tanggal_lahir: string = '';
  foto: string = '';
  logged: Akun | null = null;
  isRegister: boolean = false; //untuk pengecekan kesamaan akun

  //variable khusus simpan data login user
  public userLoggedIn: any = null;
  public isLoginOpen: boolean = false;

  constructor(private objAkun: AkunService) {
    this.logged = JSON.parse(localStorage.getItem('logged') || 'null');
    this.checkLoginStatus();
    const data = localStorage.getItem('user_login');
    if (data && data !== 'undefined') {
      this.userLoggedIn = JSON.parse(data);
    }
  }

  checkLoginStatus() {
    const data = localStorage.getItem('user_login');
    if (data && data !== 'undefined') {
      this.userLoggedIn = JSON.parse(data);
    } else {
      this.userLoggedIn = null;
    }
  }

  login() {
    this.objAkun.login(this.email, this.pass).subscribe((respon: any) => {
      if (respon.result === 'success') {
        this.logged = {
          accountEmail: respon.email,
          accountPass: respon.password,
          accountNama: respon.nama,
          accountGender: respon.gender,
          accountAlamat: respon.alamat,
          accountTanggalLahir: respon.tanggal_lahir,
          accountFotoProfil: respon.foto,
        };

        // Simpan ke variabel global AppComponent secara manual agar tidak tabrak dgn login
        const dataUserManual = {
          email: respon.email,
          password: respon.password,
          nama: respon.nama,
          gender: respon.gender,
          alamat: respon.alamat,
          tanggal_lahir: respon.tanggal_lahir,
          foto: respon.foto,
        };

        alert('Berhasil Login');
        localStorage.setItem('logged', JSON.stringify(this.logged));

        this.userLoggedIn = dataUserManual;
        this.isLoginOpen = false;
        // Tetap simpan ke localStorage untuk backup jika refresh browser
        localStorage.setItem('user_login', JSON.stringify(dataUserManual));
      } else {
        alert('Gagal Login');
        this.logged = null;
      }
    });
  }

  logout() {
    this.email = '';
    this.pass = '';
    this.logged = null;
    localStorage.removeItem('logged');
    localStorage.removeItem('user_login');
    this.userLoggedIn = null;
  }

  // buat ambil foto dari regis
  ambilNamaFoto(event: any) {
    const file = event.target.files[0];
    if (file) {
      // ini hanya ambil nama filenya saja (contoh: "profil.jpg")
      this.foto = file.name;
    }
  }

  regis() {
    if (this.pass !== this.confirmPass) {
      alert('Password dan konfirmasi tidak sama!');
      return;
    }
    // Buat objek data dari variabel yang di-bind di form
    const akunBaru: Akun = {
      accountEmail: this.email,
      accountPass: this.pass,
      accountNama: this.nama,
      accountGender: this.gender,
      accountAlamat: this.alamat,
      accountTanggalLahir: this.tanggal_lahir,
      accountFotoProfil: this.foto,
    };

    this.objAkun.register(akunBaru).subscribe(
      (respon: any) => {
        if (respon.status === 'success') {
          alert('Registrasi Berhasil! Silakan Login.');
          this.isRegister = false;
        } else {
          alert('Gagal Registrasi: ' + respon.message);
        }
      },
      (error) => {
        console.error('SERVER ERROR:', error);
        alert('Terjadi error server (500). Cek PHP & database.');
      }
    );
  }
}
