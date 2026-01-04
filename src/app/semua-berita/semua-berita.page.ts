import { Component, OnInit } from '@angular/core';
import {
  BeritaserviceService,
  Berita,
} from '../services/beritaservice.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-semua-berita',
  templateUrl: './semua-berita.page.html',
  styleUrls: ['./semua-berita.page.scss'],
})
export class SemuaBeritaPage implements OnInit {
  beritaSaya: any[] = [];
  daftarKategori: any[] = [];
  idUser: number = 1;

  formBerita = {
    judul: '',
    deskripsi: '',
    foto: '',
    kategori: [],
  };

  constructor(
    private beritaservice: BeritaserviceService,
    private toastCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadKategori();
    this.loadBeritaSaya();
  }

  ionViewWillEnter() {
    this.loadBeritaSaya();
  }

  loadKategori() {
    this.beritaservice.getAllKategory().subscribe((response) => {
      if (response.result === 'OK') {
        this.daftarKategori = response.data;
      }
    });
  }

  loadBeritaSaya() {
    // Ambil emailUser dari localStorage jika ada
    const logged = JSON.parse(localStorage.getItem('logged') || 'null');
    if (logged && logged.accountEmail) {
      this.beritaservice.getBeritaByUser(logged.accountEmail).subscribe((response) => {
        if (response.result === 'OK') {
          this.beritaSaya = response.data;
        } else {
          this.beritaSaya = [];
        }
      });
    }
  }

  

  // Pengecekan Judul Duplikat
  async simpanBerita(modal: any) {
    // 1. Cek apakah judul sudah ada di list (Poin 5)
    const isExist = this.beritaSaya.some(
      (b) => b.judul.toLowerCase() === this.formBerita.judul.toLowerCase()
    );

    if (isExist) {
      const alert = await this.toastCtrl.create({
        header: 'Error',
        message: 'Judul berita sudah pernah dibuat!',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    // Validasi form
    if (!this.formBerita.judul || !this.formBerita.deskripsi) {
      const alert = await this.toastCtrl.create({
        header: 'Error',
        message: 'Judul dan deskripsi harus diisi!',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    // 2. Ambil email dari logged user
    const logged = JSON.parse(localStorage.getItem('logged') || 'null');
    if (!logged || !logged.accountEmail) {
      const alert = await this.toastCtrl.create({
        header: 'Error',
        message: 'Anda harus login terlebih dahulu!',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    // 3. Kirim ke Web Service dengan email penerbit
    this.beritaservice.tambahBerita(
      this.formBerita.judul,
      this.formBerita.deskripsi,
      this.formBerita.foto,
      this.formBerita.kategori,
      logged.accountEmail
    ).subscribe(async (response) => {
      if (response.result === 'OK') {
        const alert = await this.toastCtrl.create({
          header: 'Berhasil',
          message: 'Berita berhasil ditambahkan!',
          buttons: ['OK'],
        });
        await alert.present();
        
        // Reload berita saya
        this.loadBeritaSaya();
        
        // 4. Close modal & reset form
        modal.dismiss();
        this.resetForm();
      } else {
        const alert = await this.toastCtrl.create({
          header: 'Error',
          message: response.message || 'Gagal menambahkan berita',
          buttons: ['OK'],
        });
        await alert.present();
      }
    });
  }

  resetForm() {
    this.formBerita = { judul: '', deskripsi: '', foto: '', kategori: [] };
  }

  async hapusBerita(id: number) {
    const confirm = await this.toastCtrl.create({
      header: 'Konfirmasi',
      message: 'Yakin ingin menghapus berita ini?',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Hapus',
          handler: () => {
            this.beritaservice.hapusBerita(id).subscribe(async (response) => {
              if (response.result === 'OK') {
                const alert = await this.toastCtrl.create({
                  header: 'Berhasil',
                  message: 'Berita berhasil dihapus!',
                  buttons: ['OK'],
                });
                await alert.present();
                this.loadBeritaSaya();
              } else {
                const alert = await this.toastCtrl.create({
                  header: 'Error',
                  message: 'Gagal menghapus berita',
                  buttons: ['OK'],
                });
                await alert.present();
              }
            });
          }
        }
      ]
    });
    await confirm.present();
  }

}
