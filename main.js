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

  // 네이버 부동산 딥링크 생성 함수 (가장 정확한 구형 통합검색 엔드포인트 사용)
  function generateNaverLink(query, typeLabel, tradeLabel) {
    // query: "역삼동", typeLabel: "아파트", tradeLabel: "매매"
    // 네이버 부동산 구형 검색 엔진은 자연어를 처리하여 신형 지도로 리다이렉트해주는 능력이 가장 탁월합니다.
    const fullSearchQuery = `${query} ${typeLabel} ${tradeLabel}`;
    const encodedQuery = encodeURIComponent(fullSearchQuery);
    
    // 이 URL은 네이버가 좌표(ms)를 자동으로 계산하여 신형 지도로 정확하게 넘겨줍니다.
    return `https://land.naver.com/search/search.naver?query=${encodedQuery}`;
  }

  function performAnalysis(query) {
    if (!query) return;
    query = query.trim();

    loading.style.display = 'block';
    analysisResults.style.display = 'none';

    // 분석 시뮬레이션 (0.5초)
    setTimeout(() => {
      // 지역 배지 업데이트
      document.getElementById('res-region-1').textContent = query;
      document.getElementById('res-region-2').textContent = query;
      document.getElementById('res-region-3').textContent = query;

      // 링크 업데이트 (가장 확실한 리다이렉트 경로 적용)
      // 아파트
      document.getElementById('apt-buy').href = generateNaverLink(query, '아파트', '매매');
      document.getElementById('apt-rent').href = generateNaverLink(query, '아파트', '전세');
      document.getElementById('apt-monthly').href = generateNaverLink(query, '아파트', '월세');

      // 오피스텔
      document.getElementById('opst-buy').href = generateNaverLink(query, '오피스텔', '매매');
      document.getElementById('opst-rent').href = generateNaverLink(query, '오피스텔', '전세');
      document.getElementById('opst-monthly').href = generateNaverLink(query, '오피스텔', '월세');

      // 빌라/주택
      document.getElementById('vl-buy').href = generateNaverLink(query, '빌라', '매매');
      document.getElementById('vl-rent').href = generateNaverLink(query, '빌라', '전세');
      document.getElementById('vl-monthly').href = generateNaverLink(query, '빌라', '월세');

      loading.style.display = 'none';
      analysisResults.style.display = 'grid';
      analysisResults.scrollIntoView({ behavior: 'smooth' });
    }, 500);
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
