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

  function buildResultsUrl(query, propertyType, tradeType) {
    const params = new URLSearchParams({
      query,
      propertyType,
      tradeType,
    });

    return `/results.html?${params.toString()}`;
  }

  function performAnalysis(query) {
    if (!query) return;
    query = query.trim();

    loading.style.display = 'block';
    analysisResults.style.display = 'none';
    
    const cards = document.querySelectorAll('.analysis-card');
    cards.forEach(card => card.classList.remove('show'));

    // Urban 스타일의 절제된 애니메이션을 위해 0.7초 대기
    setTimeout(() => {
      // 링크 업데이트
      document.getElementById('apt-buy').href = buildResultsUrl(query, 'apartment', 'sale');
      document.getElementById('apt-rent').href = buildResultsUrl(query, 'apartment', 'lease');
      document.getElementById('apt-monthly').href = buildResultsUrl(query, 'apartment', 'rent');

      document.getElementById('opst-buy').href = buildResultsUrl(query, 'officetel', 'sale');
      document.getElementById('opst-rent').href = buildResultsUrl(query, 'officetel', 'lease');
      document.getElementById('opst-monthly').href = buildResultsUrl(query, 'officetel', 'rent');

      document.getElementById('vl-buy').href = buildResultsUrl(query, 'villa', 'sale');
      document.getElementById('vl-rent').href = buildResultsUrl(query, 'villa', 'lease');
      document.getElementById('vl-monthly').href = buildResultsUrl(query, 'villa', 'rent');

      loading.style.display = 'none';
      analysisResults.style.display = 'grid';
      
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('show');
        }, index * 100);
      });

      analysisResults.scrollIntoView({ behavior: 'smooth' });
    }, 700);
  }

  searchBtn.addEventListener('click', () => performAnalysis(regionInput.value));
  regionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performAnalysis(regionInput.value);
  });

  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-query');
      regionInput.value = q;
      performAnalysis(q);
    });
  });
});
