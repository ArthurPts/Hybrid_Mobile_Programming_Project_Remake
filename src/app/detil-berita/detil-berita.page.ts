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
  id: number = 0; //untuk id berita
  comments: { 
    komenID:string, 
    userName: string; 
    userPhoto?: string; 
    text: string; 
    date: string 
  } [] = [];
  newComment = '';
  currentUserEmail: string = '';
  currentUserNama: string = '';

  constructor(
    private route: ActivatedRoute,
    private beritaservice: BeritaserviceService
  ) {}

  ngOnInit() {
    // Ambil ID dari parameter URL (idBerita sesuai routing)
    const idParam = this.route.snapshot.paramMap.get('idBerita');
    this.id = Number(idParam) || 0;
    
    const user = JSON.parse(localStorage.getItem('logged') || '{}');
    this.currentUserEmail = user.accountEmail || '';
    this.currentUserNama = user.accountNama || '';
    
    // Tambah view hitungan server-side (optional)
    this.beritaservice.addViewBerita(this.id).subscribe();

    if (this.id > 0) {
      this.loadDetailBerita();
      this.loadComments();
    }
  }

  loadDetailBerita() {
    this.beritaservice.getDetailBerita(this.id, this.currentUserEmail).subscribe((res: any) => {
      if (res.result === 'OK') {
        this.berita = res.data;
        
        // Pastikan foto utama tetap tampil walau foto_list kosong
        this.fotoList = res.data.foto_list && res.data.foto_list.length
          ? res.data.foto_list
          : [res.data.foto].filter(Boolean);
        
      }
    });
  }

  beriRating(bintang: number) {
    this.beritaservice.updateRating(this.id, bintang, this.currentUserEmail).subscribe((res: any) => {
      if (res.result === 'OK') {
        alert('Terima kasih atas ratingnya!');
        this.loadDetailBerita();
      }
      else {
        alert('Gagal mengirim rating: ' + res.message);
      }
    });
  }

  toggleFavorite() { 
    if (this.berita.is_favorit == 'TRUE') {
      this.beritaservice.hapusFavoritBerita(this.id, this.currentUserEmail).subscribe((res: any) => {
        if (res.result === 'OK') {
          this.berita.is_favorit = 'FALSE';
        }
      });
    } else {
      this.beritaservice.tambahFavoritBerita(this.id, this.currentUserEmail).subscribe((res: any) => {
        if (res.result === 'OK') {
          this.berita.is_favorit = 'TRUE';
        }
      });
    }
  }

  loadComments() { 
    this.beritaservice.getKomentarBerita(this.id).subscribe((res: any) => {
      if (res.result === 'OK') {
        this.comments = res.data.map((c: any) => ({
          komenID: c.id,
          userName: c.nama_user ,
          userPhoto: c.foto_user || '',
          text: c.komentar,
          date: c.tanggal,
        }));
      }
    })
  }

  addComment() {
    const text = this.newComment.trim();
    if (!text) return;
    this.beritaservice.addKomentarBerita(this.id, this.currentUserEmail, this.newComment).subscribe((res: any) => { //! BELUM di backend
      if (res.result === 'OK') {
        alert('Komentar berhasil ditambahkan.');
        this.loadComments();
        this.newComment = '';
      }
      else {
        alert('Gagal menambahkan komentar: ' + res.message);
      }
    });
  }

  deleteComment(index: string) {
    const indexInt = parseInt(index);
    if (isNaN(indexInt)) {
      alert('ID komentar tidak valid.');
      return;
    }
    this.beritaservice.deleteKomentarBerita(indexInt).subscribe((res: any) => {
      if (res.result === 'OK') {
        alert('Komentar berhasil dihapus.');
        this.loadComments();
      }
      else {
        alert('Gagal menghapus komentar: ' + res.message);
      }
    });
    
  }

  // private loadCurrentUser() {
  //   const raw = localStorage.getItem('logged');
  //   if (!raw || raw === 'undefined' || raw === 'null') return;
  //   try {
  //     const u = JSON.parse(raw);
  //     this.currentUserName = u.accountNama || u.accountEmail || '';
  //     this.currentUserEmail = u.accountEmail || '';
  //     this.currentUserPhoto = u.accountFotoProfil || '';
  //   } catch (e) {
  //     console.warn('Gagal parse user_login', e);
  //   }
  // }
}
