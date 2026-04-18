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

  // 네이버 부동산 딥링크 생성 함수 (자연어 통합 검색 방식)
  function generateNaverLink(query, typeLabel, tradeLabel) {
    // query: "역삼동", typeLabel: "아파트", tradeLabel: "매매"
    // 네이버 검색 엔진이 가장 정확하게 인식하는 '지역 + 유형 + 거래' 조합 생성
    const fullQuery = `${query} ${typeLabel} ${tradeLabel}`;
    const encodedQuery = encodeURIComponent(fullQuery);
    
    // search?query 방식은 자연어를 입력했을 때 가장 정확하게 해당 위치로 이동합니다.
    return `https://new.land.naver.com/search?query=${encodedQuery}`;
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

      // 링크 업데이트 (자연어 명칭 전달)
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
