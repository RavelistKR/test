document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('theme-btn');
  const body = document.body;
  const sidoSelect = document.getElementById('sido');
  const gunguSelect = document.getElementById('gungu');
  const dongSelect = document.getElementById('dong');
  const searchBtn = document.getElementById('search-btn');
  const loading = document.getElementById('loading');
  const resultsContainer = document.getElementById('results-container');
  const listingsBody = document.getElementById('listings-body');
  const resultsCount = document.getElementById('results-count');

  // Proxy 설정 (allorigins의 /get 사용 - JSON으로 감싸져 옴)
  const PROXY_URL = 'https://api.allorigins.win/get?url=';
  const BASE_API_URL = 'https://new.land.naver.com/api';

  // 다크모드 설정
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

  // API 호출 도우미 함수
  async function apiFetch(url) {
    try {
      const proxyUrl = `${PROXY_URL}${encodeURIComponent(url)}`;
      console.log('Requesting via proxy:', proxyUrl);
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      
      const wrapper = await response.json();
      // allorigins/get은 실제 데이터를 contents 필드에 문자열로 담아줍니다
      if (!wrapper.contents) return null;
      
      return JSON.parse(wrapper.contents);
    } catch (error) {
      console.error('API Fetch Error:', error);
      return null;
    }
  }

  // 지역 정보 가져오기
  async function fetchRegions(parentCode = '0000000000') {
    const url = `${BASE_API_URL}/regions/list?cortarNo=${parentCode}`;
    const data = await apiFetch(url);
    return data && data.regionList ? data.regionList : [];
  }

  // 초기 시/도 데이터 로드
  async function initSido() {
    const sidos = await fetchRegions();
    sidoSelect.innerHTML = '<option value="">시/도를 선택하세요</option>';
    if (sidos.length === 0) {
      sidoSelect.innerHTML = '<option value="">데이터를 불러오지 못했습니다</option>';
      return;
    }
    sidos.forEach(sido => {
      const option = document.createElement('option');
      option.value = sido.cortarNo;
      option.textContent = sido.cortarNm;
      sidoSelect.appendChild(option);
    });
  }

  // 구/군 업데이트
  sidoSelect.addEventListener('change', async () => {
    const sidoCode = sidoSelect.value;
    gunguSelect.innerHTML = '<option value="">불러오는 중...</option>';
    dongSelect.innerHTML = '<option value="">동을 선택하세요</option>';
    gunguSelect.disabled = true;
    dongSelect.disabled = true;

    if (sidoCode) {
      const gungus = await fetchRegions(sidoCode);
      gunguSelect.innerHTML = '<option value="">구/군을 선택하세요</option>';
      gungus.forEach(gungu => {
        const option = document.createElement('option');
        option.value = gungu.cortarNo;
        option.textContent = gungu.cortarNm;
        gunguSelect.appendChild(option);
      });
      gunguSelect.disabled = false;
    } else {
      gunguSelect.innerHTML = '<option value="">구/군을 선택하세요</option>';
    }
  });

  // 동 업데이트
  gunguSelect.addEventListener('change', async () => {
    const gunguCode = gunguSelect.value;
    dongSelect.innerHTML = '<option value="">불러오는 중...</option>';
    dongSelect.disabled = true;

    if (gunguCode) {
      const dongs = await fetchRegions(gunguCode);
      dongSelect.innerHTML = '<option value="">동을 선택하세요</option>';
      dongs.forEach(dong => {
        const option = document.createElement('option');
        option.value = dong.cortarNo;
        option.textContent = dong.cortarNm;
        dongSelect.appendChild(option);
      });
      dongSelect.disabled = false;
    } else {
      dongSelect.innerHTML = '<option value="">동을 선택하세요</option>';
    }
  });

  // 매물 데이터 가져오기
  async function fetchListings(cortarNo) {
    // APT: 아파트, OPST: 오피스텔, VL: 빌라 등
    const url = `${BASE_API_URL}/articles/list?cortarNo=${cortarNo}&rletTypeCd=APT:OPST:VL:OR:JW&tradeTypeCd=A1:B1:B2&sort=rank&page=1`;
    const data = await apiFetch(url);
    return data && data.articleList ? data.articleList : [];
  }

  // 평형 계산 (㎡ -> 평)
  function formatPyeong(m2) {
    if (!m2) return '-';
    return (Math.round(m2 / 3.3057 * 10) / 10).toFixed(1) + '평';
  }

  // 가격 포맷팅
  function formatPrice(prc, rentPrc) {
    if (!prc) return '-';
    if (rentPrc && rentPrc !== "0" && rentPrc !== 0) {
      return `${prc}/${rentPrc}`;
    }
    return prc;
  }

  // 테이블 렌더링
  function renderListings(listings) {
    listingsBody.innerHTML = '';
    resultsCount.textContent = `${listings.length}건`;

    if (listings.length === 0) {
      listingsBody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 2rem;">데이터를 불러오지 못했거나 매물이 없습니다. 지역을 다시 선택해 보세요.</td></tr>';
      return;
    }

    listings.forEach(item => {
      const row = document.createElement('tr');
      const link = `https://new.land.naver.com/articles/${item.atclNo}?ms=${item.lat},${item.lng},16&a=${item.rletTypeCd}&b=${item.tradeTypeCd}&e=overall`;

      row.innerHTML = `
        <td class="atcl-nm"><strong>${item.atclNm}</strong></td>
        <td><span class="badge-trade ${item.tradeTypeCd}">${item.tradeTpNm}</span></td>
        <td>${item.dongNm || '-'}</td>
        <td>${formatPyeong(item.spc2)}</td>
        <td>${item.flrInfo || '-'}</td>
        <td class="price">${formatPrice(item.prc, item.rentPrc)}</td>
        <td class="rltr">${item.rltrNm || '-'}</td>
        <td class="date">${item.atclDt}</td>
        <td><a href="${link}" target="_blank" class="view-link">상세보기</a></td>
      `;
      listingsBody.appendChild(row);
    });
  }

  // 검색 실행
  searchBtn.addEventListener('click', async () => {
    const targetCode = dongSelect.value || gunguSelect.value || sidoSelect.value;
    
    if (!targetCode || targetCode === '0000000000') {
      alert('분석할 지역을 선택해 주세요.');
      return;
    }

    loading.style.display = 'block';
    resultsContainer.style.display = 'none';

    const listings = await fetchListings(targetCode);
    renderListings(listings);
    
    loading.style.display = 'none';
    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
  });

  initSido();
});
