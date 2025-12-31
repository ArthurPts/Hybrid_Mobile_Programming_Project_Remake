import {
  BeritaserviceService,
  Berita,
} from '../services/beritaservice.service';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  constructor(
    private route: ActivatedRoute,
    public beritaservice: BeritaserviceService, //jangan ditanya kenapa begitu, tp emg begini dr ionicnya :v
    private alertController: AlertController
  ) {}
  berita: any;
  jenisTampilan: any;
  beritaDicari: string = '';
  semuaBerita: any[] = [];
  hasilPencarian: any[] = [];
  categories: any[] = [];

  // untuk fitur search
  cariBeritaByJudul() {
    const lowerKeyword = this.beritaDicari.toLowerCase();
    this.jenisTampilan = 0;
    if (!lowerKeyword) {
      // kalau kosong, dia munculin semua berita
      this.hasilPencarian = [...this.semuaBerita];
    } else {
      this.hasilPencarian = this.semuaBerita.filter((berita) =>
        berita.judulBerita.toLowerCase().includes(lowerKeyword)
      );
    }
  }

  chunkArray(arr: any[], chunkSize: number): any[][] {
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      result.push(arr.slice(i, i + chunkSize));
    }
    return result;
  }

  isToastOpen = false;
  toastMessage = '';

  // Fungsi ini dijalankan sekali saat aplikasi dibuka (ngOnInit)
  loadCategories() {
    this.beritaservice.getAllKategory().subscribe((response) => {
      if (response.result === 'OK') {
        this.categories = response.data; // Ini mengisi tab kategori
      }
    });
  }

  loadAllBerita() {
    this.beritaservice.getAllBerita().subscribe((response) => {
      if (response.result === 'OK') {
        this.semuaBerita = response.data;
        this.hasilPencarian = [...this.semuaBerita];
      }
    });
  }

  // Fungsi ini dijalankan saat user mengklik salah satu tab
  pilihKategori(id: any) {
    this.jenisTampilan = id;
    this.beritaservice.getBeritaByKategori(id).subscribe((response) => {
      if (response.result === 'OK') {
        this.semuaBerita = response.data;
        this.hasilPencarian = [...this.semuaBerita];
      }
    });
  }
  SimpanKategoriBaru(nama: string) {
    // Panggil service untuk POST ke PHP
    this.beritaservice.addKategori(nama).subscribe((res: any) => {
      if (res.result === 'OK') {
        // Refresh list kategori agar kategori baru muncul di segment
        this.loadCategories();
      } else {
        console.error('Gagal menambah kategori');
      }
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadAllBerita();
    this.jenisTampilan = 0;
  }

  async tambahKategori() {
    const alert = await this.alertController.create({
      header: 'Tambah Kategori Baru',
      inputs: [
        {
          name: 'nama_kategori',
          type: 'text',
          placeholder: 'Contoh: Ekonomi',
        },
      ],
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
        },
        {
          text: 'Simpan',
          handler: (data) => {
            if (data.nama_kategori) {
              this.SimpanKategoriBaru(data.nama_kategori);
            }
          },
        },
      ],
    });
    await alert.present();
  }
}
