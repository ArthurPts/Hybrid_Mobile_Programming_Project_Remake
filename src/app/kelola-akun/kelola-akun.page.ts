import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { AkunService, Akun } from '../services/akun.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
@Component({
  selector: 'app-kelola-akun',
  templateUrl: './kelola-akun.page.html',
  styleUrls: ['./kelola-akun.page.scss'],
})
export class KelolaAkunPage implements OnInit {
akun: Akun = {
    accountEmail: '',
    accountPass: '',
    accountNama: '',
    accountGender: '',
    accountAlamat: '',
    accountTanggalLahir: '',
    accountFotoProfil: 'default.png'
  };
  constructor(
    private root:AppComponent,
    private router: Router,
    private akunService: AkunService,
    private alertCtrl: AlertController) { }

  ngOnInit() {
  }

  logout(){
    this.root.logout();
  }

  ionViewWillEnter() {
    this.loadUserData();
  }



  private loadUserData() {
    // Ambil data dari localStorage/session yang disimpan saat login
    const data = localStorage.getItem('user_login');
    if (data) {
      const user = JSON.parse(data);
      // Mapping data dari PHP/Storage ke variabel akun
      this.akun = {
        accountEmail: user.email,
        accountPass: user.password,
        accountNama: user.nama,
        accountGender: user.gender,
        accountAlamat: user.alamat,
        accountTanggalLahir: user.tanggal_lahir,
        accountFotoProfil: user.foto
      };
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  discardChanges() {
    this.loadUserData();
  }

  async saveChanges() {
    this.akunService.update(this.akun).subscribe(async (res: any) => {
      if (res.result === 'success') {
        // Update local storage agar perubahan langsung terlihat di seluruh aplikasi
        localStorage.setItem('user_login', JSON.stringify(res.user_data));
        
        const alert = await this.alertCtrl.create({
          header: 'Berhasil',
          message: 'Perubahan berhasil disimpan!',
          buttons: ['OK'],
        });
        await alert.present();
      }
    });
  }

}
