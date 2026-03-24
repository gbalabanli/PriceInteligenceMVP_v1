(function () {
  const trackedProducts = [
    {
      id: "p-101",
      name: "Kablosuz Kulaklık X-200",
      sku: "SKU-9821",
      category: "Ses Sistemleri",
      currentPrice: 1249,
      competitorStatus: "Rakip ortalamasının %6 üzerinde",
      trendDirection: "Yükselişte",
      aiSuggestionText: "39 TL indirim ile dönüşüm kaybı frenlenebilir.",
      status: "Fiyat Riski",
      competitorCount: 3,
      estimatedLostRevenue: 48000,
      estimatedProfitUplift: 16000,
      trendSummary: "Google Trends araması son 7 günde %18 artış gösterdi.",
      updatedAt: "Bugün 10:24"
    },
    {
      id: "p-102",
      name: "Akıllı Saat Ultra Pro",
      sku: "SKU-4412",
      category: "Giyilebilir Teknoloji",
      currentPrice: 3399,
      competitorStatus: "Rakip alt bandının %5 altında",
      trendDirection: "Dengede",
      aiSuggestionText: "Kâr korumak için 99 TL fiyat artışı denenebilir.",
      status: "Marj Riski",
      competitorCount: 4,
      estimatedLostRevenue: 12000,
      estimatedProfitUplift: 24500,
      trendSummary: "Arama hacmi yatay, fiyat toleransı yüksek kalıyor.",
      updatedAt: "Bugün 09:42"
    },
    {
      id: "p-103",
      name: "Gaming Mouse RGB",
      sku: "SKU-1029",
      category: "Oyuncu Aksesuarı",
      currentPrice: 849,
      competitorStatus: "Rakip lider ile aynı bantta",
      trendDirection: "Yükselişte",
      aiSuggestionText: "Mevcut fiyat korunabilir, görünürlük kampanya ile desteklenmeli.",
      status: "Dengede",
      competitorCount: 3,
      estimatedLostRevenue: 8000,
      estimatedProfitUplift: 9500,
      trendSummary: "Son 48 saatte oyuncu ekipmanları aramalarında hızlanma var.",
      updatedAt: "Bugün 11:05"
    },
    {
      id: "p-104",
      name: "USB-C Hub 7 in 1",
      sku: "SKU-3321",
      category: "Bilgisayar Aksesuarı",
      currentPrice: 619,
      competitorStatus: "İki rakip son 24 saatte fiyat kırdı",
      trendDirection: "Düşüşte",
      aiSuggestionText: "Talep zayıflarken fiyatı korumak yerine paket teklif öneriliyor.",
      status: "Fiyat Riski",
      competitorCount: 2,
      estimatedLostRevenue: 27000,
      estimatedProfitUplift: 10800,
      trendSummary: "Google Trends ilgisi haftalık bazda %9 geriledi.",
      updatedAt: "Bugün 08:57"
    }
  ];

  const competitorDetails = [
    {
      id: "c-101",
      productId: "p-101",
      sourceName: "Trendyol / trendyol.com",
      url: "https://www.trendyol.com/marketplace/kablosuz-kulaklik-x-200",
      price: 1190
    },
    {
      id: "c-102",
      productId: "p-101",
      sourceName: "Hepsiburada / hepsiburada.com",
      url: "https://www.hepsiburada.com/marketplace/kablosuz-kulaklik-x-200",
      price: 1219
    },
    {
      id: "c-103",
      productId: "p-101",
      sourceName: "Amazon TR / amazon.com.tr",
      url: "https://www.amazon.com.tr/dp/x200-pricesmart-demo",
      price: 1189
    },
    {
      id: "c-104",
      productId: "p-102",
      sourceName: "N11 / n11.com",
      url: "https://www.n11.com/marketplace/akilli-saat-ultra-pro",
      price: 3599
    },
    {
      id: "c-105",
      productId: "p-102",
      sourceName: "Trendyol / trendyol.com",
      url: "https://www.trendyol.com/marketplace/akilli-saat-ultra-pro",
      price: 3625
    },
    {
      id: "c-106",
      productId: "p-102",
      sourceName: "Pazarama / pazarama.com",
      url: "https://www.pazarama.com/marketplace/akilli-saat-ultra-pro",
      price: 3600
    },
    {
      id: "c-107",
      productId: "p-103",
      sourceName: "Amazon TR / amazon.com.tr",
      url: "https://www.amazon.com.tr/dp/rgb-mouse-pricesmart-demo",
      price: 849
    },
    {
      id: "c-108",
      productId: "p-103",
      sourceName: "Vatan / vatanbilgisayar.com",
      url: "https://www.vatanbilgisayar.com/gaming-mouse-rgb",
      price: 859
    },
    {
      id: "c-109",
      productId: "p-103",
      sourceName: "Teknosa / teknosa.com",
      url: "https://www.teknosa.com/gaming-mouse-rgb",
      price: 849
    },
    {
      id: "c-110",
      productId: "p-104",
      sourceName: "Hepsiburada / hepsiburada.com",
      url: "https://www.hepsiburada.com/marketplace/usb-c-hub-7in1",
      price: 579
    },
    {
      id: "c-111",
      productId: "p-104",
      sourceName: "Trendyol / trendyol.com",
      url: "https://www.trendyol.com/marketplace/usb-c-hub-7in1",
      price: 585
    }
  ];

  const marketPulse = {
    trendTopic: "Kablosuz kulaklık ve aksesuar segmenti",
    trendDirection: "Yükselişte",
    competitorPressure: "7 ürün grubunda fiyat baskısı arttı, 4 rakip bugün yeni indirim geçti.",
    aiSummary: "Fiyat rekabeti ses ürünlerinde hızlanırken trend desteği güçlü. Kulaklık ve aksesuar kategorilerinde küçük indirimler dönüşüm kaybını azaltabilir; akıllı saat tarafında ise fiyat yukarı yönlü test için alan var."
  };

  const dynamicPricing = {
    strategies: [
      {
        id: "balanced-auto",
        name: "Dengeli Otomatik",
        summary: "Gelir, marj ve rekabet baskısını aynı anda dengeleyen varsayılan strateji.",
        aiSummary: "YZ; rakip fiyatı, talep yönü ve ürün marjını birlikte okuyarak fiyatı kontrollü şekilde yukarı veya aşağı taşır.",
        movement: "Karışık hareket",
        businessGoal: "Geliri ve marjı dengede tutar",
        riskLevel: "Düşük"
      },
      {
        id: "stay-competitive",
        name: "Rekabette Kal",
        summary: "Rakip baskısının yükseldiği ürünlerde daha hızlı tepki vererek görünürlüğü korur.",
        aiSummary: "YZ, rakiplerin alt banda indiği anlarda fiyatı daha çevik günceller; talep zayıfladığında agresifleşir.",
        movement: "Daha çok aşağı",
        businessGoal: "Dönüşüm kaybını azaltır",
        riskLevel: "Orta"
      },
      {
        id: "maximize-margin",
        name: "Marjı Maksimize Et",
        summary: "Talebi güçlü kalan ürünlerde gereksiz indirimleri azaltarak kârlılığı öne çıkarır.",
        aiSummary: "YZ, fiyat toleransı yüksek ürünleri korur; yalnızca baskı oluştuğunda sınırlı geri çekilir.",
        movement: "Daha çok yukarı",
        businessGoal: "Kârı büyütür",
        riskLevel: "Orta"
      },
      {
        id: "clear-stock",
        name: "Stok Erit",
        summary: "Dönen stok baskısını azaltmak için fiyatı daha agresif optimize eder.",
        aiSummary: "YZ, stok yükü ve zayıf talep sinyallerini gördüğünde fiyatı daha hızlı aşağı çekerek çıkışı hızlandırır.",
        movement: "Hızlı aşağı",
        businessGoal: "Stok devir hızını artırır",
        riskLevel: "Yüksek"
      }
    ],
    assignments: [
      {
        id: "dp-201",
        strategyId: "stay-competitive",
        targetType: "category",
        targetId: "Ses Sistemleri",
        targetLabel: "Ses Sistemleri",
        affectedProducts: 1,
        status: "Aktif",
        lastUpdate: "Bugün 10:50",
        performance: "+4,8% gelir"
      },
      {
        id: "dp-202",
        strategyId: "maximize-margin",
        targetType: "product",
        targetId: "p-102",
        targetLabel: "Akıllı Saat Ultra Pro",
        affectedProducts: 1,
        status: "Aktif",
        lastUpdate: "Bugün 09:40",
        performance: "+2,1 puan marj"
      },
      {
        id: "dp-203",
        strategyId: "balanced-auto",
        targetType: "segment",
        targetId: "trend-up",
        targetLabel: "Trend Yükselenler",
        affectedProducts: 2,
        status: "Duraklatıldı",
        lastUpdate: "Dün 18:20",
        performance: "İzlemede"
      }
    ]
  };

  const abTesting = {
    tests: [
      {
        id: "ab-301",
        name: "Kulaklık Fiyat Aralığı Testi",
        productName: "Apple Airpods Pro 2",
        strategyName: "Psikolojik Eşik Testi",
        category: "Elektronik",
        categoryDetail: "Kategori: Ses",
        cardTone: "winner",
        monthlyContribution: 12200,
        sampleCollected: 1800,
        sampleTarget: 1800,
        targetLabel: "Wireless Headphones",
        targetKpi: "Ziyaretçi başı gelir",
        status: "Çalışıyor",
        startedAt: "2026-03-18",
        significance: 96,
        trafficSplit: "50/25/25",
        guardrails: {
          minMarginRate: 15,
          maxPriceChange: 12,
          minStock: 20,
          autoStop: true
        },
        alerts: [
          "Örneklem güçlü. Karar vermek için yeterli güven seviyesi oluştu."
        ],
        variants: [
          {
            id: "control",
            label: "Kontrol",
            price: 1249,
            sessions: 5200,
            orders: 416,
            revenue: 519584,
            marginRate: 0.22
          },
          {
            id: "variant-a",
            label: "Varyant A",
            price: 1219,
            sessions: 2600,
            orders: 238,
            revenue: 290122,
            marginRate: 0.205
          },
          {
            id: "variant-b",
            label: "Varyant B",
            price: 1279,
            sessions: 2600,
            orders: 198,
            revenue: 253242,
            marginRate: 0.233
          }
        ]
      },
      {
        id: "ab-302",
        name: "Stok Eritme Kampanya Testi",
        productName: "Basic Cotton T-Shirt",
        strategyName: "Marj Koruma vs Hacim",
        category: "Tekstil",
        cardTone: "running",
        monthlyContribution: -1800,
        sampleCollected: 640,
        sampleTarget: 1000,
        remainingDays: 4,
        targetLabel: "Clearance Items",
        targetKpi: "Satış adedi",
        status: "Durduruldu",
        startedAt: "2026-03-10",
        significance: 82,
        trafficSplit: "50/50",
        guardrails: {
          minMarginRate: 12,
          maxPriceChange: 18,
          minStock: 10,
          autoStop: true
        },
        alerts: [
          "Anlamlılık düşük kaldı. Test tekrar başlatılmadan karar önerilmez."
        ],
        variants: [
          {
            id: "control",
            label: "Kontrol",
            price: 619,
            sessions: 2100,
            orders: 199,
            revenue: 123181,
            marginRate: 0.18
          },
          {
            id: "variant-a",
            label: "Varyant A",
            price: 579,
            sessions: 2100,
            orders: 214,
            revenue: 123906,
            marginRate: 0.132
          }
        ]
      },
      {
        id: "ab-303",
        name: "Laptop Fiyat Koridoru Testi",
        productName: "Gaming Laptop V5",
        strategyName: "Agresif Rekabet Kırılımı",
        category: "Elektronik",
        cardTone: "critical",
        monthlyContribution: 0,
        sampleCollected: 510,
        sampleTarget: 1200,
        targetLabel: "Gaming Laptop Segmenti",
        targetKpi: "Marj koruması",
        status: "Durduruldu",
        startedAt: "2026-03-19",
        significance: 74,
        trafficSplit: "50/50",
        guardrails: {
          minMarginRate: 15,
          maxPriceChange: 14,
          minStock: 8,
          autoStop: true
        },
        alerts: [
          "Minimum marj sınırı ihlal edildiği için test otomatik durduruldu."
        ],
        criticalReason: "Varyant B fiyatı 24.500 TL'den 21.200 TL'ye indi ve marj eşiğini kırdı.",
        variants: [
          {
            id: "control",
            label: "Kontrol",
            price: 24500,
            sessions: 1200,
            orders: 41,
            revenue: 1004500,
            marginRate: 0.19
          },
          {
            id: "variant-b",
            label: "Varyant B",
            price: 21200,
            sessions: 1200,
            orders: 44,
            revenue: 932800,
            marginRate: 0.129
          }
        ]
      }
    ]
  };

  globalThis.PriceSmartMvpData = {
    trackedProducts,
    competitorDetails,
    marketPulse,
    dynamicPricing,
    abTesting
  };
})();
