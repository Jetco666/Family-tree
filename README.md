# Family Tree — GitHub Pages

Prototype static interactive family tree.

## Fitur
- Interactive zoom/pan
- Klik anggota untuk membuka profil
- Pencarian nama
- Relasi orang tua, pasangan, dan anak
- Dark/light mode
- Responsive untuk HP
- Tanpa database
- Tanpa backend
- Cocok untuk GitHub Pages

## Mengganti data keluarga
Edit `family-data.js`.

Contoh:
```js
{
  id:"p10",
  name:"Nama Anggota",
  gender:"M",
  birth:"1975",
  city:"Batam",
  parentIds:["p3","p4"],
  spouseIds:["p11"],
  photo:"foto/nama.jpg",
  bio:"Keterangan singkat."
}
```

`parentIds` menentukan garis keturunan. `spouseIds` menentukan pasangan.

## Upload ke GitHub Pages
1. Buat repository baru, misalnya `family-tree`.
2. Upload `index.html`, `style.css`, `app.js`, `family-data.js`.
3. Opsional buat folder `foto` untuk gambar keluarga.
4. GitHub → Settings → Pages.
5. Source: Deploy from branch.
6. Branch: `main`, folder `/root`.
7. Save.
8. Tunggu deployment.
9. Link akan berbentuk `https://USERNAME.github.io/family-tree/`.

## Catatan keamanan
Ini adalah website statis. Tidak ada panel admin sungguhan dan tidak ada autentikasi. Siapa pun yang memiliki akses tulis ke repository dapat mengubah data. Untuk data keluarga sensitif, jangan memasukkan informasi pribadi yang tidak perlu.
