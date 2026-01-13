<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include("koneksi.php");
extract($_POST);

// Constants
define('UPLOAD_DIR', 'images/');
define('IMAGE_BASE_URL', 'https://ubaya.cloud/hybrid/160423183/images/');

// Helper function to upload additional photos
function uploadAdditionalPhotos($idBerita, $conn) {
    $additionalPhotos = $_FILES['additionalPhotos'] ?? [];
    if (empty($additionalPhotos['name'][0])) {
        return true;
    }
    
    for ($i = 0; $i < count($additionalPhotos['name']); $i++) {
        if ($additionalPhotos['error'][$i] === UPLOAD_ERR_OK) {
            $ext = pathinfo($additionalPhotos['name'][$i], PATHINFO_EXTENSION);
            $filename = uniqid("berita_additional_") . "." . $ext;
            
            if (move_uploaded_file($additionalPhotos['tmp_name'][$i], UPLOAD_DIR . $filename)) {
                $photoPath = IMAGE_BASE_URL . $filename;
                
                $sqlFoto = "INSERT INTO foto_berita (id_berita, path_foto) VALUES (?, ?)";
                $stmtFoto = $conn->prepare($sqlFoto);
                $stmtFoto->bind_param("is", $idBerita, $photoPath);
                $stmtFoto->execute();
                $stmtFoto->close();
            }
        }
    }
    return true;
}

$action = $_POST['action'];

#CREATE
    if ($action == "tambahBerita") {
        $judul = $_POST['judul'] ?? '';
        $deskripsi = $_POST['deskripsi'] ?? '';
        $kategori = json_decode($_POST['kategori'] ?? '[]', true);
        $email_penerbit = $_POST['emailPenerbit'] ?? '';

        // Handle main photo upload
        $mainPhotoFile = $_FILES['mainPhoto'] ?? null;
        $mainPhotoPath = 'default.jpg';
        
        if (!$mainPhotoFile) {
            $arr = ['result' => 'ERROR', 'message' => 'File foto tidak ditemukan'];
            echo json_encode($arr);
            exit;
        }
        
        if ($mainPhotoFile['error'] !== UPLOAD_ERR_OK) {
            $arr = ['result' => 'ERROR', 'message' => 'Error upload foto'];
            echo json_encode($arr);
            exit;
        }
        
        $uploadDir = "images/";
        $ext = pathinfo($mainPhotoFile['name'], PATHINFO_EXTENSION);
        $filename = uniqid("berita_main_") . "." . $ext;
        
        if (!move_uploaded_file($mainPhotoFile['tmp_name'], UPLOAD_DIR . $filename)) {
            $arr = ['result' => 'ERROR', 'message' => 'Gagal memindahkan file ke folder images/'];
            echo json_encode($arr);
            exit;
        }
        
        $mainPhotoPath = IMAGE_BASE_URL . $filename;

        // Insert berita
        $sql = "INSERT INTO beritas (judul, isi_berita, foto, penerbit, tanggal_rilis, views, rating, jumlah_review, rekomendasi) 
                    VALUES (?, ?, ?, ?, NOW(), 0, 0, 0, 0)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssss", $judul, $deskripsi, $mainPhotoPath, $email_penerbit);

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

            // Handle additional photos upload
            uploadAdditionalPhotos($idBerita, $conn);

            $arr = ['result' => 'OK', 'message' => 'Berita berhasil ditambahkan', 'id' => $idBerita];
        } else {
            $arr = ['result' => 'ERROR', 'message' => $conn->error];
        }
        $stmt->close();
    } elseif ($action == "addKategori") {
        $nama_baru = $_POST['nama'] ?? '';

        if (!empty($nama_baru)) {
            $sql = "INSERT INTO kategoris (nama) VALUES (?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $nama_baru);

            if ($stmt->execute()) {
                $arr = ['result' => 'OK', 'message' => 'Kategori berhasil ditambahkan'];
            } else {
                $arr = ['result' => 'ERROR', 'message' => 'Gagal menyimpan ke database: ' . $conn->error];
            }
            $stmt->close();
        } else {
            $arr = ['result' => 'ERROR', 'message' => 'Nama kategori tidak boleh kosong'];
        }
    } elseif ($action == "register") {
        $email = $_POST['email'];
        $pass  = $_POST['password'];
        $nama  = $_POST['nama'];
        $gender = $_POST['gender'];
        $alamat = $_POST['alamat'];
        $tgl    = $_POST['tanggal_lahir'];
        $foto = $_POST['foto'];
        $filefoto = $_FILES['fotoFile'];

        if ($filefoto === null || $filefoto['error'] !== UPLOAD_ERR_OK) {
            $arr = ["result" => "ERROR", "message" => "Foto file tidak valid"];
            echo json_encode($arr);
            exit;
        }
        $uploadDir = "images/";
        $ext = pathinfo($filefoto['name'], PATHINFO_EXTENSION);
        $filename = uniqid("foto_") . "." . $ext;

        if (!move_uploaded_file($filefoto['tmp_name'], $uploadDir . $filename)) {
            $arr = ["result" => "ERROR", "message" => "Gagal upload foto"];
            echo json_encode($arr);
            exit;
        }

        $foto = 'https://ubaya.cloud/hybrid/160423183/' . $uploadDir . $filename;

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
            $arr = ["result" => "OK", "message" => "Berhasil daftar"];
        } else {
            $arr = ["result" => "ERROR", "message" => $conn->error];
        }
        $stmt->close();
    } elseif ($action == "addKomentarBerita") {
        $idBerita = $_POST['idBerita'] ?? 0;
        $emailUser = $_POST['emailUser'] ?? '';
        $komentar = $_POST['komentar'] ?? '';

        if ($idBerita > 0 && !empty($emailUser) && !empty($komentar)) {
            $sqlInsert = "INSERT INTO komentar_berita (idberita, emailuser, komentar, tanggal) VALUES (?, ?, ?, NOW())";
            $stmtInsert = $conn->prepare($sqlInsert);
            $stmtInsert->bind_param("iss", $idBerita, $emailUser, $komentar);

            if ($stmtInsert->execute()) {
                $arr = ['result' => 'OK', 'message' => 'Komentar berhasil ditambahkan'];
            } else {
                $arr = ['result' => 'ERROR', 'message' => 'Gagal menambahkan komentar'];
            }
        } else {
            $arr = ['result' => 'ERROR', 'message' => 'Invalid parameters'];
        }
    }
#READ
    elseif ($action == "getDetailBerita") {
        $idBerita = $_POST['id'] ?? 0;
        $emailUser = $_POST['emailUser'] ?? '';

        if ($idBerita > 0) {
            $sql = "SELECT b.*, 
                    CASE
                        WHEN b.id IN (SELECT idberita FROM akun_has_favorit WHERE emailakun = ?) THEN 'TRUE'
                        ELSE 'FALSE'
                    END AS is_favorit,
                    CASE 
                        WHEN (SELECT rating FROM berita_has_rating WHERE idberita = b.id AND emailakun = ?) IS NOT NULL 
                        THEN (SELECT rating FROM berita_has_rating WHERE idberita = b.id AND emailakun = ?)
                        ELSE 0
                    END AS rating_user
                FROM beritas b
                WHERE b.id = ?;";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sssi", $emailUser, $emailUser, $emailUser, $idBerita);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($row = $result->fetch_assoc()) {
                $photos = [];
                $sqlFoto = "SELECT path_foto FROM foto_berita WHERE id_berita = ? ORDER BY id";
                $stmtFoto = $conn->prepare($sqlFoto);
                $stmtFoto->bind_param("i", $idBerita);
                $stmtFoto->execute();
                $resFoto = $stmtFoto->get_result();
                while ($f = $resFoto->fetch_assoc()) {
                    $photos[] = $f['path_foto'];
                }
                $stmtFoto->close();

                array_unshift($photos, $row['foto']);

                $row['foto_list'] = $photos;

                // Get kategori IDs
                $kategoriIds = [];
                $sqlKat = "SELECT id_kategori FROM berita_has_kategori WHERE id_berita = ?";
                $stmtKat = $conn->prepare($sqlKat);
                $stmtKat->bind_param("i", $idBerita);
                $stmtKat->execute();
                $resKat = $stmtKat->get_result();
                while ($k = $resKat->fetch_assoc()) {
                    $kategoriIds[] = intval($k['id_kategori']);
                }
                $stmtKat->close();
                $row['kategori_ids'] = $kategoriIds;

                $arr = ['result' => 'OK', 'data' => $row];
            } else {
                $arr = ['result' => 'ERROR', 'message' => 'Berita tidak ditemukan'];
            }
            $stmt->close();
        } else {
            $arr = ['result' => 'ERROR', 'message' => 'ID berita tidak valid'];
        }
    } elseif ($action == "getAllBerita") {
        $sql = "SELECT b.id, b.judul, b.tanggal_rilis, b.foto, b.isi_berita, a.nama as penerbit, b.rating, b.jumlah_review, b.rekomendasi, b.views, 
                    GROUP_CONCAT(DISTINCT k.nama) as kategori_names
                    FROM beritas b
                    LEFT JOIN akuns a ON b.penerbit = a.email
                    LEFT JOIN berita_has_kategori bhk ON b.id = bhk.id_berita
                    LEFT JOIN kategoris k ON bhk.id_kategori = k.id
                    GROUP BY b.id
                    ORDER BY b.tanggal_rilis DESC";

        $result = $conn->query($sql);

        if ($result) {
            $berita = array();
            while ($row = $result->fetch_assoc()) {
                $berita[] = $row;
            }
            $arr = ['result' => 'OK', 'data' => $berita];
        } else {
            $arr = ['result' => 'ERROR', 'message' => $conn->error];
        }
    } elseif ($action == "getAllKategory") {
        $sql = "SELECT * FROM kategoris ORDER BY nama";
        $result = $conn->query($sql);

        if ($result) {
            $kategori = array();
            while ($row = $result->fetch_assoc()) {
                $kategori[] = $row;
            }
            $arr = ['result' => 'OK', 'data' => $kategori];
        } else {
            $arr = ['result' => 'ERROR', 'message' => $conn->error];
        }
    } elseif ($action == "getBeritaByKategori") {
        $id_kategori = $_POST['id_kategori'] ?? 0;

        $sql = "SELECT b.id, b.judul, b.tanggal_rilis, b.foto, b.isi_berita, a.nama as penerbit, b.rating, b.jumlah_review, b.rekomendasi, b.views,
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
            $berita = array();
            while ($row = $result->fetch_assoc()) {
                $berita[] = $row;
            }
            $arr = ['result' => 'OK', 'data' => $berita];
        } else {
            $arr = ['result' => 'ERROR', 'message' => $conn->error];
        }
        $stmt->close();
    } elseif ($action == "getBeritaByUser") {
        $emailUser = $_POST['emailUser'] ?? '';

        $sql = "SELECT  b.id, b.judul, b.tanggal_rilis, b.foto, b.isi_berita, a.nama as penerbit, b.rating, b.jumlah_review, b.rekomendasi, b.views,
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
            $berita = array();
            while ($row = $result->fetch_assoc()) {
                $berita[] = $row;
            }
            $arr = ['result' => 'OK', 'data' => $berita];
        } else {
            $arr = ['result' => 'ERROR', 'message' => $conn->error];
        }
        $stmt->close();
    } elseif ($action == "getBeritabyRekomendasi") {
        $sql = "SELECT * FROM beritas WHERE rekomendasi = 1";
        $result = $conn->query($sql);
        $data = array();

        if ($result->num_rows > 0) {
            while ($r = $result->fetch_assoc()) {
                $data[] = $r;
            }
            $arr = ['result' => 'OK', 'data' => $data];
        } else {
            $arr = ['result' => 'ERROR', 'message' => 'Tidak ada berita rekomendasi'];
        }
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
                "result" => "OK",
                "email" => $row['email'],
                "password" => $row['password'],
                "nama" => $row['nama'],
                "alamat" => $row['alamat'],
                "gender" => $row['gender'],
                "tanggal_lahir" => $row['tanggal_lahir'],
                "foto" => $row['foto']
            ];
        } else {
            $arr = ["result" => "ERROR", "message" => "Gagal login, username/password salah"];
        }
        $stmt->close();
    } elseif ($action == "getBeritaFavorite") {
        $emailUser = $_POST['emailUser'] ?? '';

        $sql = "SELECT b.id, b.judul, b.tanggal_rilis, b.foto, b.isi_berita, a.nama as penerbit, b.rating, b.jumlah_review, b.rekomendasi, b.views, 
                    GROUP_CONCAT(DISTINCT k.nama) as kategori_names
                    FROM beritas b
                    LEFT JOIN akuns a ON b.penerbit = a.email
                    LEFT JOIN berita_has_kategori bhk ON b.id = bhk.id_berita
                    LEFT JOIN kategoris k ON bhk.id_kategori = k.id
                    WHERE b.id IN (
                        SELECT idberita FROM akun_has_favorit WHERE emailakun = ?
                    )
                    GROUP BY b.id
                    ORDER BY b.tanggal_rilis DESC";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $emailUser);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result) {
            $berita = array();
            while ($row = $result->fetch_assoc()) {
                $berita[] = $row;
            }
            $arr = ['result' => 'OK', 'data' => $berita];
        } else {
            $arr = ['result' => 'ERROR', 'message' => $conn->error];
        }
    } elseif ($action == "getKomentarBerita") {
        $idBerita = $_POST['idBerita'] ?? 0;

        if ($idBerita > 0) {
            $sql = "SELECT kb.id, kb.komentar, kb.tanggal, a.nama AS nama_user, a.foto AS foto_user
                        FROM komentar_berita kb
                        JOIN akuns a ON kb.emailuser = a.email
                        WHERE kb.idberita = ?
                        ORDER BY kb.tanggal DESC";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $idBerita);
            $stmt->execute();
            $result = $stmt->get_result();

            $komentarList = array();
            while ($row = $result->fetch_assoc()) {
                $komentarList[] = $row;
            }

            $arr = ['result' => 'OK', 'data' => $komentarList];
            $stmt->close();
        } else {
            $arr = ['result' => 'ERROR', 'message' => 'Invalid berita ID'];
        }
    }
#UPDATE
    elseif ($action == "updateRating") {
        $idBerita = $_POST['id'] ?? 0;
        $rating = $_POST['rating'] ?? 0;
        $emailUser = $_POST['emailUser'] ?? ''; // Email user yang memberi rating

        if ($idBerita > 0 && $rating > 0) {
            //insert or update berita_has_rating
            $sqlInsertRating = "INSERT INTO berita_has_rating (idberita, emailakun, rating) VALUES (?, ?, ?)
                                    ON DUPLICATE KEY UPDATE rating = ?";

            $stmtInsertRating = $conn->prepare($sqlInsertRating);
            $stmtInsertRating->bind_param("isii", $idBerita, $emailUser, $rating, $rating);
            $stmtInsertRating->execute();
            $stmtInsertRating->close();

            // 1. Ambil data rating saat ini dari database
            $sqlFetch = "SELECT COUNT(*) as jumlah_review, COALESCE(SUM(rating), 0) as total_rating
                        FROM berita_has_rating
                        WHERE idberita = ?";

            $stmtFetch = $conn->prepare($sqlFetch);
            $stmtFetch->bind_param("i", $idBerita);
            $stmtFetch->execute();
            
            $result = $stmtFetch->get_result();

            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $currentJumlahReview = $row['jumlah_review'];
                $currentTotalRating = $row['total_rating'];
                $currentRating = $currentJumlahReview > 0 ? round($currentTotalRating / $currentJumlahReview, 1) : 0;

                $sqlUpdate = "UPDATE beritas SET rating = ?, jumlah_review = ? WHERE id = ?";
                $stmtUpdate = $conn->prepare($sqlUpdate);
                $stmtUpdate->bind_param("dii", $currentRating, $currentJumlahReview, $idBerita);

                if ($stmtUpdate->execute()) {
                    $arr = ["result" => "OK", 'message' => 'Rating berhasil diupdate'];
                } else {
                    $arr = ['result' => 'ERROR', 'message' => 'Gagal update rating'];
                }
                $stmtUpdate->close();
            } else {
                $arr = ['result' => 'ERROR', 'message' => 'Berita tidak ditemukan'];
            }
            $stmtFetch->close();
        } else {
            $arr = ['result' => 'ERROR', 'message' => 'Data tidak valid'];
        }
    } elseif ($action == "editBerita") {
        $idBerita = intval($_POST['id'] ?? 0);
        $judul = $_POST['judul'] ?? '';
        $deskripsi = $_POST['deskripsi'] ?? '';
        $kategori = json_decode($_POST['kategori'] ?? '[]', true);
        $email_penerbit = $_POST['emailPenerbit'] ?? '';
        $removedPhotoIndices = json_decode($_POST['removedPhotoIndices'] ?? '[]', true);

        if ($idBerita <= 0) {
            $arr = ['result' => 'ERROR', 'message' => 'ID berita tidak valid'];
            echo json_encode($arr);
            exit;
        }

        // Handle main photo update (opsional)
        $mainPhotoFile = $_FILES['mainPhoto'] ?? null;
        $updateMainPhoto = false;
        $mainPhotoPath = '';
        
        if ($mainPhotoFile && $mainPhotoFile['error'] === UPLOAD_ERR_OK) {
            $updateMainPhoto = true;
            $ext = pathinfo($mainPhotoFile['name'], PATHINFO_EXTENSION);
            $filename = uniqid("berita_main_") . "." . $ext;
            
            if (move_uploaded_file($mainPhotoFile['tmp_name'], UPLOAD_DIR . $filename)) {
                $mainPhotoPath = IMAGE_BASE_URL . $filename;
            } else {
                $updateMainPhoto = false;
            }
        }

        // Update berita
        if ($updateMainPhoto) {
            $sqlUpdate = "UPDATE beritas SET judul=?, isi_berita=?, foto=?, tanggal_rilis=NOW() WHERE id=?";
            $stmtUpdate = $conn->prepare($sqlUpdate);
            $stmtUpdate->bind_param("sssi", $judul, $deskripsi, $mainPhotoPath, $idBerita);
        } else {
            $sqlUpdate = "UPDATE beritas SET judul=?, isi_berita=?, tanggal_rilis=NOW() WHERE id=?";
            $stmtUpdate = $conn->prepare($sqlUpdate);
            $stmtUpdate->bind_param("ssi", $judul, $deskripsi, $idBerita);
        }

        if ($stmtUpdate->execute()) {
            // Update kategori
            $sqlDelKat = "DELETE FROM berita_has_kategori WHERE id_berita = ?";
            $stmtDelKat = $conn->prepare($sqlDelKat);
            $stmtDelKat->bind_param("i", $idBerita);
            $stmtDelKat->execute();
            $stmtDelKat->close();

            if (!empty($kategori)) {
                $sqlKat = "INSERT INTO berita_has_kategori (id_berita, id_kategori) VALUES (?, ?)";
                $stmtKat = $conn->prepare($sqlKat);
                foreach ($kategori as $idKategori) {
                    $stmtKat->bind_param("ii", $idBerita, $idKategori);
                    $stmtKat->execute();
                }
                $stmtKat->close();
            }

            // Handle removed photos
            if (!empty($removedPhotoIndices)) {
                // Get all existing additional photos for this berita
                $sqlGetFotos = "SELECT id, path_foto FROM foto_berita WHERE id_berita = ? ORDER BY id";
                $stmtGetFotos = $conn->prepare($sqlGetFotos);
                $stmtGetFotos->bind_param("i", $idBerita);
                $stmtGetFotos->execute();
                $resultFotos = $stmtGetFotos->get_result();
                $existingPhotos = [];
                while ($row = $resultFotos->fetch_assoc()) {
                    $existingPhotos[] = $row;
                }
                $stmtGetFotos->close();

                // Delete photos by their actual indices
                foreach ($removedPhotoIndices as $idx) {
                    // Index 0 is main photo (not in foto_berita table)
                    // Index 1+ are additional photos in foto_berita table
                    $arrayIndex = $idx - 1; // Convert to 0-based array index
                    if ($arrayIndex >= 0 && isset($existingPhotos[$arrayIndex])) {
                        $photoId = $existingPhotos[$arrayIndex]['id'];
                        $photoPath = $existingPhotos[$arrayIndex]['path_foto'];
                        
                        // Delete physical file
                        $filename = basename($photoPath);
                        $filePath = UPLOAD_DIR . $filename;
                        if (file_exists($filePath)) {
                            unlink($filePath);
                        }
                        
                        // Delete from database
                        $sqlDelFoto = "DELETE FROM foto_berita WHERE id = ?";
                        $stmtDelFoto = $conn->prepare($sqlDelFoto);
                        $stmtDelFoto->bind_param("i", $photoId);
                        $stmtDelFoto->execute();
                        $stmtDelFoto->close();
                    }
                }
            }

            // Handle additional photos upload
            uploadAdditionalPhotos($idBerita, $conn);

            $arr = ['result' => 'OK', 'message' => 'Berita berhasil diupdate'];
        } else {
            $arr = ['result' => 'ERROR', 'message' => 'Gagal update berita: ' . $conn->error];
        }
        $stmtUpdate->close();
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
        $stmt->bind_param(
            "sssssss",
            $nama,
            $pass,
            $gender,
            $alamat,
            $tgl,
            $foto,
            $email
        );
        if ($stmt->execute()) {
            $arr = ["result" => "OK", "message" => "Berhasil update profil"];
        } else {
            $arr = ["result" => "ERROR", "message" => $conn->error];
        }
        $stmt->close();
    } elseif ($action == "addViewBerita") {
        $idBerita = $_POST['idBerita'] ?? 0;

        if ($idBerita > 0) {
            // Update views count
            $sqlUpdate = "UPDATE beritas SET views = views + 1 WHERE id = ?";
            $stmtUpdate = $conn->prepare($sqlUpdate);
            $stmtUpdate->bind_param("i", $idBerita);

            if ($stmtUpdate->execute()) {
                $arr = ['result' => 'OK', 'message' => 'View updated'];
            } else {
                $arr = ['result' => 'ERROR', 'message' => 'Failed to update view count'];
            }
            $stmtUpdate->close();
        } else {
            $arr = ['result' => 'ERROR', 'message' => 'Invalid berita ID'];
        }
    } elseif ($action == "hapusFavoritBerita") {
        $idBerita = $_POST['idBerita'] ?? 0;
        $emailUser = $_POST['emailUser'] ?? '';

        if ($idBerita > 0 && !empty($emailUser)) {
            $sqlDelete = "DELETE FROM akun_has_favorit WHERE emailakun = ? AND idberita = ?";
            $stmtDelete = $conn->prepare($sqlDelete);
            $stmtDelete->bind_param("si", $emailUser, $idBerita);

            if ($stmtDelete->execute()) {
                $arr = ['result' => 'OK', 'message' => 'Berita dihapus dari favorit'];
            } else {
                $arr = ['result' => 'ERROR', 'message' => 'Gagal menghapus dari favorit'];
            }
            $stmtDelete->close();
        } else {
            $arr = ['result' => 'ERROR', 'message' => 'Invalid parameters'];
        }
    } elseif ($action == "tambahFavoritBerita") {
        $idBerita = $_POST['idBerita'] ?? 0;
        $emailUser = $_POST['emailUser'] ?? '';

        if ($idBerita > 0 && !empty($emailUser)) {
            $sqlInsert = "INSERT INTO akun_has_favorit (emailakun, idberita) VALUES (?, ?)";
            $stmtInsert = $conn->prepare($sqlInsert);
            $stmtInsert->bind_param("si", $emailUser, $idBerita);

            if ($stmtInsert->execute()) {
                $arr = ['result' => 'OK', 'message' => 'Berita ditambahkan ke favorit'];
            } else {
                $arr = ['result' => 'ERROR', 'message' => 'Gagal menambahkan ke favorit'];
            }
            $stmtInsert->close();
        } else {
            $arr = ['result' => 'ERROR', 'message' => 'Invalid parameters'];
        }
    }
#DELETE
    elseif ($action == "hapusBerita") {
        $idBerita = $_POST['idBerita'] ?? 0;

        // Get main photo path
        $sqlGetBerita = "SELECT foto FROM beritas WHERE id = ?";
        $stmtGetBerita = $conn->prepare($sqlGetBerita);
        $stmtGetBerita->bind_param("i", $idBerita);
        $stmtGetBerita->execute();
        $resultBerita = $stmtGetBerita->get_result();
        if ($beritaData = $resultBerita->fetch_assoc()) {
            $mainPhotoPath = $beritaData['foto'];
            // Delete main photo file
            $mainFilename = basename($mainPhotoPath);
            $mainFilePath = UPLOAD_DIR . $mainFilename;
            if (file_exists($mainFilePath)) {
                unlink($mainFilePath);
            }
        }
        $stmtGetBerita->close();

        // Get and delete all additional photos
        $sqlGetFotos = "SELECT path_foto FROM foto_berita WHERE id_berita = ?";
        $stmtGetFotos = $conn->prepare($sqlGetFotos);
        $stmtGetFotos->bind_param("i", $idBerita);
        $stmtGetFotos->execute();
        $resultFotos = $stmtGetFotos->get_result();
        while ($fotoData = $resultFotos->fetch_assoc()) {
            $photoPath = $fotoData['path_foto'];
            $filename = basename($photoPath);
            $filePath = UPLOAD_DIR . $filename;
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }
        $stmtGetFotos->close();

        // Delete from foto_berita table
        $sqlDelFotos = "DELETE FROM foto_berita WHERE id_berita = ?";
        $stmtDelFotos = $conn->prepare($sqlDelFotos);
        $stmtDelFotos->bind_param("i", $idBerita);
        $stmtDelFotos->execute();
        $stmtDelFotos->close();

        // Hapus kategori berita
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
    } elseif ($action == "deleteKategori") {
        $id = $_POST['id'] ?? '';

        if (!empty($id)) {
            $sql = "DELETE FROM kategoris WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);

            if ($stmt->execute()) {
                $arr = ['result' => 'OK', 'message' => 'Kategori berhasil dihapus'];
            } else {
                $arr = ['result' => 'ERROR', 'message' => 'Gagal menghapus data: ' . $conn->error];
            }
            $stmt->close();
        } else {
            $arr = ['result' => 'ERROR', 'message' => 'ID kategori tidak ditemukan'];
        }
    } elseif ($action == "hapusKomentarBerita") {
        $idKomentar = $_POST['idKomentar'] ?? 0;

        if ($idKomentar > 0) {
            $sql = "DELETE FROM komentar_berita WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $idKomentar);

            if ($stmt->execute()) {
                $arr = ['result' => 'OK', 'message' => 'Komentar berhasil dihapus'];
            } else {
                $arr = ['result' => 'ERROR', 'message' => 'Gagal menghapus komentar'];
            }
            $stmt->close();
        } else {
            $arr = ['result' => 'ERROR', 'message' => 'Invalid komentar ID'];
        }

    }
#ELSE
else {
    $arr = ["result" => "ERROR", "message" => "Invalid action"];
}

echo json_encode($arr);
$conn->close();
