# -*- coding: utf-8 -*-
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


PAGE_W, PAGE_H = A4
MENU_ITEMS = [
    "Genel Bakış",
    "YZ Fiyat Önerileri",
    "Dinamik Fiyatlandırma",
    "A/B Fiyatlandırma Testi",
]
FONT_REGULAR = "PI_Regular"
FONT_BOLD = "PI_Bold"


def setup_fonts():
    font_candidates = [
        ("C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/arialbd.ttf"),
        ("C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/segoeuib.ttf"),
        ("C:/Windows/Fonts/calibri.ttf", "C:/Windows/Fonts/calibrib.ttf"),
    ]

    for regular_path, bold_path in font_candidates:
        if Path(regular_path).exists() and Path(bold_path).exists():
            pdfmetrics.registerFont(TTFont(FONT_REGULAR, regular_path))
            pdfmetrics.registerFont(TTFont(FONT_BOLD, bold_path))
            return

    raise RuntimeError("Unicode destekli bir font bulunamadı (Arial/Segoe/Calibri).")


def wrap_lines(text, font_name, font_size, max_width):
    words = text.split()
    lines = []
    current = []
    for word in words:
        candidate = " ".join(current + [word]).strip()
        if pdfmetrics.stringWidth(candidate, font_name, font_size) <= max_width:
            current.append(word)
        else:
            if current:
                lines.append(" ".join(current))
            current = [word]
    if current:
        lines.append(" ".join(current))
    return lines


def draw_text_block(c, x, y, width, text, font_name=FONT_REGULAR, font_size=9, leading=12):
    c.setFont(font_name, font_size)
    cursor = y
    for line in wrap_lines(text, font_name, font_size, width):
        c.drawString(x, cursor, line)
        cursor -= leading
    return cursor


def page_header(c, title, subtitle, page_no, total_pages):
    c.setFont(FONT_BOLD, 16)
    c.drawString(36, PAGE_H - 42, title)
    c.setFont(FONT_REGULAR, 10)
    c.setFillColor(colors.HexColor("#374151"))
    c.drawString(36, PAGE_H - 58, subtitle)
    c.setFillColor(colors.black)
    c.setFont(FONT_REGULAR, 9)
    c.drawRightString(PAGE_W - 36, 24, f"Page {page_no}/{total_pages}")
    c.line(36, PAGE_H - 66, PAGE_W - 36, PAGE_H - 66)


def draw_panel(c, x, y, w, h, title, lines=None):
    lines = lines or []
    c.setStrokeColor(colors.HexColor("#9CA3AF"))
    c.rect(x, y, w, h, stroke=1, fill=0)
    c.setFont(FONT_BOLD, 9)
    c.drawString(x + 8, y + h - 14, title)
    c.setFont(FONT_REGULAR, 8)
    cursor = y + h - 28
    for line in lines:
        c.drawString(x + 8, cursor, f"- {line}")
        cursor -= 11


def draw_button(c, x, y, w, h, label, filled=False):
    if filled:
        c.setFillColor(colors.HexColor("#E5E7EB"))
        c.rect(x, y, w, h, stroke=1, fill=1)
        c.setFillColor(colors.black)
    else:
        c.rect(x, y, w, h, stroke=1, fill=0)
    c.setFont(FONT_REGULAR, 8)
    c.drawCentredString(x + w / 2, y + h / 2 - 3, label)


def draw_app_shell(c, active_menu):
    x, y, w, h = 36, 260, PAGE_W - 72, 500
    c.setStrokeColor(colors.black)
    c.rect(x, y, w, h, stroke=1, fill=0)

    sidebar_w = 140
    c.line(x + sidebar_w, y, x + sidebar_w, y + h)
    c.setFont(FONT_BOLD, 10)
    c.drawString(x + 10, y + h - 18, "Menu")

    cursor = y + h - 42
    for item in MENU_ITEMS:
        if item == active_menu:
            c.setFillColor(colors.HexColor("#111827"))
            c.rect(x + 8, cursor - 8, sidebar_w - 16, 16, stroke=0, fill=1)
            c.setFillColor(colors.white)
            c.setFont(FONT_REGULAR, 8)
            c.drawString(x + 12, cursor - 3, item)
            c.setFillColor(colors.black)
        else:
            c.setFont(FONT_REGULAR, 8)
            c.drawString(x + 12, cursor - 3, item)
        cursor -= 22

    main_x = x + sidebar_w + 8
    main_w = w - sidebar_w - 16
    c.setStrokeColor(colors.HexColor("#9CA3AF"))
    c.rect(main_x, y + h - 44, main_w, 32, stroke=1, fill=0)
    c.setFont(FONT_REGULAR, 8)
    c.drawString(main_x + 8, y + h - 25, "Top bar: Search | Date Filter | Settings Icon | Scenario Icon")

    return {
        "x": x,
        "y": y,
        "w": w,
        "h": h,
        "main_x": main_x,
        "main_w": main_w,
        "main_top": y + h - 52,
        "main_bottom": y + 10,
    }


def draw_action_box(c, title, purpose, actions):
    x, y, w, h = 36, 48, PAGE_W - 72, 190
    c.setStrokeColor(colors.HexColor("#9CA3AF"))
    c.rect(x, y, w, h, stroke=1, fill=0)

    c.setFont(FONT_BOLD, 11)
    c.drawString(x + 10, y + h - 16, title)
    c.setFont(FONT_BOLD, 9)
    c.drawString(x + 10, y + h - 34, "Amaç:")
    draw_text_block(c, x + 48, y + h - 34, w - 58, purpose, FONT_REGULAR, 9, 11)

    c.setFont(FONT_BOLD, 9)
    c.drawString(x + 10, y + h - 62, "Ana Aksiyonlar:")
    cursor = y + h - 78
    c.setFont(FONT_REGULAR, 8)
    for action in actions:
        wrapped = wrap_lines(action, FONT_REGULAR, 8, w - 24)
        if not wrapped:
            continue
        c.drawString(x + 12, cursor, f"- {wrapped[0]}")
        cursor -= 10
        for line in wrapped[1:]:
            c.drawString(x + 20, cursor, line)
            cursor -= 10
        if cursor < y + 12:
            break


def cover_page(c, page_no, total_pages):
    page_header(
        c,
        "Price Intelligence Mockup - Sayfa Taslakları",
        "Static HTML/CSS/JS MVP | Server yok | Mock data + çalışan butonlar",
        page_no,
        total_pages,
    )

    c.setFont(FONT_BOLD, 12)
    c.drawString(36, PAGE_H - 104, "Doküman İçeriği")
    c.setFont(FONT_REGULAR, 10)
    items = [
        "1. Sol menü ve bilgi mimarisi",
        "2. Dashboard sayfası taslağı",
        "3. YZ Fiyat Önerileri sayfası taslağı",
        "4. Dinamik Fiyatlandırma sayfası taslağı",
        "5. A/B Fiyatlandırma Testi sayfası taslağı",
        "6. Ürün Detay sayfası taslağı",
        "7. Price Monitoring (yardımcı, menü dışı) taslağı",
        "8. Scenario Lab sayfası taslağı (header icon ile erişim)",
    ]
    y = PAGE_H - 124
    for item in items:
        c.drawString(44, y, item)
        y -= 16

    draw_panel(
        c,
        36,
        330,
        PAGE_W - 72,
        220,
        "MVP Sınırları",
        [
            "Tüm akışlar tarayıcı içinde çalışır.",
            "Gerçek API, server ve veritabanı bağlantısı yoktur.",
            "Dinamik fiyatlandırma alanı simülasyondur (production otomasyon değil).",
            "Tüm kritik butonların görünür sonuç vermesi zorunludur.",
            "Tüm menü linkleri ve sayfa geçişleri çalışmalıdır.",
        ],
    )

    draw_panel(
        c,
        36,
        120,
        PAGE_W - 72,
        180,
        "Kullanılan Sol Menü",
        [
            "Genel Bakış",
            "YZ Fiyat Önerileri (Öneriler dahil)",
            "Dinamik Fiyatlandırma",
            "A/B Fiyatlandırma Testi",
            "Header Icons: Settings, Scenario Lab",
        ],
    )


def information_architecture_page(c, page_no, total_pages):
    page_header(
        c,
        "Bilgi Mimarisi ve Navigasyon",
        "Sol menü, route yapısı ve ortak davranış kuralları",
        page_no,
        total_pages,
    )
    app = draw_app_shell(c, "Genel Bakış")
    mx = app["main_x"]
    mt = app["main_top"]

    draw_panel(c, mx + 8, mt - 120, app["main_w"] - 16, 110, "Route Haritası", [
        "/dashboard",
        "/yz-fiyat-onerileri",
        "/dynamic-pricing",
        "/ab-testing",
        "/price-monitoring",
        "/product-detail/:skuId",
        "/scenario-lab (header icon)",
        "/settings (header icon)",
    ])

    draw_panel(c, mx + 8, mt - 260, app["main_w"] - 16, 120, "Global Davranış Kuralları", [
        "Her sayfada Back to Dashboard hızlı aksiyonu",
        "Aktif menü vurgusu route ile senkron",
        "Reset action: filtre + simülasyon + seçimleri sıfırlar",
        "Reject / Rollback gibi aksiyonlar onay modalı ister",
    ])

    draw_action_box(
        c,
        "Sayfa Grubu: Bilgi Mimarisi",
        "Tüm sayfaların tutarlı gezinme ve davranış modelinde çalışmasını sağlar.",
        [
            "Menu item tıklanınca ilgili route açılır ve aktif menü değişir.",
            "Back to Dashboard butonu kullanıcıyı /dashboard route'una döndürür.",
            "Scenario değişimleri /scenario-lab route'u üzerinden yapılır.",
            "Global Reset Demo State tüm geçici UI state değişikliklerini baseline'a alır.",
        ],
    )


def dashboard_page(c, page_no, total_pages):
    page_header(c, "Sayfa Taslağı: Dashboard", "KPI özeti + kritik SKU odağı", page_no, total_pages)
    app = draw_app_shell(c, "Genel Bakış")
    mx = app["main_x"]
    mt = app["main_top"]
    mw = app["main_w"]

    col_w = (mw - 24) / 3
    draw_panel(c, mx + 8, mt - 90, col_w, 80, "KPI 1", ["Aktif SKU", "1234"])
    draw_panel(c, mx + 8 + col_w + 8, mt - 90, col_w, 80, "KPI 2", ["Bekleyen", "47"])
    draw_panel(c, mx + 8 + (col_w + 8) * 2, mt - 90, col_w, 80, "KPI 3", ["Riskli SKU", "18"])

    draw_panel(c, mx + 8, mt - 270, mw * 0.58, 165, "Kritik SKU Listesi", [
        "SKU, Kendi Fiyat, Rakip Min, Fark%",
        "Satir aksiyonu: Open Details",
    ])
    draw_panel(c, mx + 8 + mw * 0.58 + 8, mt - 270, mw * 0.42 - 16, 165, "Son Öneriler", [
        "Pending/Approved/Rejected",
        "Quick jump: Recommendations",
    ])

    draw_button(c, mx + 16, app["main_bottom"] + 8, 86, 18, "View Critical SKUs", filled=True)
    draw_button(c, mx + 108, app["main_bottom"] + 8, 118, 18, "Open YZ Önerileri")
    draw_button(c, mx + 232, app["main_bottom"] + 8, 92, 18, "Reset Demo State")

    draw_action_box(
        c,
        "Sayfa: Dashboard",
        "Kullanıcıya anlık operasyon görünümü verir ve kritik aksiyonlara hızlı geçiş sağlar.",
        [
            "View Critical SKUs -> Price Monitoring sayfasına kritik filtre ile gider.",
            "Open YZ Önerileri -> YZ sayfasında pending filtreyi açık getirir.",
            "Open Details -> seçilen SKU için Product Detail sayfasını açar.",
            "Reset Demo State -> filtre ve geçici seçimleri baseline'a döndürür.",
        ],
    )


def monitoring_page(c, page_no, total_pages):
    page_header(c, "Sayfa Taslağı: Price Monitoring", "Yardımcı (menü dışı) SKU tablosu", page_no, total_pages)
    app = draw_app_shell(c, "__context__")
    mx = app["main_x"]
    mt = app["main_top"]
    mw = app["main_w"]

    draw_panel(c, mx + 8, mt - 72, mw - 16, 62, "Filtre Bar", [
        "Kategori, Marka, Risk seviyesi, Fark%",
    ])
    draw_button(c, mx + 14, mt - 66, 74, 16, "Apply Filters", filled=True)
    draw_button(c, mx + 94, mt - 66, 74, 16, "Clear Filters")

    draw_panel(c, mx + 8, mt - 300, mw - 16, 218, "SKU Tablosu", [
        "Kolonlar: SKU | Kendi Fiyat | Rakip Min/Max | Fark%",
        "Kolon başlığına tıklayınca sort ASC/DESC",
        "Satıra tıklayınca Product Detail açılır",
    ])
    draw_button(c, mx + 14, app["main_bottom"] + 8, 132, 18, "Send To Recommendations", filled=True)

    draw_action_box(
        c,
        "Sayfa: Fiyat İzleme",
        "Detaylı ürün bazlı karşılaştırma ve toplu aksiyon yönetimi yapılır.",
        [
            "Apply Filters -> tablo seçilen koşullara göre daralır.",
            "Clear Filters -> aktif filtreler temizlenir, tüm satırlar geri gelir.",
            "Sort -> tablo satırları ilgili kolona göre yeniden sıralanır.",
            "Send To Recommendations -> seçili SKU'lar pending_review durumuna geçer.",
        ],
    )


def ai_price_recommendations_page(c, page_no, total_pages):
    page_header(
        c,
        "Sayfa Taslağı: YZ Fiyat Önerileri",
        "KPI kartları + öneriler + onay aksiyonları tek sayfada",
        page_no,
        total_pages,
    )
    app = draw_app_shell(c, "YZ Fiyat Önerileri")
    mx = app["main_x"]
    mt = app["main_top"]
    mw = app["main_w"]

    card_w = (mw - 32) / 4
    draw_panel(c, mx + 8, mt - 86, card_w, 76, "Takip Edilen Ürün", ["1,248"])
    draw_panel(c, mx + 16 + card_w, mt - 86, card_w, 76, "Rekabet Kaybi", ["42", "Yüksek fiyat"])
    draw_panel(c, mx + 24 + card_w * 2, mt - 86, card_w, 76, "Kar Kaybı", ["18", "Düşük fiyat"])
    draw_panel(c, mx + 32 + card_w * 3, mt - 86, card_w, 76, "Tahmini Ek Kar", ["TRY 12,450", "Aylık"])

    draw_panel(c, mx + 8, mt - 310, mw - 16, 212, "Yapay Zeka Fiyat Önerileri", [
        "Kolonlar: Ürün | Mevcut | Rakip En Düşük | AI Öneri | Durum | İşlem",
        "Üst kontrol: Filtrele + Tümünü Onayla",
        "Satır aksiyonu: Uygula",
    ])
    draw_button(c, mx + mw - 178, mt - 120, 66, 16, "Filtrele")
    draw_button(c, mx + mw - 106, mt - 120, 88, 16, "Tümünü Onayla", filled=True)
    draw_button(c, mx + mw - 94, mt - 220, 44, 16, "Uygula")

    draw_action_box(
        c,
        "Sayfa: YZ Fiyat Önerileri",
        "YZ tarafından üretilen fiyat değişiklik önerilerini toplu ve satır bazlı uygulamak için kullanılır.",
        [
            "Filtrele -> öneriler listesini seçilen kriterlere göre daraltır.",
            "Tümünü Onayla -> görünen tüm uygun AI önerilerini tek adımda uygular.",
            "Uygula (row) -> seçilen ürünün AI fiyatını tekil olarak uygular.",
            "Pending/Processed görünümü aynı sayfada tab/filtre ile yönetilir.",
            "Satıra tıklama -> ürün bazlı karar için Product Detail sayfasına geçiş yapar.",
        ],
    )


def product_detail_page(c, page_no, total_pages):
    page_header(c, "Sayfa Taslağı: Ürün Detay", "Tek SKU karar ekranı", page_no, total_pages)
    app = draw_app_shell(c, "__context__")
    mx = app["main_x"]
    mt = app["main_top"]
    mw = app["main_w"]

    draw_panel(c, mx + 8, mt - 74, mw - 16, 64, "Ürün Başlık Alanı", ["SKU kodu | Marka | Kategori | Durum"])
    draw_panel(c, mx + 8, mt - 232, mw * 0.58, 148, "Fiyat Trendi + Rakip Dağılımı", [
        "Mock line chart",
        "Rakip fiyat kartları",
    ])
    draw_panel(c, mx + 8 + mw * 0.58 + 8, mt - 232, mw * 0.42 - 16, 148, "Öneri Karti", [
        "Önerilen fiyat",
        "Reason tag + confidence",
    ])
    draw_button(c, mx + mw * 0.58 + 20, mt - 216, 56, 16, "Approve", filled=True)
    draw_button(c, mx + mw * 0.58 + 82, mt - 216, 52, 16, "Reject")
    draw_button(c, mx + mw * 0.58 + 140, mt - 216, 54, 16, "Add Note")
    draw_button(c, mx + 14, app["main_bottom"] + 8, 68, 18, "Previous")
    draw_button(c, mx + 88, app["main_bottom"] + 8, 56, 18, "Next")

    draw_action_box(
        c,
        "Sayfa: Ürün Detay",
        "Karar vermek için gerekli tüm ürün bağlamı ve fiyat önerisi bir araya gelir.",
        [
            "Approve -> recommendation status Approved olur, timeline kaydı eklenir.",
            "Reject -> neden seçimi ile Rejected olur, reason etiketi görünür.",
            "Add Note -> lokal not kaydı oluşur, audit trail'e eklenir.",
            "Previous/Next -> sıradaki SKU context'i yüklenir.",
        ],
    )


def recommendations_page(c, page_no, total_pages):
    page_header(c, "Sayfa Taslağı: Öneriler ve Onay", "Pending/Processed yönetimi", page_no, total_pages)
    app = draw_app_shell(c, "Öneriler")
    mx = app["main_x"]
    mt = app["main_top"]
    mw = app["main_w"]

    draw_panel(c, mx + 8, mt - 74, mw - 16, 64, "Sekmeler ve Filtreler", [
        "Tabs: Pending | Processed",
        "Durum ve etki filtresi",
    ])
    draw_panel(c, mx + 8, mt - 288, mw - 16, 204, "Öneri Tablosu", [
        "Satır aksiyonları: Approve / Reject",
        "Toplu secim desteklenir",
    ])
    draw_button(c, mx + 16, app["main_bottom"] + 8, 98, 18, "Approve Selected", filled=True)
    draw_button(c, mx + 120, app["main_bottom"] + 8, 90, 18, "Reject Selected")

    draw_action_box(
        c,
        "Sayfa: Öneriler ve Onay",
        "Bekleyen kararlar tekil veya toplu şekilde islenir.",
        [
            "Pending/Processed tablari recommendation listesini status'a göre filtreler.",
            "Approve (row) -> seçili satırı Approved yapar ve sayacı günceller.",
            "Reject (row) -> seçili satırı Rejected yapar, gerekçeyi kaydeder.",
            "Approve Selected / Reject Selected -> seçili tüm pending kayıtlara toplu uygular.",
        ],
    )


def history_page(c, page_no, total_pages):
    page_header(c, "Sayfa Taslağı: A/B Fiyatlandırma Testi", "Test varyantları ve etki ölçümü", page_no, total_pages)
    app = draw_app_shell(c, "A/B Fiyatlandırma Testi")
    mx = app["main_x"]
    mt = app["main_top"]
    mw = app["main_w"]

    draw_panel(c, mx + 8, mt - 74, mw - 16, 64, "Tarih Filtresi", ["Başlangıç - Bitiş", "Durum filtresi"])
    draw_button(c, mx + 16, mt - 67, 84, 16, "Apply Range", filled=True)
    draw_button(c, mx + 106, mt - 67, 74, 16, "Reset Range")

    draw_panel(c, mx + 8, mt - 220, (mw - 24) / 2, 136, "A/B KPI Kartları", [
        "Onaylanan sayı",
        "Red edilen sayı",
        "Ortalama fark değişimi",
    ])
    draw_panel(c, mx + 16 + (mw - 24) / 2, mt - 220, (mw - 24) / 2, 136, "Test Karşılaştırma", [
        "Varyant A vs B",
        "Sonuç farkı",
        "Güven etiketi",
    ])
    draw_button(c, mx + 16, app["main_bottom"] + 8, 88, 18, "Export Snapshot")

    draw_action_box(
        c,
        "Sayfa: A/B Fiyatlandırma Testi",
        "Farklı fiyat stratejilerinin etki karşılaştırmasını gösterir.",
        [
            "Apply Range -> test ve KPI kartları seçilen tarihe göre yenilenir.",
            "Reset Range -> varsayılan periyoda geri döner.",
            "Export Snapshot -> o anki filtreli görünümü JSON olarak indirir.",
        ],
    )


def dynamic_simulation_page(c, page_no, total_pages):
    page_header(
        c,
        "Sayfa Taslağı: Dinamik Fiyatlandırma",
        "Manual / Auto-Sim modları ve Apply/Rollback akışı",
        page_no,
        total_pages,
    )
    app = draw_app_shell(c, "Dinamik Fiyatlandırma")
    mx = app["main_x"]
    mt = app["main_top"]
    mw = app["main_w"]

    draw_panel(c, mx + 8, mt - 74, mw - 16, 64, "Mode + Kontroller", [
        "Mode: Manual | Auto-Sim",
        "Run Simulation | Pause | Reset",
    ])
    draw_button(c, mx + 16, mt - 67, 56, 16, "Manual")
    draw_button(c, mx + 76, mt - 67, 64, 16, "Auto-Sim", filled=True)
    draw_button(c, mx + 146, mt - 67, 74, 16, "Run")
    draw_button(c, mx + 226, mt - 67, 56, 16, "Pause")
    draw_button(c, mx + 288, mt - 67, 56, 16, "Reset")

    draw_panel(c, mx + 8, mt - 292, mw * 0.58, 208, "Aday Fiyat Değişim Listesi", [
        "SKU | Simüle yeni fiyat | Etki puanı",
        "Guardrail hit badge",
        "Preview action",
    ])
    draw_panel(c, mx + 8 + mw * 0.58 + 8, mt - 292, mw * 0.42 - 16, 208, "Preview Drawer", [
        "Eski/Yeni fiyat farkı",
        "Reason tags",
        "Apply / Rollback",
    ])
    draw_button(c, mx + mw * 0.58 + 20, mt - 274, 50, 16, "Apply", filled=True)
    draw_button(c, mx + mw * 0.58 + 76, mt - 274, 62, 16, "Rollback")
    draw_button(c, mx + 16, app["main_bottom"] + 8, 108, 18, "Show Guardrail Hits")

    draw_action_box(
        c,
        "Sayfa: Dinamik Fiyatlandırma",
        "Dinamik fiyatlandırma davranışını production dışı bir simülasyon olarak gösterir.",
        [
            "Auto-Sim + Run -> deterministic mock fiyat değişim döngüsü başlatır.",
            "Pause -> mevcut adımda döngüyü durdurur.",
            "Preview -> seçilen adayın fark görünümünü açıklar.",
            "Apply -> simüle fiyat değişimini SKU state'ine uygular.",
            "Rollback -> son uygulanan simüle değişimi geri alır.",
        ],
    )


def scenario_lab_page(c, page_no, total_pages):
    page_header(
        c,
        "Sayfa Taslağı: Scenario Lab",
        "Header icon ile erişilen senaryo ve hızlı test aracı",
        page_no,
        total_pages,
    )
    app = draw_app_shell(c, "__context__")
    mx = app["main_x"]
    mt = app["main_top"]
    mw = app["main_w"]

    draw_panel(c, mx + 8, mt - 160, (mw - 24) / 2, 150, "Demo Senaryoları", [
        "normal",
        "empty",
        "conflict",
        "warning",
    ])
    draw_button(c, mx + 16, mt - 144, 92, 16, "Load Scenario", filled=True)
    draw_button(c, mx + 114, mt - 144, 124, 16, "Re-seed Randomized Values")

    draw_panel(c, mx + 16 + (mw - 24) / 2, mt - 160, (mw - 24) / 2, 150, "Ek Notlar", [
        "Tablo yoğunluğu",
        "Tema seçimi",
        "Varsayılan filtreler",
    ])
    draw_button(c, mx + 24 + (mw - 24) / 2, mt - 144, 92, 16, "Save Preferences", filled=True)
    draw_button(c, mx + 122 + (mw - 24) / 2, mt - 144, 94, 16, "Restore Defaults")

    draw_panel(c, mx + 8, mt - 304, mw - 16, 128, "Final Demo Checklist", [
        "Tüm menü linkleri çalışıyor",
        "Tüm kritik butonlar görünür sonuç veriyor",
        "Auto-Sim alanında simulation etiketi görünüyor",
        "Reset ile baseline state geri geliyor",
    ])

    draw_action_box(
        c,
        "Sayfa: Scenario Lab",
        "Sunum akışında farklı veri durumlarını hızla değiştirmek ve etkisini göstermek için kullanılır.",
        [
            "Load Scenario -> tüm uygulamayı seçilen mock dataset ile yeniden çizer.",
            "Re-seed Randomized Values -> deterministic sayısal varyasyon oluşturur.",
            "Save Preferences -> localStorage'a UI tercihini yazar.",
            "Restore Defaults -> kayıtlı tercihleri temizleyip varsayılanlara döner.",
        ],
    )


def build_pdf(output_path):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    setup_fonts()
    c = canvas.Canvas(str(output_path), pagesize=A4)

    pages = [
        cover_page,
        information_architecture_page,
        dashboard_page,
        ai_price_recommendations_page,
        dynamic_simulation_page,
        history_page,
        product_detail_page,
        monitoring_page,
        scenario_lab_page,
    ]

    total = len(pages)
    for idx, page_fn in enumerate(pages, start=1):
        page_fn(c, idx, total)
        c.showPage()
    c.save()


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parents[2]
    presentation_target = project_root / "docs" / "price_intelligence_mockup_pages.pdf"
    build_pdf(presentation_target)
    print(presentation_target)

