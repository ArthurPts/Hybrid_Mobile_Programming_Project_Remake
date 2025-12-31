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
  id: number = 0;

  constructor(
    private route: ActivatedRoute,
    private beritaservice: BeritaserviceService
  ) {}

  ngOnInit() {
    // Ambil ID dari parameter URL
    this.id = +this.route.snapshot.params['id'];
    this.loadDetailBerita();
  }

  loadDetailBerita() {
    this.beritaservice.getDetailBerita(this.id).subscribe((res: any) => {
      if (res.result === 'OK') {
        this.berita = res.data; // Mengambil object berita dari PHP
      }
    });
  }

  beriRating(bintang: number) {
    const ratingLama = this.berita.rateUser || 0;

    this.beritaservice
      .updateRating(this.id, bintang, ratingLama)
      .subscribe((res: any) => {
        if (res.result === 'OK') {
          // Update data di UI secara realtime
          this.berita.rating = res.newRating;
          this.berita.jumlah_review = res.newJumlahReview;
          this.berita.rateUser = bintang; // Simpan pilihan user saat ini
          alert('Terima kasih atas ratingnya!');
        }
      });
  }


  // Tambah komen - fitur tambahan!! (blm aktif)
  // addComment() {
  //   if (this.newComment.trim() !== '') {
  //     const newCmt = {
  //       idBerita: this.id,
  //       username: `${this.userData.namaDepan} ${this.userData.namaBelakang}`,
  //       comment: this.newComment,
  //       avatar: this.userData.fotoProfil || 'assets/my-avatar.png',
  //     };

  //     this.commentServices.addComment(newCmt);
  //     this.filteredComments.push(newCmt);
  //     this.newComment = '';
  //   }
  // }

  // countComments(idBerita: number): number {
  //   return this.commentServices.getCommentCountByBeritaId(this.id);
  // }

  // getComments(idBerita: number): Comment[] {
  //   return this.commentServices.getCommentsByBeritaId(this.id);
  // }

  // private loadUserData() {
  //   const user = this.akunService.getCurrentUser();
  //   if (user) {
  //     this.akun = { ...user };
  //     this.userData = { ...user.biodata };
  //   } else {
  //     this.router.navigateByUrl('/login', { replaceUrl: true });
  //   }
  // }
}
