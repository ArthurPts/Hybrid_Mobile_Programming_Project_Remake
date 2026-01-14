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
  showForm = false;
  isEditMode = false;
  selectedPhotos: File[] = [];
  mainPhotoFile: File | null = null;
  removedPhotoIndices: number[] = [];
  
  // Preview URLs
  mainPhotoPreview: string | null = null;
  additionalPhotosPreviews: string[] = [];

  formBerita = {
    id: 0,
    judul: '',
    deskripsi: '',
    fotoUtama: '',
    fotoList: [] as string[],
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

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  editBerita(berita: any) {
    this.isEditMode = true;
    this.showForm = true;

    const logged = JSON.parse(localStorage.getItem('logged') || 'null');
    const emailUser = logged?.accountEmail || '';
    
    // Load detail berita untuk dapat foto_list dan kategori
    this.beritaservice.getDetailBerita(berita.id, emailUser).subscribe((response) => {
      if (response.result === 'OK') {
        const detail = response.data;
        this.formBerita = {
          id: berita.id,
          judul: berita.judul,
          deskripsi: berita.isi_berita || '',
          fotoUtama: berita.foto,
          fotoList: detail.foto_list || [berita.foto],
          kategori: detail.kategori_ids || [],
        };
      } else {
        // Fallback jika detail gagal
        this.formBerita = {
          id: berita.id,
          judul: berita.judul,
          deskripsi: berita.isi_berita || '',
          fotoUtama: berita.foto,
          fotoList: [berita.foto],
          kategori: [],
        };
      }
    });
    
    this.selectedPhotos = [];
    this.removedPhotoIndices = [];
    this.mainPhotoFile = null;
    this.mainPhotoPreview = null;
    this.additionalPhotosPreviews = [];
  }

  onMainPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.mainPhotoFile = file;
      console.log(`Main photo selected: ${file.name} (${(file.size/1024).toFixed(2)}KB)`);
      
      // Generate preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.mainPhotoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onAdditionalPhotosSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    
    this.selectedPhotos = [...this.selectedPhotos, ...files];
    console.log(`Added ${files.length} photos`);
    
    // Generate previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.additionalPhotosPreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  removePhoto(index: number, isExisting: boolean = false) {
    if (isExisting) {
      // hapus photo
      if (!this.removedPhotoIndices.includes(index)) {
        this.removedPhotoIndices.push(index);
      }
      // Hapus dari fotoList untuk display
      this.formBerita.fotoList = this.formBerita.fotoList.filter((_, i) => i === 0 || !this.removedPhotoIndices.includes(i));
    } else {
      // hapus foto yg baru dipilih
      this.selectedPhotos.splice(index, 1);
      this.additionalPhotosPreviews.splice(index, 1);
    }
  }

  async simpanBerita() {
    // Validasi
    if (!this.formBerita.judul || !this.formBerita.deskripsi) {
      const alert = await this.toastCtrl.create({
        header: 'Error',
        message: 'Judul dan deskripsi harus diisi!',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    // Cek duplikat judul (hanya saat buat baru)
    if (!this.isEditMode) {
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
    }

    // Cek main photo
    if (!this.isEditMode && !this.mainPhotoFile) {
      const alert = await this.toastCtrl.create({
        header: 'Error',
        message: 'Foto utama harus dipilih!',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

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

    // Prepare FormData untuk upload multiple foto
    const formData = new FormData();
    formData.append('action', this.isEditMode ? 'editBerita' : 'tambahBerita');
    formData.append('judul', this.formBerita.judul);
    formData.append('deskripsi', this.formBerita.deskripsi);
    formData.append('emailPenerbit', logged.accountEmail);
    formData.append('kategori', JSON.stringify(this.formBerita.kategori));

    if (this.isEditMode) {
      formData.append('id', this.formBerita.id.toString());
      if (this.mainPhotoFile) {
        formData.append('mainPhoto', this.mainPhotoFile);
      }
      formData.append('removedPhotoIndices', JSON.stringify(this.removedPhotoIndices));
    } else {
      formData.append('mainPhoto', this.mainPhotoFile!);
    }

    // Tambah foto tambahan
    this.selectedPhotos.forEach((foto) => {
      formData.append('additionalPhotos[]', foto);
    });

    // Kirim ke backend
    this.beritaservice.tambahBerita(formData).subscribe(async (response) => {
      if (response.result === 'OK') {
        const alert = await this.toastCtrl.create({
          header: 'Berhasil',
          message: this.isEditMode ? 'Berita berhasil diupdate!' : 'Berita berhasil ditambahkan!',
          buttons: ['OK'],
        });
        await alert.present();

        this.loadBeritaSaya();
        this.toggleForm();
        this.resetForm();
      } else {
        const alert = await this.toastCtrl.create({
          header: 'Error',
          message: response.message || 'Gagal menyimpan berita',
          buttons: ['OK'],
        });
        await alert.present();
      }
    }, async (error) => {
      console.error('Error saat upload:', error);
      const errorMsg = error.error?.message || error.message || 'Terjadi kesalahan saat upload';
      const alert = await this.toastCtrl.create({
        header: 'Error',
        message: errorMsg + ' (Cek console untuk detail)',
        buttons: ['OK'],
      });
      await alert.present();
    });
  }

  resetForm() {
    this.formBerita = {
      id: 0,
      judul: '',
      deskripsi: '',
      fotoUtama: '',
      fotoList: [],
      kategori: [],
    };
    this.selectedPhotos = [];
    this.mainPhotoFile = null;
    this.removedPhotoIndices = [];
    this.isEditMode = false;
    this.mainPhotoPreview = null;
    this.additionalPhotosPreviews = [];
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
