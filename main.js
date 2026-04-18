document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('theme-btn');
  const body = document.body;
  const regionInput = document.getElementById('region-input');
  const searchBtn = document.getElementById('search-btn');
  const loading = document.getElementById('loading');
  const analysisResults = document.getElementById('analysis-results');

  // 테마 설정
  const savedTheme = localStorage.getItem('theme') || 'light';
  body.setAttribute('data-theme', savedTheme);
  themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

  themeBtn.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  });

  // 네이버 부동산 딥링크 생성 함수
  function generateNaverLink(query, type, trade) {
    // type: APT(아파트), OPST(오피스텔), VL(빌라/주택)
    // trade: A1(매매), B1(전세), B2(월세)
    const encodedQuery = encodeURIComponent(query);
    let baseUrl = `https://new.land.naver.com/search?query=${encodedQuery}`;
    
    // 상세 필터 파라미터 추가
    // rletTypeCd: 아파트(APT), 오피스텔(OPST), 빌라(VL), 상가(SG) 등
    // tradeTypeCd: 매매(A1), 전세(B1), 월세(B2)
    return `${baseUrl}&rletTypeCd=${type}&tradeTypeCd=${trade}`;
  }

  function performAnalysis(query) {
    if (!query) return;
    query = query.trim();

    loading.style.display = 'block';
    analysisResults.style.display = 'none';

    // 분석 시뮬레이션 (사용자 경험을 위해 0.8초 대기)
    setTimeout(() => {
      // 지역 배지 업데이트
      document.getElementById('res-region-1').textContent = query;
      document.getElementById('res-region-2').textContent = query;
      document.getElementById('res-region-3').textContent = query;

      // 링크 업데이트
      // 아파트
      document.getElementById('apt-buy').href = generateNaverLink(query, 'APT', 'A1');
      document.getElementById('apt-rent').href = generateNaverLink(query, 'APT', 'B1');
      document.getElementById('apt-monthly').href = generateNaverLink(query, 'APT', 'B2');

      // 오피스텔
      document.getElementById('opst-buy').href = generateNaverLink(query, 'OPST', 'A1');
      document.getElementById('opst-rent').href = generateNaverLink(query, 'OPST', 'B1');
      document.getElementById('opst-monthly').href = generateNaverLink(query, 'OPST', 'B2');

      // 빌라/주택
      document.getElementById('vl-buy').href = generateNaverLink(query, 'VL', 'A1');
      document.getElementById('vl-rent').href = generateNaverLink(query, 'VL', 'B1');
      document.getElementById('vl-monthly').href = generateNaverLink(query, 'VL', 'B2');

      loading.style.display = 'none';
      analysisResults.style.display = 'grid';
      analysisResults.scrollIntoView({ behavior: 'smooth' });
    }, 800);
  }

  searchBtn.addEventListener('click', () => performAnalysis(regionInput.value));
  regionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performAnalysis(regionInput.value);
  });

  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-query');
      regionInput.value = q;
      performAnalysis(q);
    });
  });
});
