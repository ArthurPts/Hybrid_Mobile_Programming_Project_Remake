import { Berita } from './../services/beritaservice.service';
import { Component, OnInit } from '@angular/core';
import { BeritaserviceService } from '../services/beritaservice.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detil-berita',
  templateUrl: './detil-berita.page.html',
  styleUrls: ['./detil-berita.page.scss'],
})
export class DetilBeritaPage implements OnInit {
  berita: any;
  fotoList: string[] = [];
  id: number = 0;
  isFavorite = false;
  comments: { userName: string; userEmail?: string; userPhoto?: string; text: string; date: string }[] = [];
  newComment = '';
  currentUserName: string = '';
  currentUserEmail: string = '';
  currentUserPhoto: string = '';

  constructor(
    private route: ActivatedRoute,
    private beritaservice: BeritaserviceService
  ) {}

  ngOnInit() {
    // Ambil ID dari parameter URL (idBerita sesuai routing)
    const idParam = this.route.snapshot.paramMap.get('idBerita');
    this.id = idParam ? +idParam : 0;
    this.loadCurrentUser();

    if (this.id > 0) {
      this.loadDetailBerita();
      this.loadComments();
      this.checkFavorite();
    }
  }

  loadDetailBerita() {
    this.beritaservice.getDetailBerita(this.id).subscribe((res: any) => {
      if (res.result === 'OK') {
        this.berita = res.data;
        // Pastikan foto utama tetap tampil walau foto_list kosong
        this.fotoList = res.data.foto_list && res.data.foto_list.length
          ? res.data.foto_list
          : [res.data.foto].filter(Boolean);

        // Tambah view hitungan server-side (optional)
        this.beritaservice.addViewBerita(this.id).subscribe();
      }
    });
  }

  beriRating(bintang: number) {
    this.beritaservice.updateRating(this.id, bintang, 0).subscribe((res: any) => {
      if (res.result === 'OK') {
        this.berita.rating = res.newRating;
        this.berita.jumlah_review = res.newJumlahReview;
        alert('Terima kasih atas ratingnya!');
      }
    });
  }

  toggleFavorite() {
    const favRaw = localStorage.getItem('favorites') || '[]';
    const favList: number[] = JSON.parse(favRaw);

    if (this.isFavorite) {
      const updated = favList.filter((x) => x !== this.id);
      localStorage.setItem('favorites', JSON.stringify(updated));
      this.isFavorite = false;
    } else {
      favList.push(this.id);
      localStorage.setItem('favorites', JSON.stringify(favList));
      this.isFavorite = true;
    }
  }

  checkFavorite() {
    const favRaw = localStorage.getItem('favorites') || '[]';
    const favList: number[] = JSON.parse(favRaw);
    this.isFavorite = favList.includes(this.id);
  }

  loadComments() {
    const raw = localStorage.getItem('comments') || '{}';
    const data = JSON.parse(raw);
    const list = data[this.id] || [];

    // Backward compatibility: map old {user} shape to new {userName, userEmail}
    this.comments = list.map((c: any) => ({
      userName: c.userName || c.user || c.userEmail || 'Pengguna tidak diketahui',
      userEmail: c.userEmail || '',
      userPhoto: c.userPhoto || '',
      text: c.text,
      date: c.date,
    }));
  }

  addComment() {
    const text = this.newComment.trim();
    if (!text) return;

    // Wajib login; data akun diambil dari tabel akuns lewat login dan disimpan di localStorage user_login
    if (!this.currentUserEmail) {
      alert('Anda harus login untuk berkomentar.');
      return;
    }

    const raw = localStorage.getItem('comments') || '{}';
    const data = JSON.parse(raw);

    const comment = {
      userName: this.currentUserName || this.currentUserEmail,
      userEmail: this.currentUserEmail,
      userPhoto: this.currentUserPhoto || '',
      text,
      date: new Date().toISOString(),
    };

    if (!data[this.id]) data[this.id] = [];
    data[this.id].push(comment);

    localStorage.setItem('comments', JSON.stringify(data));
    this.comments = data[this.id];
    this.newComment = '';
  }

  deleteComment(index: number) {
    const raw = localStorage.getItem('comments') || '{}';
    const data = JSON.parse(raw);
    
    if (data[this.id]) {
      data[this.id].splice(index, 1); // hapus komentar di index tertentu
      localStorage.setItem('comments', JSON.stringify(data));
      this.comments = data[this.id]; // refresh tampilan
    }
  }

  private loadCurrentUser() {
    const raw = localStorage.getItem('user_login');
    if (!raw || raw === 'undefined' || raw === 'null') return;
    try {
      const u = JSON.parse(raw);
      this.currentUserName = u.nama || u.email || '';
      this.currentUserEmail = u.email || '';
      this.currentUserPhoto = u.foto || '';
    } catch (e) {
      console.warn('Gagal parse user_login', e);
    }
  }
}
