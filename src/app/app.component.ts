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
  fotoFile: File = new File([], '');
  
  logged: Akun | null = null;
  isRegister: boolean = false;

  constructor(private objAkun: AkunService) {
    this.logged = JSON.parse(localStorage.getItem('logged') || 'null');
  }

  login() {
    this.objAkun.login(this.email, this.pass).subscribe((respon: any) => {
      if (respon.result === 'OK') {
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
  ambilFoto(event: any) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.fotoFile = input.files[0];
    }
  }

  regis() {
    if (this.pass !== this.confirmPass) {
      alert('Password dan konfirmasi tidak sama!');
      return;
    }

    if (this.pass.length < 8) {
      alert('Password minimal 8 karakter!');
      return;
    }

    if (!this.nama.match(/^(?!\d+$).+$/)) {
      alert('Nama tidak boleh hanya berisi angka!');
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

    this.objAkun.register(akunBaru, this.fotoFile).subscribe(
      (respon: any) => {
        if (respon.result === 'OK') {
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
