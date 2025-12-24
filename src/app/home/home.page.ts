import { BeritaserviceService, Berita } from '../services/beritaservice.service';
import { Component, inject } from '@angular/core';




@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone:false,
})
export class HomePage {

  constructor(
    public beritaservice: BeritaserviceService //jangan ditanya kenapa begitu, tp emg begini dr ionicnya :v
  ) {}
  berita: any;
  jenisTampilan: string = 'trending';
  beritaDicari: string = '';
  semuaBerita: any[] = [];
  hasilPencarian: any[] = [];

  cariBeritaByJudul() {
    const lowerKeyword = this.beritaDicari.toLowerCase();
    this.jenisTampilan = 'search';
    if (!lowerKeyword) {
      // kalau kosong, dia munculin semua berita
      this.hasilPencarian = [...this.semuaBerita];
    } else {
      this.hasilPencarian = this.semuaBerita.filter((berita) =>
        berita.judulBerita.toLowerCase().includes(lowerKeyword)
      );
    }
  }

}
