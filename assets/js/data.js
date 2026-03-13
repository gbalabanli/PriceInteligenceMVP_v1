export const mockData = {
  products: [
    {
      id: 1,
      sku: "SKU-9821",
      name: "Kablosuz Kulaklık X-200",
      currentPrice: 1250,
      competitorMin: 1190,
      aiPrice: 1185,
      status: "high"
    },
    {
      id: 2,
      sku: "SKU-4412",
      name: "Akıllı Saat Ultra Pro",
      currentPrice: 3400,
      competitorMin: 3600,
      aiPrice: 3550,
      status: "low"
    },
    {
      id: 3,
      sku: "SKU-1029",
      name: "Gaming Mouse RGB",
      currentPrice: 850,
      competitorMin: 850,
      aiPrice: 849,
      status: "ok"
    },
    {
      id: 4,
      sku: "SKU-5520",
      name: "Laptop Soğutucu V3",
      currentPrice: 450,
      competitorMin: 399,
      aiPrice: 395,
      status: "high"
    },
    {
      id: 5,
      sku: "SKU-3321",
      name: "USB-C Hub 7 in 1",
      currentPrice: 620,
      competitorMin: 620,
      aiPrice: 620,
      status: "ok"
    }
  ],
  scenarios: [
    { id: "normal", label: "Normal" },
    { id: "empty", label: "Boş Veri" },
    { id: "warning", label: "Risk Yoğun" },
    { id: "conflict", label: "Çakışma" }
  ]
};
