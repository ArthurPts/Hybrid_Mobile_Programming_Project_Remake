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
  confirmPass:string = '';
  nama: string = '';
  gender: string = '';
  alamat: string = '';
  tanggal_lahir: string = '';
  foto: string = '';
  logged: Akun | null = null;
  isRegister: boolean = false; //untuk pengecekan kesamaan akun

  constructor(private objAkun: AkunService) {
    this.logged = JSON.parse(localStorage.getItem('logged') || 'null');
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

        alert('Berhasil Login');
        localStorage.setItem('logged', JSON.stringify(this.logged));
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

    this.objAkun.register(akunBaru).subscribe((respon: any) => {
      if (respon.result === 'success') {
        alert('Registrasi Berhasil! Silakan Login.');
        this.isRegister = false; //buat balik ke form login di home page
      } else {
        alert('Gagal Registrasi: ' + respon.message);
      }
    });
  }
}
