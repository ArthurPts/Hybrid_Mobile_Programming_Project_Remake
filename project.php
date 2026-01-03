<?php
include("koneksi.php");
extract($_POST);

$action = $_POST['action'];

// ================== BERITA ACTIONS ==================
if ($action == "getAllBerita") {
    $sql = "SELECT b.*, a.nama as penerbit, 
            GROUP_CONCAT(DISTINCT k.nama) as kategori_names
            FROM beritas b
            LEFT JOIN akuns a ON b.penerbit = a.email
            LEFT JOIN berita_has_kategori bhk ON b.id = bhk.id_berita
            LEFT JOIN kategoris k ON bhk.id_kategori = k.id
            GROUP BY b.id
            ORDER BY b.tanggal_rilis DESC";
    
    $result = $conn->query($sql);
    
    if ($result) {
        $berita = [];
        while ($row = $result->fetch_assoc()) {
            $berita[] = [
                'id' => $row['id'],
                'judul' => $row['judul'],
                'isi' => $row['isi_berita'],
                'foto' => $row['foto'],
                'tanggal_publish' => $row['tanggal_rilis'],
                'penerbit' => $row['penerbit'],
                'views' => $row['views'] ?? 0
            ];
        }
        $arr = ['result' => 'OK', 'data' => $berita];
    } else {
        $arr = ['result' => 'ERROR', 'message' => $conn->error];
    }

} elseif ($action == "getAllKategory") {
    $sql = "SELECT * FROM kategoris ORDER BY nama";
    $result = $conn->query($sql);
    
    if ($result) {
        $kategori = [];
        while ($row = $result->fetch_assoc()) {
            $kategori[] = [
                'id' => $row['id'],
                'nama' => $row['nama']
            ];
        }
        $arr = ['result' => 'OK', 'data' => $kategori];
    } else {
        $arr = ['result' => 'ERROR', 'message' => $conn->error];
    }

} elseif ($action == "getBeritaByKategori") {
    $id_kategori = $_POST['id_kategori'] ?? 0;
    
    $sql = "SELECT b.*, a.nama as penerbit,
            GROUP_CONCAT(DISTINCT k.nama) as kategori_names
            FROM beritas b
            LEFT JOIN akuns a ON b.penerbit = a.email
            LEFT JOIN berita_has_kategori bhk ON b.id = bhk.id_berita
            LEFT JOIN kategoris k ON bhk.id_kategori = k.id
            WHERE bhk.id_kategori = ?
            GROUP BY b.id
            ORDER BY b.tanggal_rilis DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id_kategori);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result) {
        $berita = [];
        while ($row = $result->fetch_assoc()) {
            $berita[] = [
                'id' => $row['id'],
                'judul' => $row['judul'],
                'isi' => $row['isi_berita'],
                'foto' => $row['foto'],
                'tanggal_publish' => $row['tanggal_rilis'],
                'penerbit' => $row['penerbit'],
                'views' => $row['views'] ?? 0
            ];
        }
        $arr = ['result' => 'OK', 'data' => $berita];
    } else {
        $arr = ['result' => 'ERROR', 'message' => $conn->error];
    }
    $stmt->close();

} elseif ($action == "getBeritaByUser") {
    $emailUser = $_POST['emailUser'] ?? '';
    
    $sql = "SELECT b.*, a.nama as penerbit,
            GROUP_CONCAT(DISTINCT k.nama) as kategori_names
            FROM beritas b
            LEFT JOIN akuns a ON b.penerbit = a.email
            LEFT JOIN berita_has_kategori bhk ON b.id = bhk.id_berita
            LEFT JOIN kategoris k ON bhk.id_kategori = k.id
            WHERE b.penerbit = ?
            GROUP BY b.id
            ORDER BY b.tanggal_rilis DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $emailUser);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result) {
        $berita = [];
        while ($row = $result->fetch_assoc()) {
            $berita[] = [
                'id' => $row['id'],
                'judul' => $row['judul'],
                'isi' => $row['isi_berita'],
                'foto' => $row['foto'],
                'tanggal_publish' => $row['tanggal_rilis'],
                'penerbit' => $row['penerbit'],
                'views' => $row['views'] ?? 0
            ];
        }
        $arr = ['result' => 'OK', 'data' => $berita];
    } else {
        $arr = ['result' => 'ERROR', 'message' => $conn->error];
    }
    $stmt->close();

} elseif ($action == "tambahBerita") {
    $judul = $_POST['judul'] ?? '';
    $deskripsi = $_POST['deskripsi'] ?? '';
    $foto = $_POST['foto'] ?? 'default.jpg';
    $kategori = json_decode($_POST['kategori'] ?? '[]', true);
    $email_penerbit = $_POST['emailPenerbit'] ?? ''; // email dari logged user
    
    // Insert berita
    $sql = "INSERT INTO beritas (judul, isi_berita, foto, penerbit, tanggal_rilis, views, rating, jumlah_review, rekomendasi) 
            VALUES (?, ?, ?, ?, NOW(), 0, 0, 0, 0)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $judul, $deskripsi, $foto, $email_penerbit);
    
    if ($stmt->execute()) {
        $idBerita = $conn->insert_id;
        
        // Insert kategori
        if (!empty($kategori)) {
            $sqlKat = "INSERT INTO berita_has_kategori (id_berita, id_kategori) VALUES (?, ?)";
            $stmtKat = $conn->prepare($sqlKat);
            
            foreach ($kategori as $idKategori) {
                $stmtKat->bind_param("ii", $idBerita, $idKategori);
                $stmtKat->execute();
            }
            $stmtKat->close();
        }
        
        $arr = ['result' => 'OK', 'message' => 'Berita berhasil ditambahkan', 'id' => $idBerita];
    } else {
        $arr = ['result' => 'ERROR', 'message' => $conn->error];
    }
    $stmt->close();

} elseif ($action == "getDetailBerita") {
    $id = intval($_POST['id'] ?? 0);

    $sql = "SELECT b.*, a.nama AS penerbit
            FROM beritas b
            LEFT JOIN akuns a ON b.penerbit = a.email
            WHERE b.id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows === 1) {
        $row = $result->fetch_assoc();

        // Ambil foto tambahan dari tabel foto_berita (jika ada)
        $photos = [];
        $sqlFoto = "SELECT path_foto FROM foto_berita WHERE id_berita = ?";
        $stmtFoto = $conn->prepare($sqlFoto);
        $stmtFoto->bind_param("i", $id);
        $stmtFoto->execute();
        $resFoto = $stmtFoto->get_result();
        while ($f = $resFoto->fetch_assoc()) {
            $photos[] = $f['path_foto'];
        }
        $stmtFoto->close();

        // Pastikan foto utama ada di urutan pertama
        array_unshift($photos, $row['foto']);

        $arr = [
            'result' => 'OK',
            'data' => [
                'id' => $row['id'],
                'judul' => $row['judul'],
                'isi_berita' => $row['isi_berita'],
                'foto' => $row['foto'],
                'foto_list' => $photos,
                'tanggal_rilis' => $row['tanggal_rilis'],
                'penerbit' => $row['penerbit'],
                'rating' => floatval($row['rating']),
                'jumlah_review' => intval($row['jumlah_review']),
                'views' => intval($row['views'])
            ]
        ];
    } else {
        $arr = ['result' => 'ERROR', 'message' => 'Berita tidak ditemukan'];
    }
    $stmt->close();

} elseif ($action == "updateRating") {
    $id = intval($_POST['id'] ?? 0);
    $ratingBaru = floatval($_POST['ratingBaru'] ?? 0);

    $sql = "SELECT rating, jumlah_review FROM beritas WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res && $res->num_rows === 1) {
        $data = $res->fetch_assoc();
        $ratingLama = floatval($data['rating']);
        $jumlahReviewLama = intval($data['jumlah_review']);

        $jumlahBaru = $jumlahReviewLama + 1;
        $ratingBaruAvg = (($ratingLama * $jumlahReviewLama) + $ratingBaru) / $jumlahBaru;

        $sqlUp = "UPDATE beritas SET rating = ?, jumlah_review = ? WHERE id = ?";
        $stmtUp = $conn->prepare($sqlUp);
        $stmtUp->bind_param("dii", $ratingBaruAvg, $jumlahBaru, $id);

        if ($stmtUp->execute()) {
            $arr = [
                'result' => 'OK',
                'newRating' => round($ratingBaruAvg, 1),
                'newJumlahReview' => $jumlahBaru
            ];
        } else {
            $arr = ['result' => 'ERROR', 'message' => $conn->error];
        }
        $stmtUp->close();
    } else {
        $arr = ['result' => 'ERROR', 'message' => 'Berita tidak ditemukan'];
    }
    $stmt->close();

} elseif ($action == "hapusBerita") {
    $idBerita = $_POST['idBerita'] ?? 0;
    
    // Hapus kategori berita dulu
    $sqlKat = "DELETE FROM berita_has_kategori WHERE id_berita = ?";
    $stmtKat = $conn->prepare($sqlKat);
    $stmtKat->bind_param("i", $idBerita);
    $stmtKat->execute();
    $stmtKat->close();
    
    // Hapus berita
    $sql = "DELETE FROM beritas WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $idBerita);
    
    if ($stmt->execute()) {
        $arr = ['result' => 'OK', 'message' => 'Berita berhasil dihapus'];
    } else {
        $arr = ['result' => 'ERROR', 'message' => $conn->error];
    }
    $stmt->close();

// ================== USER ACTIONS ==================
} elseif ($action == "getDataUser") {
    $email = $_POST['email'];
    $pass  = $_POST['password'];
    
    $sql = "SELECT * FROM akuns WHERE email = ? AND password = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $email, $pass);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows == 1) {
        $row = $result->fetch_assoc();
        $arr = [
            "result" => "success",
            "email" => $row['email'],
            "password" => $row['password'],
            "nama" => $row['nama'],
            "alamat" => $row['alamat'],
            "gender" => $row['gender'],
            "tanggal_lahir" => $row['tanggal_lahir'],
            "foto" => $row['foto']
        ];
    } else {
        $arr = ["result" => "error", "message" => "Gagal login, username/password salah"];
    }
    $stmt->close();

} elseif ($action == "register") {
    $email = $_POST['email'];
    $pass  = $_POST['password'];
    $nama  = $_POST['nama'];
    $gender = $_POST['gender'];
    $alamat = $_POST['alamat'];
    $tgl    = $_POST['tanggal_lahir'];
    $foto = $_POST['foto'];
    
    if ($foto === '' || $foto === 'undefined') {
        $foto = 'default.png';
    }

    $sql = "INSERT INTO akuns (email, nama, password, gender, foto, alamat, tanggal_lahir) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "sssssss",
        $email,
        $nama,
        $pass,
        $gender,
        $foto,
        $alamat,
        $tgl
    );

    if ($stmt->execute()) {
        $arr = ["status" => "success", "message" => "Berhasil daftar"];
    } else {
        $arr = ["status" => "error", "message" => $conn->error];
    }
    $stmt->close();

} elseif ($action == "login") {
    $email = $_POST['email'];
    $pass = $_POST['pass'];
    
    $sql = "SELECT * FROM akuns WHERE email = ? AND password = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $email, $pass);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows == 1) {
        $row = $result->fetch_assoc();
        $arr = [
            "result" => "success",
            "email" => $row['email'],
            "password" => $row['password'],
            "nama" => $row['nama'],
            "alamat" => $row['alamat'],
            "gender" => $row['gender'],
            "tanggal_lahir" => $row['tanggal_lahir'],
            "foto" => $row['foto']
        ];
    } else {
        $arr = ["result" => "error", "message" => "Gagal login, username/password salah"];
    }
    $stmt->close();

} elseif ($action == "update") {
    $email = $_POST['email'];
    $pass  = $_POST['password'];
    $nama  = $_POST['nama'];
    $gender = $_POST['gender'];
    $alamat = $_POST['alamat'];
    $tgl    = $_POST['tanggal_lahir'];
    $foto   = $_POST['foto'];

    $sql = "UPDATE akuns SET nama=?, password=?, gender=?, alamat=?, tanggal_lahir=?, foto=? WHERE email=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssss", $nama, $pass, $gender, $alamat, $tgl, $foto, $email);

    if ($stmt->execute()) {
        $arr = [
            "result" => "success",
            "user_data" => [
                "email" => $email,
                "nama" => $nama,
                "password" => $pass,
                "gender" => $gender,
                "alamat" => $alamat,
                "tanggal_lahir" => $tgl,
                "foto" => $foto
            ]
        ];
    } else {
        $arr = ["result" => "error", "message" => $conn->error];
    }
    $stmt->close();

} else {
    $arr = ["result" => "error", "message" => "Invalid action"];
}

echo json_encode($arr);
$conn->close();
?>
