const SAMPLE_LISTINGS = [
  {
    id: "seocho-apt-sale-1",
    region: "반포동",
    propertyType: "apartment",
    tradeType: "sale",
    title: "래미안퍼스티지 84㎡",
    price: "45억 5,000",
    spec: "84㎡ · 12/32층 · 남동향",
    summary: "한강 접근성이 좋고 최근 리모델링된 매물",
    agency: "서초센트럴공인중개사",
    confirmedAt: "2026-04-12",
  },
  {
    id: "seocho-apt-sale-2",
    region: "반포동",
    propertyType: "apartment",
    tradeType: "sale",
    title: "아크로리버파크 112㎡",
    price: "62억",
    spec: "112㎡ · 18/28층 · 남향",
    summary: "커뮤니티 시설 우수, 즉시 입주 협의 가능",
    agency: "리버파크부동산",
    confirmedAt: "2026-04-11",
  },
  {
    id: "seocho-apt-lease-1",
    region: "반포동",
    propertyType: "apartment",
    tradeType: "lease",
    title: "반포자이 84㎡",
    price: "18억 2,000",
    spec: "84㎡ · 9/29층 · 남서향",
    summary: "학군 선호도 높은 동, 내부 상태 양호",
    agency: "자이프라임공인중개사",
    confirmedAt: "2026-04-10",
  },
  {
    id: "seocho-apt-rent-1",
    region: "반포동",
    propertyType: "apartment",
    tradeType: "rent",
    title: "반포미도 72㎡",
    price: "1억 / 320",
    spec: "72㎡ · 5/15층 · 남향",
    summary: "역세권, 반려동물 협의 가능",
    agency: "미도탑공인중개사",
    confirmedAt: "2026-04-08",
  },
  {
    id: "gangnam-officetel-sale-1",
    region: "역삼동",
    propertyType: "officetel",
    tradeType: "sale",
    title: "역삼 센트럴 오피스텔 48㎡",
    price: "9억 8,000",
    spec: "48㎡ · 14/19층 · 동향",
    summary: "업무지구 접근성 우수, 공실 위험 낮은 편",
    agency: "테헤란리얼티",
    confirmedAt: "2026-04-14",
  },
  {
    id: "gangnam-officetel-lease-1",
    region: "역삼동",
    propertyType: "officetel",
    tradeType: "lease",
    title: "역삼역 도보 3분 오피스텔 39㎡",
    price: "4억 5,000",
    spec: "39㎡ · 11/20층 · 북동향",
    summary: "직주근접 수요 안정적, 풀옵션",
    agency: "역삼하이랜드",
    confirmedAt: "2026-04-13",
  },
  {
    id: "gangnam-officetel-rent-1",
    region: "역삼동",
    propertyType: "officetel",
    tradeType: "rent",
    title: "테헤란로 오피스텔 31㎡",
    price: "3,000 / 145",
    spec: "31㎡ · 7/18층 · 서향",
    summary: "단기 거주 선호 수요가 많은 타입",
    agency: "역삼원부동산",
    confirmedAt: "2026-04-07",
  },
  {
    id: "seongsu-villa-sale-1",
    region: "성수동",
    propertyType: "villa",
    tradeType: "sale",
    title: "성수동 신축 다세대 59㎡",
    price: "11억 3,000",
    spec: "59㎡ · 4/6층 · 남향",
    summary: "서울숲 생활권, 신축급 컨디션",
    agency: "성수브릿지공인중개사",
    confirmedAt: "2026-04-09",
  },
  {
    id: "haeundae-villa-rent-1",
    region: "해운대",
    propertyType: "villa",
    tradeType: "rent",
    title: "해운대 주택형 월세 82㎡",
    price: "2,000 / 120",
    spec: "82㎡ · 2/4층 · 남동향",
    summary: "바다 접근성 우수, 주차 1대 가능",
    agency: "해운대오션부동산",
    confirmedAt: "2026-04-06",
  },
];

const PROPERTY_LABELS = {
  apartment: "아파트",
  officetel: "오피스텔",
  villa: "빌라/주택",
};

const TRADE_LABELS = {
  sale: "매매",
  lease: "전세",
  rent: "월세",
};

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init.headers || {}),
    },
  });
}

function filterListings(query, propertyType, tradeType) {
  const normalizedQuery = (query || "").trim().toLowerCase();

  return SAMPLE_LISTINGS.filter((listing) => {
    const matchesQuery =
      !normalizedQuery ||
      listing.region.toLowerCase().includes(normalizedQuery) ||
      listing.title.toLowerCase().includes(normalizedQuery);
    const matchesProperty = !propertyType || listing.propertyType === propertyType;
    const matchesTrade = !tradeType || listing.tradeType === tradeType;
    return matchesQuery && matchesProperty && matchesTrade;
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/listings") {
      const query = url.searchParams.get("query") || "";
      const propertyType = url.searchParams.get("propertyType") || "";
      const tradeType = url.searchParams.get("tradeType") || "";

      const listings = filterListings(query, propertyType, tradeType);
      const summary = {
        query,
        propertyType,
        tradeType,
        propertyLabel: PROPERTY_LABELS[propertyType] || "전체",
        tradeLabel: TRADE_LABELS[tradeType] || "전체",
        count: listings.length,
        dataSource: "sample",
        notice:
          "현재 결과는 Cloudflare Worker 통합용 샘플 데이터입니다. 운영 전에는 이용 허가된 데이터 소스로 교체해야 합니다.",
      };

      return json({ summary, listings });
    }

    return env.ASSETS.fetch(request);
  },
};
