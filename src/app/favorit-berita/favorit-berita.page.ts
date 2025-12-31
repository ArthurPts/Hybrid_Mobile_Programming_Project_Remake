import { Component, OnInit } from '@angular/core';
import { BeritaserviceService } from '../services/beritaservice.service';

@Component({
  selector: 'app-favorit-berita',
  templateUrl: './favorit-berita.page.html',
  styleUrls: ['./favorit-berita.page.scss'],
})
export class FavoritBeritaPage implements OnInit {
  favoritBerita: any[] = [];
  idUser: number = 1;
  beritaFavorite: any[] = [];

  constructor(private beritaservice: BeritaserviceService) {}

  getFavorites() {
    this.beritaservice.loadRekomendasiBerita().subscribe((res: any) => {
      console.log('Hasil API:', res); // Cek ini di Inspect Element > Console
      if (res.result === 'OK') {
        this.beritaFavorite = res.data;
      }
    });
  }

  ngOnInit() {
    this.getFavorites();
  }

  ionViewWillEnter() {
    // Fitur favorit dinonaktifkan - memerlukan tabel favorit di database
    // this.loadFavoritBerita();
  }

  loadFavoritBerita() {
    // FITUR FAVORIT TIDAK AKTIF - memerlukan tabel favorit di database
    // Uncomment code di bawah jika sudah menambahkan tabel favorit ke database
    /*
    const logged = JSON.parse(localStorage.getItem('logged') || 'null');
    if (logged && logged.accountId) {
      this.idUser = logged.accountId;
      this.beritaservice.getFavoritBerita(this.idUser).subscribe((response) => {
        if (response.result === 'OK') {
          this.favoritBerita = response.data;
        } else {
          this.favoritBerita = [];
        }
      });
    }
    */
  }
}
