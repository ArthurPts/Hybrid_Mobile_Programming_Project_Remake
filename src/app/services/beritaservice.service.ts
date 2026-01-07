import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Berita {
  id: number;
  judul: string;
  tanggal_rilis: string;
  foto: string;
  isi_berita: string;
  penerbit: string;
  rating: number;
  jumlah_review: number;
  rekomendasi: number;
  views: number;
  kategori_names: string;
}

@Injectable({
  providedIn: 'root',
})
export class BeritaserviceService {
  url = 'https://ubaya.cloud/hybrid/160423183/project.php';

  constructor(private http: HttpClient) {}

//#region GET BERITA
  getAllBerita(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = new URLSearchParams();
    body.set('action', 'getAllBerita');
    const urlEncodedData = body.toString();

    return this.http.post(this.url, urlEncodedData, { headers });
  }

  getFavoritBerita(emailUser: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = new URLSearchParams();
    body.set('action', 'getBeritaFavorite');
    body.set('emailUser', emailUser);
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

  loadRekomendasiBerita(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new URLSearchParams();
    body.set('action', 'getBeritabyRekomendasi');

    return this.http.post(this.url, body.toString(), { headers });
  }

//#endregion 
//#region UPDATE BERITA
  updateRating(idBerita: number,rating: number,emailUser: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new URLSearchParams();
    body.set('action', 'updateRating');
    body.set('id', idBerita.toString()); 
    body.set('rating', rating.toString());
    body.set('emailUser', emailUser);

    return this.http.post(this.url, body.toString(), { headers });
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

  tambahFavoritBerita(idBerita: number, emailUser: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = new URLSearchParams();
    body.set('action', 'tambahFavoritBerita');
    body.set('idBerita', idBerita.toString());
    body.set('emailUser', emailUser);
    const urlEncodedData = body.toString();

    return this.http.post(this.url, urlEncodedData, { headers });
  }

  hapusFavoritBerita(idBerita: number, emailUser: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = new URLSearchParams();
    body.set('action', 'hapusFavoritBerita');
    body.set('idBerita', idBerita.toString()); 
    body.set('emailUser', emailUser); 
    const urlEncodedData = body.toString();

    return this.http.post(this.url, urlEncodedData, { headers });
  }

//#endregion
//#region TAMBAH & HAPUS BERITA
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
//#endregion
//#region KATEGORI 
  getAllKategory(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = new URLSearchParams();
    body.set('action', 'getAllKategory');
    const urlEncodedData = body.toString();
    return this.http.post(this.url, urlEncodedData, { headers });
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

  deleteKategori(id: any) {
    const body = new URLSearchParams();
    body.set('action', 'deleteKategori'); // Sesuaikan dengan yang ada di PHP
    body.set('id', id);

    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    return this.http.post(this.url, body.toString(), { headers });
  }
//#endregion
//#region DETIL BERITA & KOMENTAR
  getDetailBerita(id: number, emailUser: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = new URLSearchParams();
    body.set('action', 'getDetailBerita');
    body.set('id', id.toString());
    body.set('emailUser', emailUser);

    return this.http.post(this.url, body.toString(), { headers });
  }

  addKomentarBerita(idBerita: number, emailUser: string, komentar: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new URLSearchParams();
    body.set('action', 'addKomentarBerita');
    body.set('idBerita', idBerita.toString());
    body.set('emailUser', emailUser);
    body.set('komentar', komentar);

    return this.http.post(this.url, body.toString(), { headers });
  }

  getKomentarBerita(idBerita: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new URLSearchParams();
    body.set('action', 'getKomentarBerita');
    body.set('idBerita', idBerita.toString());

    return this.http.post(this.url, body.toString(), { headers });
  }

  deleteKomentarBerita(id:number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new URLSearchParams();
    body.set('action', 'hapusKomentarBerita');
    body.set('idKomentar', id.toString());
    return this.http.post(this.url, body.toString(), { headers });
  }

//#endregion
}