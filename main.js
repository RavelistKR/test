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

  // 다중 프록시 목록 (성공할 때까지 순차 시도)
  const PROXIES = [
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    (url) => `https://thingproxy.freeboard.io/fetch/${url}`
  ];

  // 주요 지역 코드 (API가 막혔을 때를 대비한 핵심 DB)
  const REGION_DB = {
    '역삼동': '1168010100', '삼성동': '1168010500', '청담동': '1168010400', '대치동': '1168010600',
    '반포동': '1165010700', '서초동': '1165010800', '방배동': '1165010100', '잠원동': '1165010600',
    '잠실동': '1171010100', '문정동': '1171010800', '가락동': '1171010700', '방이동': '1171011100',
    '성수동': '1120011400', '한남동': '1117013100', '이촌동': '1117012200', '서교동': '1144012000',
    '강남구': '1168000000', '서초구': '1165000000', '송파구': '1171000000', '마포구': '1144000000',
    '분당구': '4113500000', '판교동': '4113510900', '정자동': '4113510300', '해운대': '2635000000'
  };

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

  // 강력한 패치 함수 (프록시 폴백 로직)
  async function robustFetch(targetUrl) {
    for (const getProxyUrl of PROXIES) {
      try {
        const url = getProxyUrl(targetUrl);
        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) continue;

        let result = await response.json();
        // AllOrigins 특수 처리
        if (result.contents) {
          try {
            result = JSON.parse(result.contents);
          } catch {
            result = result.contents;
          }
        }
        if (result) return result;
      } catch (e) {
        console.warn('Proxy failed, trying next...');
      }
    }
    return null;
  }

  // 매물 테이블 그리기
  function renderTable(articles) {
    listingsBody.innerHTML = '';
    resultsCount.textContent = `${articles.length}건`;

    if (!articles || articles.length === 0) {
      listingsBody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 3rem;">현재 이 지역에 수집 가능한 매물이 없습니다.</td></tr>';
      return;
    }

    articles.forEach(atcl => {
      const row = document.createElement('tr');
      const pyeong = atcl.spc2 ? (Math.round(atcl.spc2 / 3.3057 * 10) / 10).toFixed(1) + '평' : '-';
      const priceStr = atcl.rentPrc && atcl.rentPrc != '0' ? `${atcl.prc}/${atcl.rentPrc}` : atcl.prc;
      const detailLink = `https://new.land.naver.com/articles/${atcl.atclNo}?ms=${atcl.lat},${atcl.lng},16&a=${atcl.rletTypeCd}&b=${atcl.tradeTypeCd}`;

      row.innerHTML = `
        <td class="atcl-nm"><strong>${atcl.atclNm}</strong></td>
        <td><span class="badge-trade ${atcl.tradeTypeCd}">${atcl.tradeTpNm}</span></td>
        <td>${atcl.dongNm || '-'}</td>
        <td>${pyeong}</td>
        <td>${atcl.flrInfo || '-'}</td>
        <td class="price">${priceStr}</td>
        <td class="rltr">${atcl.rltrNm || '-'}</td>
        <td class="date">${atcl.atclDt}</td>
        <td><a href="${detailLink}" target="_blank" class="view-link">보기</a></td>
      `;
      listingsBody.appendChild(row);
    });
  }

  // 검색 실행
  async function doSearch(query) {
    if (!query) return;
    query = query.trim();

    loading.style.display = 'block';
    resultsContainer.style.display = 'none';
    directLinkBox.style.display = 'none';
    statusText.textContent = `"${query}" 분석 시작...`;

    let cortarNo = REGION_DB[query];

    // 1. 코드가 없으면 검색 API 시도
    if (!cortarNo) {
      statusText.textContent = `지역 코드를 확인 중...`;
      const searchRes = await robustFetch(`https://new.land.naver.com/api/search/regions?query=${encodeURIComponent(query)}`);
      if (searchRes && searchRes.regionList && searchRes.regionList.length > 0) {
        cortarNo = searchRes.regionList[0].cortarNo;
      }
    }

    if (!cortarNo) {
      loading.style.display = 'none';
      alert('정확한 지역명(예: 역삼동)을 입력해 주세요.');
      return;
    }

    // 2. 매물 데이터 수집
    statusText.textContent = `실시간 매물을 가져오는 중...`;
    const listingRes = await robustFetch(`https://new.land.naver.com/api/articles/list?cortarNo=${cortarNo}&rletTypeCd=APT:OPST:VL:OR:JW&tradeTypeCd=A1:B1:B2&sort=rank&page=1`);
    
    loading.style.display = 'none';
    resultsContainer.style.display = 'block';
    naverLink.href = `https://new.land.naver.com/search?query=${encodeURIComponent(query)}`;

    if (listingRes && listingRes.articleList && listingRes.articleList.length > 0) {
      renderTable(listingRes.articleList);
    } else {
      // 차단되었거나 매물 없을 때
      directLinkBox.style.display = 'block';
      renderTable([]);
    }
    
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
  }

  // 이벤트
  searchBtn.addEventListener('click', () => doSearch(regionInput.value));
  regionInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') doSearch(regionInput.value); });
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-query');
      regionInput.value = q;
      doSearch(q);
    });
  });
});
