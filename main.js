document.addEventListener('DOMContentLoaded', () => {
  const lottoContainer = document.getElementById('lotto-container');
  const generateBtn = document.getElementById('generate-btn');
  const themeBtn = document.getElementById('theme-btn');
  const body = document.body;

  // 다크모드 초기 설정
  const savedTheme = localStorage.getItem('theme') || 'light';
  body.setAttribute('data-theme', savedTheme);
  themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

  // 테마 변경 핸들러
  themeBtn.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  });

  function getBallColorClass(num) {
    if (num <= 10) return 'ball-10';
    if (num <= 20) return 'ball-20';
    if (num <= 30) return 'ball-30';
    if (num <= 40) return 'ball-40';
    return 'ball-45';
  }

  function generateLottoNumbers() {
    const numbers = [];
    while (numbers.length < 6) {
      const num = Math.floor(Math.random() * 45) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    return numbers.sort((a, b) => a - b);
  }

  function displayNumbers() {
    const numbers = generateLottoNumbers();
    lottoContainer.innerHTML = '';

    numbers.forEach((num, index) => {
      const ball = document.createElement('div');
      ball.className = `ball ${getBallColorClass(num)}`;
      ball.textContent = num;
      
      ball.style.opacity = '0';
      ball.style.transform = 'translateY(20px)';
      lottoContainer.appendChild(ball);

      setTimeout(() => {
        ball.style.transition = 'all 0.4s ease-out';
        ball.style.opacity = '1';
        ball.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  generateBtn.addEventListener('click', displayNumbers);
});
