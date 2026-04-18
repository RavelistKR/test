document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('theme-btn');
  const body = document.body;
  const regionInput = document.getElementById('region-input');
  const searchBtn = document.getElementById('search-btn');
  const loading = document.getElementById('loading');
  const statusText = document.getElementById('status-text');
  const resultsContainer = document.getElementById('results-container');
  const listingsBody = document.getElementById('listings-body');
  const resultsCount = document.getElementById('results-count');
  const directLinkBox = document.getElementById('direct-link-box');
  const naverLink = document.getElementById('naver-link');

  // 프록시 설정
  const PROXY_URL = 'https://api.allorigins.win/get?url=';
  const BASE_API_URL = 'https://new.land.naver.com/api';

  // 주요 지역 코드 DB (API 차단 시 대비한 하드코딩)
  const REGION_DB = {
    '역삼동': '1168010100', '삼성동': '1168010500', '청담동': '1168010400', '논현동': '1168010800', '압구정동': '1168010700', '개포동': '1168010300', '도곡동': '1168011800', '대치동': '1168010600',
    '반포동': '1165010700', '방배동': '1165010100', '서초동': '1165010800', '잠원동': '1165010600', '양재동': '1165010200',
    '잠실동': '1171010100', '신천동': '1171010200', '문정동': '1171010800', '가락동': '1171010700', '방이동': '1171011100',
    '성수동': '1120011400', '한남동': '1117013100', '이촌동': '1117012200', '서교동': '1144012000', '합정동': '1144012200',
    '목동': '1147010200', '신정동': '1147010100', '상계동': '1135010500', '중계동': '1135010600', '하계동': '1135010400',
    '강남구': '1168000000', '서초구': '1165000000', '송파구': '1171000000', '마포구': '1144000000', '용산구': '1117000000', '성동구': '1120000000', '양천구': '1147000000', '노원구': '1135000000',
    '판교동': '4113510900', '백현동': '4113511100', '삼평동': '4113511000', '정자동': '4113510300', '분당구': '4113500000',
    '해운대': '2635000000', '우동': '2635010500', '중동': '2635010600', '좌동': '2635010700'
  };

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

  // API 호출 도우미
  async function apiFetch(url) {
    try {
      const response = await fetch(`${PROXY_URL}${encodeURIComponent(url)}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.contents ? JSON.parse(data.contents) : null;
    } catch (e) {
      console.error('API Error:', e);
      return null;
    }
  }

  // 매물 렌더링
  function renderTable(listings) {
    listingsBody.innerHTML = '';
    resultsCount.textContent = `${listings.length}건`;

    if (listings.length === 0) {
      listingsBody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 2rem;">데이터를 표시할 수 없습니다.</td></tr>';
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
        <td class="price">${(item.rentPrc && item.rentPrc != 0) ? item.prc + '/' + item.rentPrc : item.prc}</td>
        <td class="rltr">${item.rltrNm || '-'}</td>
        <td class="date">${item.atclDt}</td>
        <td><a href="${link}" target="_blank" class="view-link">보기</a></td>
      `;
      listingsBody.appendChild(row);
    });
  }

  // 검색 로직
  async function performSearch(query) {
    if (!query) return;
    
    query = query.trim();
    loading.style.display = 'block';
    resultsContainer.style.display = 'none';
    directLinkBox.style.display = 'none';
    statusText.textContent = `"${query}" 지역 분석 중...`;

    let cortarNo = null;

    // 1. 내장 DB 확인
    if (REGION_DB[query]) {
      cortarNo = REGION_DB[query];
      console.log('Using DB code:', cortarNo);
    } else {
      // 2. 검색 API 시도
      statusText.textContent = `지역 코드를 찾는 중...`;
      const searchData = await apiFetch(`https://new.land.naver.com/api/search/regions?query=${encodeURIComponent(query)}`);
      if (searchData && searchData.regionList && searchData.regionList.length > 0) {
        cortarNo = searchData.regionList[0].cortarNo;
      }
    }

    if (!cortarNo) {
      loading.style.display = 'none';
      alert('지역 코드를 찾을 수 없습니다. "동" 또는 "구" 이름을 정확히 입력해 주세요.');
      return;
    }

    // 3. 매물 데이터 수집
    statusText.textContent = `실시간 매물 정보를 수집 중...`;
    const listings = await apiFetch(`${BASE_API_URL}/articles/list?cortarNo=${cortarNo}&rletTypeCd=APT:OPST:VL:OR:JW&tradeTypeCd=A1:B1:B2&sort=rank&page=1`);
    
    loading.style.display = 'none';
    resultsContainer.style.display = 'block';
    naverLink.href = `https://new.land.naver.com/search?query=${encodeURIComponent(query)}`;

    if (listings && listings.articleList && listings.articleList.length > 0) {
      renderTable(listings.articleList);
    } else {
      directLinkBox.style.display = 'block';
      renderTable([]);
    }
    
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
  }

  // 이벤트 연결
  searchBtn.addEventListener('click', () => performSearch(regionInput.value));
  regionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch(regionInput.value);
  });
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-query');
      regionInput.value = q;
      performSearch(q);
    });
  });
});
