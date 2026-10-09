# The Origin Venerable

Novel kultivasi berlatar **Bandung, 2054–2057**.

Dhawa Razythan, anak buruh konstruksi dari kampung kontrakan, menemukan dunia tersembunyi setelah bintang ungu jatuh di Lembang. Bukan bakat. Bukan reinkarnasi. Hanya usaha, pengorbanan, dan harga yang harus dibayar.

Karya [Akbar Nawasunda](https://instagram.com/akbarnawasunda).

## Baca di web

Situs baca ada di folder `site/`.

```bash
python3 -m http.server 4173 --bind 0.0.0.0 --directory site
```

Lalu buka `http://localhost:4173`.

- **Awal** — sampul dan sinopsis
- **Baca** — Prolog sampai Bab 39, progres tersimpan di peramban
- **Dunia** — tokoh, Jalur Void, Lesh, 11 level, timeline
- **Tentang** — catatan penulis

Tema: malam, senja, atau kertas. Panah kiri/kanan untuk pindah bab.

## Isi repositori

```
manuscript/          naskah + series bible
  THE ORIGIN VENERABLE.md
  SERIES BIBLE.md
site/                situs baca statis
  index.html
  baca.html
  dunia.html
  tentang.html
  data/chapters/     bab dalam JSON
scripts/parse-novel.mjs
```

README lama yang menumpuk bible + naskah sudah diurai. Sumber kebenaran lore tetap `manuscript/SERIES BIBLE.md`.

## Naskah

Volume I masih berjalan. Saat ini:

- Prolog + **39 bab** (terakhir: *Lautan Kesadaran*)
- ± **119.000 kata**
- Target Volume I: Bab 1–90, Dhawa masih Level 0

Untuk memecah naskah ulang ke JSON setelah ada bab baru:

```bash
node scripts/parse-novel.mjs
```

## Aturan cerita (singkat)

- POV ketiga terbatas, fokus Dhawa
- Tidak ada Qi / Dantian / Realm
- 7 Jalur Void + Kesadaran Ilahi
- Dhawa **bukan** anak berbakat
- Minimal slowburn: setengah hari per bab
