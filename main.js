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

  function generateNaverLink(query, typeLabel, tradeLabel) {
    const fullSearchQuery = `${query} ${typeLabel} ${tradeLabel}`;
    const encodedQuery = encodeURIComponent(fullSearchQuery);
    return `https://land.naver.com/search/search.naver?query=${encodedQuery}`;
  }

  function performAnalysis(query) {
    if (!query) return;
    query = query.trim();

    loading.style.display = 'block';
    analysisResults.style.display = 'none';
    
    // 이전 애니메이션 클래스 제거
    const cards = document.querySelectorAll('.analysis-card');
    cards.forEach(card => card.classList.remove('show'));

    // 분석 시뮬레이션 (조금 더 리얼한 느낌을 위해 0.6초)
    setTimeout(() => {
      // 지역 배지 업데이트
      document.getElementById('res-region-1').textContent = query;
      document.getElementById('res-region-2').textContent = query;
      document.getElementById('res-region-3').textContent = query;

      // 링크 업데이트
      document.getElementById('apt-buy').href = generateNaverLink(query, '아파트', '매매');
      document.getElementById('apt-rent').href = generateNaverLink(query, '아파트', '전세');
      document.getElementById('apt-monthly').href = generateNaverLink(query, '아파트', '월세');

      document.getElementById('opst-buy').href = generateNaverLink(query, '오피스텔', '매매');
      document.getElementById('opst-rent').href = generateNaverLink(query, '오피스텔', '전세');
      document.getElementById('opst-monthly').href = generateNaverLink(query, '오피스텔', '월세');

      document.getElementById('vl-buy').href = generateNaverLink(query, '빌라', '매매');
      document.getElementById('vl-rent').href = generateNaverLink(query, '빌라', '전세');
      document.getElementById('vl-monthly').href = generateNaverLink(query, '빌라', '월세');

      loading.style.display = 'none';
      analysisResults.style.display = 'grid';
      
      // 순차적으로 카드 나타나게 하기
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('show');
        }, index * 150);
      });

      analysisResults.scrollIntoView({ behavior: 'smooth' });
    }, 600);
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
