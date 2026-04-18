document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const themeBtn = document.getElementById('theme-btn');
  const titleEl = document.getElementById('page-title');
  const subtitleEl = document.getElementById('page-subtitle');
  const summaryEl = document.getElementById('summary');
  const noticeEl = document.getElementById('notice');
  const resultsEl = document.getElementById('results');

  const savedTheme = localStorage.getItem('theme') || 'light';
  body.setAttribute('data-theme', savedTheme);
  themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

  themeBtn.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
    themeBtn.textContent = nextTheme === 'dark' ? '☀️' : '🌙';
  });

  const params = new URLSearchParams(window.location.search);
  const query = (params.get('query') || '').trim();
  const propertyType = params.get('propertyType') || '';
  const tradeType = params.get('tradeType') || '';

  if (!query || !propertyType || !tradeType) {
    titleEl.textContent = '잘못된 접근입니다.';
    subtitleEl.textContent = '지역, 매물 유형, 거래 유형이 모두 필요합니다.';
    resultsEl.innerHTML = '<article class="empty">메인 페이지에서 다시 검색해 주세요.</article>';
    return;
  }

  titleEl.textContent = `${query} ${mapPropertyType(propertyType)} ${mapTradeType(tradeType)} 분석`;
  subtitleEl.textContent = 'Cloudflare Worker API 응답을 기준으로 매물 정보를 정리했습니다.';
  resultsEl.innerHTML = '<div class="loading">매물 데이터를 불러오는 중입니다...</div>';

  fetch(`/api/listings?query=${encodeURIComponent(query)}&propertyType=${encodeURIComponent(propertyType)}&tradeType=${encodeURIComponent(tradeType)}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`API ${response.status}`);
      }
      return response.json();
    })
    .then((payload) => {
      renderSummary(payload.summary);
      renderNotice(payload.summary.notice);
      renderListings(payload.listings);
    })
    .catch(() => {
      resultsEl.innerHTML = '<article class="empty">데이터를 불러오지 못했습니다. Worker 배포 설정과 `/api/listings` 응답을 확인해 주세요.</article>';
    });

  function renderSummary(summary) {
    const items = [
      { label: '지역', value: summary.query || '-' },
      { label: '유형', value: summary.propertyLabel || '-' },
      { label: '거래', value: summary.tradeLabel || '-' },
      { label: '결과 수', value: `${summary.count}건` },
    ];

    summaryEl.innerHTML = items.map((item) => `
      <article class="summary-card">
        <div class="summary-label">${item.label}</div>
        <div class="summary-value">${item.value}</div>
      </article>
    `).join('');
  }

  function renderNotice(notice) {
    if (!notice) {
      noticeEl.style.display = 'none';
      return;
    }

    noticeEl.style.display = 'block';
    noticeEl.textContent = notice;
  }

  function renderListings(listings) {
    if (!Array.isArray(listings) || listings.length === 0) {
      resultsEl.innerHTML = '<article class="empty">조건에 맞는 샘플 매물이 없습니다. 다른 지역이나 유형으로 다시 시도해 주세요.</article>';
      return;
    }

    resultsEl.innerHTML = listings.map((listing) => `
      <article class="listing-card">
        <div class="listing-head">
          <div class="listing-title">${listing.title}</div>
          <div class="listing-price">${listing.price}</div>
        </div>
        <div class="pill-row">
          <span class="pill">${mapPropertyType(listing.propertyType)}</span>
          <span class="pill">${mapTradeType(listing.tradeType)}</span>
          <span class="pill">${listing.region}</span>
        </div>
        <div class="listing-meta">${listing.spec}</div>
        <div class="listing-meta">${listing.summary}</div>
        <div class="listing-meta">중개사: ${listing.agency} · 확인일: ${listing.confirmedAt}</div>
      </article>
    `).join('');
  }

  function mapPropertyType(value) {
    return {
      apartment: '아파트',
      officetel: '오피스텔',
      villa: '빌라/주택',
    }[value] || value;
  }

  function mapTradeType(value) {
    return {
      sale: '매매',
      lease: '전세',
      rent: '월세',
    }[value] || value;
  }
});
