# PriceSmart AI V1 Genel Bakış İskeleti

PriceSmart AI, e-ticaret ekiplerinin yanlış fiyat yüzünden kaybettiği geliri görünür kılmak için hazırlanmış statik bir mockup'tır.
Bu iterasyonda `Genel Bakış`, `YZ Fiyat Önerileri` ve `Dinamik Fiyatlandırma` sayfaları vardır. Uygulama tamamen `HTML + CSS + vanilla JS` ile yazılmıştır ve `file://` altında çalışır.

## Bu iterasyonda neler var

- `#/dashboard`, `#/yz-fiyat-onerileri` ve `#/dinamik-fiyatlandirma` route'ları
- Sol menüde `Genel Bakış`, `YZ Fiyat Önerileri` ve `Dinamik Fiyatlandırma` aktif
- Referans tasarıma yakın korunan üst header
- Problem/çözüm bandı
- 4 KPI kartı
- `Market Pulse` modülü
- `Takip Edilen Ürünler` tablosu
- Sağ drawer ile çalışan `Ürün Ekle` akışı
- Ürün satırına tıklayınca açılan rakip detay drawer'ı
- Dinamik fiyatlandırma için strateji kartları, hedef seçimi, YZ özet paneli ve aktif atama listesi

## Çalıştırma

Sunucu gerekmez.

1. `index.html` dosyasını çift tıklayın.
2. Uygulama doğrudan tarayıcıda açılır.
3. Hash route otomatik olarak `#/dashboard` değerine gelir.

Alternatif tam yol:

`C:\Users\Bora\Desktop\Workspace\agents\PriceInteligenceMVP_v1\index.html`

## Test akışı

1. Sayfa açıldığında üstte indigo header ve solda menü görünmeli.
2. Sol menüde `Genel Bakış`, `YZ Fiyat Önerileri` ve `Dinamik Fiyatlandırma` sayfalarına geçiş yapılabilmeli.
3. `Ürün Ekle` butonuna basınca sağ drawer açılmalı.
4. `Ürün Adı`, `SKU`, `Kategori` alanlarını doldurup kaydedince yeni ürün tabloya eklenmeli.
5. Yeni ürünün durumu `Kurulum Bekliyor` olarak görünmeli.
6. Herhangi bir ürün satırına tıklayınca sağ drawer'da rakip URL ve fiyat detayları açılmalı.
7. `Dinamik Fiyatlandırma` sayfasında strateji kartı seçilip hedef belirlendiğinde sağdaki YZ özeti güncellenmeli.
8. `Stratejiyi Uygula` butonu ile aktif atama listesine yeni satır eklenebilmeli veya mevcut satır güncellenebilmeli.
9. Aktif atama satırlarında `Duraklat` ve `Kaldır` aksiyonları çalışmalı.
10. `Esc`, `Kapat` veya backdrop ile drawer kapanmalı.

## Dosya yapısı

- `index.html`: uygulama kabuğu
- `assets/css/styles.css`: tema ve layout
- `assets/js/data.js`: mock ürün, rakip ve market pulse verileri
- `assets/js/app.js`: render ve etkileşim mantığı

## Kapsam dışı

Bu iterasyonda aşağıdakiler yoktur:

- backend
- gerçek API entegrasyonu
- çoklu sayfa akışı
- dil değiştirme
- gerçek zamanlı veri akışı
