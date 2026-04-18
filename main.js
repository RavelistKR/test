document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('theme-btn');
  const body = document.body;
  const regionInput = document.getElementById('region-input');
  const searchBtn = document.getElementById('search-btn');
  const loading = document.getElementById('loading');
  const resultsContainer = document.getElementById('results-container');
  const listingsBody = document.getElementById('listings-body');
  const resultsCount = document.getElementById('results-count');
  const fallbackLink = document.getElementById('fallback-link');
  const naverRedirectBtn = document.getElementById('naver-redirect-btn');

  // 프록시 설정
  const PROXY_URL = 'https://api.allorigins.win/get?url=';
  const BASE_API_URL = 'https://new.land.naver.com/api';

  // 다크모드
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

  // API 호출
  async function apiFetch(url) {
    try {
      const response = await fetch(`${PROXY_URL}${encodeURIComponent(url)}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.contents ? JSON.parse(data.contents) : null;
    } catch (e) {
      console.error('Fetch error:', e);
      return null;
    }
  }

  // 키워드로 지역 코드 찾기
  async function getRegionCode(query) {
    // 네이버 부동산 검색 API (검색어 기반)
    const searchUrl = `https://new.land.naver.com/api/search/regions?query=${encodeURIComponent(query)}`;
    const data = await apiFetch(searchUrl);
    
    if (data && data.regionList && data.regionList.length > 0) {
      // 가장 정확도가 높은 첫 번째 검색 결과 반환
      return data.regionList[0];
    }
    return null;
  }

  // 매물 데이터 가져오기
  async function fetchListings(cortarNo) {
    const url = `${BASE_API_URL}/articles/list?cortarNo=${cortarNo}&rletTypeCd=APT:OPST:VL:OR:JW&tradeTypeCd=A1:B1:B2&sort=rank&page=1`;
    const data = await apiFetch(url);
    return data && data.articleList ? data.articleList : [];
  }

  function formatPrice(prc, rentPrc) {
    if (!prc) return '-';
    return (rentPrc && rentPrc !== "0" && rentPrc !== 0) ? `${prc}/${rentPrc}` : prc;
  }

  function renderTable(listings) {
    listingsBody.innerHTML = '';
    resultsCount.textContent = `${listings.length}건`;

    if (listings.length === 0) {
      listingsBody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 2rem;">검색된 매물이 없습니다.</td></tr>';
      return;
    }

    listings.forEach(item => {
      const row = document.createElement('tr');
      const pyeong = item.spc2 ? (Math.round(item.spc2 / 3.3057 * 10) / 10).toFixed(1) + '평' : '-';
      const link = `https://new.land.naver.com/articles/${item.atclNo}?ms=${item.lat},${item.lng},16&a=${item.rletTypeCd}&b=${item.tradeTypeCd}`;

      row.innerHTML = `
        <td class="atcl-nm"><strong>${item.atclNm}</strong></td>
        <td><span class="badge-trade ${item.tradeTypeCd}">${item.tradeTpNm}</span></td>
        <td>${item.dongNm || '-'}</td>
        <td>${pyeong}</td>
        <td>${item.flrInfo || '-'}</td>
        <td class="price">${formatPrice(item.prc, item.rentPrc)}</td>
        <td class="rltr">${item.rltrNm || '-'}</td>
        <td class="date">${item.atclDt}</td>
        <td><a href="${link}" target="_blank" class="view-link">보기</a></td>
      `;
      listingsBody.appendChild(row);
    });
  }

  async function performSearch(query) {
    if (!query) return;
    
    loading.style.display = 'block';
    resultsContainer.style.display = 'none';
    fallbackLink.style.display = 'none';

    // 1. 지역 코드 검색
    const region = await getRegionCode(query);
    
    if (!region) {
      loading.style.display = 'none';
      alert('지역을 찾을 수 없습니다. 정확한 지역명을 입력해 주세요.');
      return;
    }

    // 2. 매물 데이터 수집
    const listings = await fetchListings(region.cortarNo);
    
    loading.style.display = 'none';
    resultsContainer.style.display = 'block';

    if (listings.length > 0) {
      renderTable(listings);
    } else {
      // 데이터 수집 실패 시 네이버 부동산 직접 연결 제안
      fallbackLink.style.display = 'block';
      naverRedirectBtn.href = `https://new.land.naver.com/search?query=${encodeURIComponent(query)}`;
      renderTable([]);
    }
    
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
  }

  searchBtn.addEventListener('click', () => performSearch(regionInput.value));
  regionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch(regionInput.value);
  });

  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const query = btn.getAttribute('data-query');
      regionInput.value = query;
      performSearch(query);
    });
  });
});
