import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Berita {
  id: number;
  judul: string;
  tanggalRilis: string;
  foto: string;
  fotoTambahan: string[];
  isiBerita: string;
  penerbit: string;
  rating: number;
  jumlahReview: number;
  rekomendasi: number;
  views: number;
  kategori: string[];
}

@Injectable({
  providedIn: 'root',
})
export class BeritaserviceService {
  url = 'https://ubaya.cloud/hybrid/160423183/project.php';

  constructor(private http: HttpClient) {}

  getAllBerita(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = new URLSearchParams();
    body.set('action', 'getAllBerita');
    const urlEncodedData = body.toString();

    return this.http.post(this.url, urlEncodedData, { headers });
  }

  getFavoritBerita(idUser: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = new URLSearchParams();
    body.set('action', 'getFavoritBerita');
    body.set('idUser', idUser.toString());
    const urlEncodedData = body.toString();

    return this.http.post(this.url, urlEncodedData, { headers });
  }

  updateRatingBerita(idBerita: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = new URLSearchParams();
    body.set('action', 'updateRatingBerita');
    body.set('idBerita', idBerita.toString());
    const urlEncodedData = body.toString();

    return this.http.post(this.url, urlEncodedData, { headers });
  }

  addViewBerita(idBerita: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = new URLSearchParams();
    body.set('action', 'addViewBerita');
    body.set('idBerita', idBerita.toString());
    const urlEncodedData = body.toString();

    return this.http.post(this.url, urlEncodedData, { headers });
  }

  getAllKategory(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = new URLSearchParams();
    body.set('action', 'getAllKategory');
    const urlEncodedData = body.toString();
    return this.http.post(this.url, urlEncodedData, { headers });
  }

  getBeritaByKategori(id: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = new URLSearchParams();
    body.set('action', 'getBeritaByKategori');
    body.set('id_kategori', id);

    return this.http.post(this.url, body.toString(), { headers });
  }

  getBeritaByUser(emailUser: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = new URLSearchParams();
    body.set('action', 'getBeritaByUser');
    body.set('emailUser', emailUser);
    const urlEncodedData = body.toString();

    return this.http.post(this.url, urlEncodedData, { headers });
  }

  tambahBerita(
    judul: string,
    deskripsi: string,
    foto: string,
    kategori: string[],
    emailPenerbit: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = new URLSearchParams();
    body.set('action', 'tambahBerita');
    body.set('judul', judul);
    body.set('deskripsi', deskripsi);
    body.set('foto', foto);
    body.set('kategori', JSON.stringify(kategori));
    body.set('emailPenerbit', emailPenerbit);
    const urlEncodedData = body.toString();

    return this.http.post(this.url, urlEncodedData, { headers });
  }

  hapusBerita(idBerita: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = new URLSearchParams();
    body.set('action', 'hapusBerita');
    body.set('idBerita', idBerita.toString());
    const urlEncodedData = body.toString();

    return this.http.post(this.url, urlEncodedData, { headers });
  }

  loadRekomendasiBerita(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new URLSearchParams();
    body.set('action', 'getBeritabyRekomendasi');

    return this.http.post(this.url, body.toString(), { headers });
  }

  addKategori(namaKategori: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new URLSearchParams();
    body.set('action', 'addKategori');
    body.set('nama', namaKategori);

    return this.http.post(this.url, body.toString(), { headers });
  }

  getDetailBerita(id: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = new URLSearchParams();
    body.set('action', 'getDetailBerita');
    body.set('id', id.toString());

    return this.http.post(this.url, body.toString(), { headers });
  }

  updateRating(
    idBerita: number,
    ratingBaru: number,
    rateUserLama: number
  ): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new URLSearchParams();
    body.set('action', 'updateRating');
    body.set('id', idBerita.toString()); // Pastikan key 'id' sesuai dengan $_POST['id'] di PHP
    body.set('ratingBaru', ratingBaru.toString());
    body.set('rateUserLama', rateUserLama.toString());

    return this.http.post(this.url, body.toString(), { headers });
  }

  deleteKategori(id: any) {
    const body = new URLSearchParams();
    body.set('action', 'deleteKategori'); // Sesuaikan dengan yang ada di PHP
    body.set('id', id);

    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    return this.http.post(this.url, body.toString(), { headers });
  }

  getBeritaFavoriteById(ids: number[]): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new URLSearchParams();
    body.set('action', 'getBeritaFavoriteById');
    body.set('ids', JSON.stringify(ids));

    return this.http.post(this.url, body.toString(), { headers });
  }

  //fitur tambahan (nambah view ketika melihat beritanya)
  // addView(id: number) {
  //   for (let i = 0; i < this.berita.length; i++) {
  //     if (this.berita[i].id === id) {
  //       this.berita[i].views = this.berita[i].views + 1;
  //       break;
  //     }
  //   }
  // }
}
