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

  // 프록시 목록 (순차적으로 시도)
  const PROXY_LIST = [
    (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url) => `https://thingproxy.freeboard.io/fetch/${url}`
  ];

  const BASE_API_URL = 'https://new.land.naver.com/api';

  const SIDO_LIST = [
    { code: '1100000000', name: '서울특별시' },
    { code: '4100000000', name: '경기도' },
    { code: '2800000000', name: '인천광역시' },
    { code: '2600000000', name: '부산광역시' },
    { code: '2700000000', name: '대구광역시' },
    { code: '3000000000', name: '대전광역시' },
    { code: '2900000000', name: '광주광역시' },
    { code: '3100000000', name: '울산광역시' },
    { code: '3600000000', name: '세종특별자치시' },
    { code: '5100000000', name: '강원특별자치도' },
    { code: '4300000000', name: '충청북도' },
    { code: '4400000000', name: '충청남도' },
    { code: '4500000000', name: '전라북도' },
    { code: '4600000000', name: '전라남도' },
    { code: '4700000000', name: '경상북도' },
    { code: '4800000000', name: '경상남도' },
    { code: '5000000000', name: '제주특별자치도' }
  ];

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

  // 통합 API 호출 함수 (폴백 로직 포함)
  async function apiFetch(url) {
    for (const getProxyUrl of PROXY_LIST) {
      try {
        const proxyUrl = getProxyUrl(url);
        console.log('Trying proxy:', proxyUrl);
        const response = await fetch(proxyUrl);
        if (!response.ok) continue;

        const data = await response.json();
        
        // AllOrigins 특수 처리
        if (data.contents) {
          try {
            return JSON.parse(data.contents);
          } catch {
            return data.contents;
          }
        }
        return data;
      } catch (err) {
        console.warn('Proxy failed, trying next...', err);
        continue;
      }
    }
    return null;
  }

  function initSido() {
    sidoSelect.innerHTML = '<option value="">시/도를 선택하세요</option>';
    SIDO_LIST.forEach(sido => {
      const option = document.createElement('option');
      option.value = sido.code;
      option.textContent = sido.name;
      sidoSelect.appendChild(option);
    });
  }

  sidoSelect.addEventListener('change', async () => {
    const sidoCode = sidoSelect.value;
    gunguSelect.innerHTML = '<option value="">불러오는 중...</option>';
    dongSelect.innerHTML = '<option value="">동을 선택하세요</option>';
    gunguSelect.disabled = true;
    dongSelect.disabled = true;

    if (sidoCode) {
      const url = `${BASE_API_URL}/regions/list?cortarNo=${sidoCode}`;
      const data = await apiFetch(url);
      
      if (data && data.regionList) {
        gunguSelect.innerHTML = '<option value="">구/군을 선택하세요</option>';
        data.regionList.forEach(gungu => {
          const option = document.createElement('option');
          option.value = gungu.cortarNo;
          option.textContent = gungu.cortarNm;
          gunguSelect.appendChild(option);
        });
        gunguSelect.disabled = false;
      } else {
        gunguSelect.innerHTML = '<option value="">연결 실패 (다시 시도)</option>';
        alert('데이터 연결이 원활하지 않습니다. 다시 한번 시도해 주세요.');
      }
    }
  });

  gunguSelect.addEventListener('change', async () => {
    const gunguCode = gunguSelect.value;
    dongSelect.innerHTML = '<option value="">불러오는 중...</option>';
    dongSelect.disabled = true;

    if (gunguCode) {
      const url = `${BASE_API_URL}/regions/list?cortarNo=${gunguCode}`;
      const data = await apiFetch(url);
      
      if (data && data.regionList) {
        dongSelect.innerHTML = '<option value="">동을 선택하세요</option>';
        data.regionList.forEach(dong => {
          const option = document.createElement('option');
          option.value = dong.cortarNo;
          option.textContent = dong.cortarNm;
          dongSelect.appendChild(option);
        });
        dongSelect.disabled = false;
      }
    }
  });

  async function fetchListings(cortarNo) {
    const url = `${BASE_API_URL}/articles/list?cortarNo=${cortarNo}&rletTypeCd=APT:OPST:VL:OR:JW&tradeTypeCd=A1:B1:B2&sort=rank&page=1`;
    const data = await apiFetch(url);
    return data && data.articleList ? data.articleList : [];
  }

  function formatPrice(prc, rentPrc) {
    if (!prc) return '-';
    if (rentPrc && rentPrc !== "0" && rentPrc !== 0) return `${prc}/${rentPrc}`;
    return prc;
  }

  function renderListings(listings) {
    listingsBody.innerHTML = '';
    resultsCount.textContent = `${listings.length}건`;

    if (listings.length === 0) {
      listingsBody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 2rem;">데이터를 불러오지 못했습니다. 잠시 후 다시 조회를 눌러주세요.</td></tr>';
      return;
    }

    listings.forEach(item => {
      const row = document.createElement('tr');
      const pyeong = item.spc2 ? (Math.round(item.spc2 / 3.3057 * 10) / 10).toFixed(1) + '평' : '-';
      const link = `https://new.land.naver.com/articles/${item.atclNo}?ms=${item.lat},${item.lng},16&a=${item.rletTypeCd}&b=${item.tradeTypeCd}&e=overall`;

      row.innerHTML = `
        <td class="atcl-nm"><strong>${item.atclNm}</strong></td>
        <td><span class="badge-trade ${item.tradeTypeCd}">${item.tradeTpNm}</span></td>
        <td>${item.dongNm || '-'}</td>
        <td>${pyeong}</td>
        <td>${item.flrInfo || '-'}</td>
        <td class="price">${formatPrice(item.prc, item.rentPrc)}</td>
        <td class="rltr">${item.rltrNm || '-'}</td>
        <td class="date">${item.atclDt}</td>
        <td><a href="${link}" target="_blank" class="view-link">상세보기</a></td>
      `;
      listingsBody.appendChild(row);
    });
  }

  searchBtn.addEventListener('click', async () => {
    const targetCode = dongSelect.value || gunguSelect.value || sidoSelect.value;
    if (!targetCode || targetCode === sidoSelect.options[0].value) {
      alert('지역을 선택해 주세요.');
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
