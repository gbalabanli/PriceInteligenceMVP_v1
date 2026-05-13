(function () {
  const trackedProducts = [
    {
      id: "p-101",
      name: "Wireless Headphones X-200",
      sku: "SKU-9821",
      category: "Audio Systems",
      currentPrice: 39,
      competitorStatus: "6% above competitor average",
      trendDirection: "Rising",
      aiSuggestionText: "A $3 discount can reduce conversion loss.",
      status: "Price Risk",
      competitorCount: 3,
      estimatedLostRevenue: 1500,
      estimatedProfitUplift: 500,
      trendSummary: "Google Trends interest increased 18% over the last 7 days.",
      updatedAt: "Today 10:24"
    },
    {
      id: "p-102",
      name: "Smart Watch Ultra Pro",
      sku: "SKU-4412",
      category: "Wearable Tech",
      currentPrice: 109,
      competitorStatus: "5% below the competitor lower band",
      trendDirection: "Stable",
      aiSuggestionText: "A $5 price increase could protect margin.",
      status: "Margin Risk",
      competitorCount: 4,
      estimatedLostRevenue: 375,
      estimatedProfitUplift: 760,
      trendSummary: "Search volume is flat and price tolerance remains high.",
      updatedAt: "Today 09:42"
    },
    {
      id: "p-103",
      name: "Gaming Mouse RGB",
      sku: "SKU-1029",
      category: "Gaming Accessories",
      currentPrice: 27,
      competitorStatus: "In line with the leading competitor band",
      trendDirection: "Rising",
      aiSuggestionText: "The current price can hold, but visibility should be supported with a campaign.",
      status: "Stable",
      competitorCount: 3,
      estimatedLostRevenue: 250,
      estimatedProfitUplift: 300,
      trendSummary: "Searches for gaming gear accelerated over the last 48 hours.",
      updatedAt: "Today 11:05"
    },
    {
      id: "p-104",
      name: "USB-C Hub 7 in 1",
      sku: "SKU-3321",
      category: "Computer Accessories",
      currentPrice: 19,
      competitorStatus: "Two competitors cut price in the last 24 hours",
      trendDirection: "Falling",
      aiSuggestionText: "Demand is weakening, so a bundle offer is recommended instead of holding price.",
      status: "Price Risk",
      competitorCount: 2,
      estimatedLostRevenue: 850,
      estimatedProfitUplift: 340,
      trendSummary: "Google Trends interest declined 9% week over week.",
      updatedAt: "Today 08:57"
    }
  ];

  const competitorDetails = [
    {
      id: "c-101",
      productId: "p-101",
      sourceName: "Trendyol / trendyol.com",
      url: "https://www.trendyol.com/marketplace/kablosuz-kulaklik-x-200",
      price: 37
    },
    {
      id: "c-102",
      productId: "p-101",
      sourceName: "Hepsiburada / hepsiburada.com",
      url: "https://www.hepsiburada.com/marketplace/kablosuz-kulaklik-x-200",
      price: 38
    },
    {
      id: "c-103",
      productId: "p-101",
      sourceName: "Amazon TR / amazon.com.tr",
      url: "https://www.amazon.com.tr/dp/x200-pricesmart-demo",
      price: 37
    },
    {
      id: "c-104",
      productId: "p-102",
      sourceName: "N11 / n11.com",
      url: "https://www.n11.com/marketplace/akilli-saat-ultra-pro",
      price: 115
    },
    {
      id: "c-105",
      productId: "p-102",
      sourceName: "Trendyol / trendyol.com",
      url: "https://www.trendyol.com/marketplace/akilli-saat-ultra-pro",
      price: 117
    },
    {
      id: "c-106",
      productId: "p-102",
      sourceName: "Pazarama / pazarama.com",
      url: "https://www.pazarama.com/marketplace/akilli-saat-ultra-pro",
      price: 116
    },
    {
      id: "c-107",
      productId: "p-103",
      sourceName: "Amazon TR / amazon.com.tr",
      url: "https://www.amazon.com.tr/dp/rgb-mouse-pricesmart-demo",
      price: 27
    },
    {
      id: "c-108",
      productId: "p-103",
      sourceName: "Vatan / vatanbilgisayar.com",
      url: "https://www.vatanbilgisayar.com/gaming-mouse-rgb",
      price: 28
    },
    {
      id: "c-109",
      productId: "p-103",
      sourceName: "Teknosa / teknosa.com",
      url: "https://www.teknosa.com/gaming-mouse-rgb",
      price: 27
    },
    {
      id: "c-110",
      productId: "p-104",
      sourceName: "Hepsiburada / hepsiburada.com",
      url: "https://www.hepsiburada.com/marketplace/usb-c-hub-7in1",
      price: 18
    },
    {
      id: "c-111",
      productId: "p-104",
      sourceName: "Trendyol / trendyol.com",
      url: "https://www.trendyol.com/marketplace/usb-c-hub-7in1",
      price: 18
    }
  ];

  const marketPulse = {
    trendTopic: "Wireless headphones and accessories segment",
    trendDirection: "Rising",
    competitorPressure: "Pricing pressure increased across 7 product groups, and 4 competitors launched new discounts today.",
    aiSummary: "Price competition is accelerating in audio products while trend support remains strong. Small discounts in headphones and accessories could reduce conversion loss, while smart watches have room for upward price tests.",
    aiConfidenceScore: 92
  };

  const dynamicPricing = {
    strategies: [
      {
        id: "balanced-auto",
        name: "Balanced Auto",
        summary: "Default strategy that balances revenue, margin, and competitor pressure at the same time.",
        aiSummary: "AI reads competitor pricing, demand direction, and product margin together to move price up or down in a controlled way.",
        movement: "Mixed movement",
        businessGoal: "Balances revenue and margin",
        riskLevel: "Low"
      },
      {
        id: "stay-competitive",
        name: "Stay Competitive",
        summary: "Responds faster on products under competitor pressure to protect visibility.",
        aiSummary: "AI updates price more aggressively when competitors move to the lower band and demand weakens.",
        movement: "Mostly downward",
        businessGoal: "Reduces conversion loss",
        riskLevel: "Medium"
      },
      {
        id: "maximize-margin",
        name: "Maximize Margin",
        summary: "Reduces unnecessary discounting on products with resilient demand to prioritize profitability.",
        aiSummary: "AI holds products with high price tolerance and only pulls back when pressure builds.",
        movement: "Mostly upward",
        businessGoal: "Expands profit",
        riskLevel: "Medium"
      },
      {
        id: "clear-stock",
        name: "Clear Stock",
        summary: "Optimizes price more aggressively to reduce aging inventory pressure.",
        aiSummary: "AI pulls price down faster when it sees inventory pressure and weak demand signals to accelerate sell-through.",
        movement: "Fast downward",
        businessGoal: "Increases inventory turnover",
        riskLevel: "High"
      }
    ],
    assignments: [
      {
        id: "dp-201",
        strategyId: "stay-competitive",
        targetType: "category",
        targetId: "Audio Systems",
        targetLabel: "Audio Systems",
        affectedProducts: 1,
        status: "Active",
        lastUpdate: "Today 10:50",
        performance: "+4.8% revenue"
      },
      {
        id: "dp-202",
        strategyId: "maximize-margin",
        targetType: "product",
        targetId: "p-102",
        targetLabel: "Smart Watch Ultra Pro",
        affectedProducts: 1,
        status: "Active",
        lastUpdate: "Today 09:40",
        performance: "+2.1 margin points"
      },
      {
        id: "dp-203",
        strategyId: "balanced-auto",
        targetType: "segment",
        targetId: "trend-up",
        targetLabel: "Rising Trends",
        affectedProducts: 2,
        status: "Paused",
        lastUpdate: "Yesterday 18:20",
        performance: "Monitoring"
      }
    ]
  };

  const abTesting = {
    tests: [
      {
        id: "ab-301",
        name: "Headphone Price Range Test",
        productName: "Apple Airpods Pro 2",
        strategyName: "Psychological Threshold Test",
        category: "Electronics",
        categoryDetail: "Category: Audio",
        cardTone: "winner",
        monthlyContribution: 380,
        sampleCollected: 1800,
        sampleTarget: 1800,
        targetLabel: "Wireless Headphones",
        targetKpi: "Revenue per visitor",
        testDesignTypeId: "sequential-time-series",
        testDesignLabel: "Sequential Time-Series Test",
        status: "Running",
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
          "Sample strength is high. There is enough AI confidence to make a decision."
        ],
        variants: [
          {
            id: "control",
            label: "Control",
            price: 39,
            sessions: 5200,
            orders: 416,
            revenue: 16224,
            marginRate: 0.22
          },
          {
            id: "variant-a",
            label: "Variant A",
            price: 37,
            sessions: 2600,
            orders: 238,
            revenue: 8806,
            marginRate: 0.205
          },
          {
            id: "variant-b",
            label: "Variant B",
            price: 41,
            sessions: 2600,
            orders: 198,
            revenue: 8118,
            marginRate: 0.233
          }
        ]
      },
      {
        id: "ab-302",
        name: "Clearance Campaign Test",
        productName: "Basic Cotton T-Shirt",
        strategyName: "Margin Protection vs Volume",
        category: "Apparel",
        cardTone: "running",
        monthlyContribution: -55,
        sampleCollected: 640,
        sampleTarget: 1000,
        remainingDays: 4,
        targetLabel: "Clearance Items",
        targetKpi: "Units sold",
        testDesignTypeId: "channel-based",
        testDesignLabel: "Channel-Based Test",
        status: "Stopped",
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
          "Significance is still low. No recommendation should be made before the test restarts."
        ],
        variants: [
          {
            id: "control",
            label: "Control",
            price: 19,
            sessions: 2100,
            orders: 199,
            revenue: 3781,
            marginRate: 0.18
          },
          {
            id: "variant-a",
            label: "Variant A",
            price: 18,
            sessions: 2100,
            orders: 214,
            revenue: 3852,
            marginRate: 0.132
          }
        ]
      },
      {
        id: "ab-303",
        name: "Laptop Price Corridor Test",
        productName: "Gaming Laptop V5",
        strategyName: "Aggressive Competitive Breakout",
        category: "Electronics",
        cardTone: "critical",
        monthlyContribution: 0,
        sampleCollected: 510,
        sampleTarget: 1200,
        targetLabel: "Gaming Laptop Segment",
        targetKpi: "Margin protection",
        testDesignTypeId: "geo-based",
        testDesignLabel: "Geo-Based Test",
        status: "Stopped",
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
          "The test was automatically stopped because the minimum margin threshold was breached."
        ],
        criticalReason: "Variant B dropped from $760 to $660 and breached the margin threshold.",
        variants: [
          {
            id: "control",
            label: "Control",
            price: 760,
            sessions: 1200,
            orders: 41,
            revenue: 31160,
            marginRate: 0.19
          },
          {
            id: "variant-b",
            label: "Variant B",
            price: 660,
            sessions: 1200,
            orders: 44,
            revenue: 29040,
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
