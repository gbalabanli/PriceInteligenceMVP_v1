# PriceInteligenceMVP_v1

Statik (`HTML/CSS/JS`) çalışan, yapay zeka destekli rekabetçi e-ticaret fiyatlandırma mockup'ı.

## 1) Hızlı Başlangıç

### Gereksinimler
- Python 3 (önerilen) veya herhangi bir statik dosya sunucusu
- Modern bir tarayıcı (Chrome/Edge/Firefox)

### Çalıştırma (Windows / PowerShell)
```powershell
cd C:\Users\Bora\Desktop\Workspace\agents\PriceInteligenceMVP_v1
python -m http.server 4173
```

Tarayıcıda aç:
```text
http://127.0.0.1:4173/index.html#/dashboard
```

Not:
- `file://` ile doğrudan açmak yerine local server kullanın.
- Uygulama backend istemez; tüm veri mock ve tarayıcı tarafındadır.

## 2) Proje Yapısı

```text
index.html
assets/
  css/styles.css
  js/app.js
  js/i18n.js
  js/data.js
docs/
  action_matrix.md
  phases/
  artifacts/
```

## 3) Sayfalar ve Ne İşe Yarar

### Sol Menü Sayfaları

1. `#/dashboard` - Genel Bakış  
   KPI kartları, kritik SKU listesi ve son öneriler görünür. Demo akışına başlangıç noktasıdır.

2. `#/yz-fiyat-onerileri` - YZ Fiyat Önerileri  
   Bekleyen/işlenen önerileri yönetirsiniz. Tekil veya toplu onay/reddet/uygula aksiyonları vardır.

3. `#/dynamic-pricing` - Dinamik Fiyatlandırma  
   `Manual`/`Auto-Sim` modları, simülasyon çalıştırma, önizleme, uygulama ve geri alma akışını gösterir.

4. `#/ab-testing` - A/B Fiyatlandırma Testi  
   Test geçmişi, lift metriği, aralık filtresi ve snapshot export akışını gösterir.

### Header İkon Sayfaları

5. `#/settings` - Ayarlar  
   Dil, para birimi ve compact mode gibi tercihleri kaydedersiniz (`localStorage`).

6. `#/scenario-lab` - Scenario Lab  
   Mock senaryo yükleme ve reseed işlemleri ile demo datasını farklılaştırır.

### Drill-down Sayfalar

7. `#/price-monitoring` - Fiyat İzleme  
   Dashboard'dan “Kritik SKU'ları Gör” ile açılır. Filtre/sıralama/çoklu seçim ile öneri üretim akışına veri taşır.

8. `#/product-detail` - Ürün Detay  
   Satır “Detay Aç” aksiyonlarıyla açılır. Ürün özelinde öneri kararı (onay/red) ve not ekleme yapılır.

## 4) Nasıl Test Edeceğim? (Manuel Test Senaryosu)

## Senaryo A - Navigasyon ve Dil
1. `#/dashboard` açın.
2. Sol menüdeki 4 sayfaya sırayla gidin.
3. Header'dan `TR`/`EN` değiştirin.
4. Beklenen: Menü, başlıklar ve butonlar anında dil değiştirir.

## Senaryo B - YZ Önerileri Akışı
1. `#/yz-fiyat-onerileri` sayfasına gidin.
2. `Filtrele` ile filtre panelini açın, risk seçin.
3. Başlıktaki checkbox ile toplu seçim yapın.
4. `Seçilenleri Onayla` tıklayın.
5. Beklenen: Bekleyen kayıtlar işlenir, durumlar güncellenir, toast görünür.

## Senaryo C - Dinamik Fiyatlandırma Akışı
1. `#/dynamic-pricing` açın.
2. `Auto-Sim` seçin ve `Simülasyonu Başlat` tıklayın.
3. Bir satırda `Önizleme` -> `Uygula` yapın.
4. Dashboard'a dönüp ürün üzerinde `Simülasyon` etiketi kontrol edin.
5. Geri dönüp `Geri Al` deneyin (onay modalı açılmalı).

## Senaryo D - A/B Test Akışı
1. `#/ab-testing` sayfasına gidin.
2. Tarih aralığını değiştirip `Tarih Aralığını Uygula` tıklayın.
3. `Yeni Test Başlat` tıklayın.
4. `Snapshot İndir` ile JSON dosyası inmesini doğrulayın.

## Senaryo E - Ayarlar ve Kalıcılık
1. `#/settings` açın.
2. `Compact mode` aktif edin, dil/para birimini değiştirin.
3. `Tercihleri Kaydet` tıklayın.
4. Sayfalar arası gezinip kompakt görünümün ve dilin korunduğunu kontrol edin.

## Senaryo F - Scenario Lab
1. Header'dan `Scenario Lab` açın.
2. Bir senaryo yükleyin.
3. Beklenen: Uygulama son regular route'a döner, veri seti değişir.
4. `Rastgele Değerleri Yeniden Üret` ile reseed etkisini gözlemleyin.

## 5) Hızlı Kabul Kriterleri

- Tüm sol menü sayfaları açılıyor.
- Header ikonları (`Ayarlar`, `Scenario Lab`) çalışıyor.
- Destructive aksiyonlar onay modalı istiyor (`reset`, `reject`, `rollback`).
- Dil değişimi tüm UI'da anlık yansıyor.
- Konsolda runtime JS hatası yok.

## 6) Sorun Giderme

### Port zaten kullanımda
Başka bir portla çalıştırın:
```powershell
python -m http.server 4180
```
ve URL'yi `http://127.0.0.1:4180/index.html#/dashboard` olarak açın.

### Eski state yüzünden beklenmeyen davranış
Tarayıcı Local Storage temizleyin veya Dashboard'da `Demo Durumunu Sıfırla` kullanın.

## 7) Notlar

- Bu proje bir mockup'tır; üretim otomatik fiyatlandırma sistemi değildir.
- Dinamik fiyatlandırma davranışları deterministik simülasyondur.
