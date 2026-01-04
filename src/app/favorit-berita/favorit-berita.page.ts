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
  id: number = 0;
  beritaFavoriteId: any[] = [];

  constructor(private beritaservice: BeritaserviceService) {}

  getFavorites() {
    const raw = localStorage.getItem('favorites') || '[]';
    const ids: number[] = JSON.parse(raw);

    if (ids.length === 0) {
      this.beritaFavoriteId = [];
      return;
    }

    this.beritaservice.getBeritaFavoriteById(ids).subscribe((res: any) => {
        console.log('Hasil API:', res); // Cek ini di Inspect Element > Console
        if (res.result === 'OK') {
          this.favoritBerita = res.data;
          console.log(this.favoritBerita);
        }
      });
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getFavorites();
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
