let currentType = 'iqq';
const DEFAULT_IMG = 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/167/167.jpg';

// Prevent auto-zoom on input focus for iOS/WeChat browsers
function preventAutoZoom() {
  const isWeChat = /MicroMessenger/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (!isWeChat && !isIOS) return;

  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) return;

  const originalContent = viewport.getAttribute('content');
  const zoomDisabledContent = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';

  document.querySelectorAll('input[type="text"]').forEach(function(input) {
    input.addEventListener('focus', function() {
      viewport.setAttribute('content', zoomDisabledContent);
    });

    input.addEventListener('blur', function() {
      viewport.setAttribute('content', originalContent);
    });
  });
}

document.addEventListener('DOMContentLoaded', preventAutoZoom);

// Platform selection
document.getElementById('platformGrid').addEventListener('click', function(e) {
  const btn = e.target.closest('.platform-btn');
  if (!btn) return;

  document.querySelectorAll('.platform-btn').forEach(function(b) {
    b.classList.remove('active');
  });
  btn.classList.add('active');
  currentType = btn.dataset.type;
});

// Auto-detect system theme preference
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

function updateTheme(e) {
  if (e.matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

updateTheme(mediaQuery);
mediaQuery.addEventListener('change', updateTheme);

function setPhotoError(img) {
  img.onerror = null;
  img.src = DEFAULT_IMG;
}

function showResult(container, resultPanel) {
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      document.body.classList.add('has-result');
      container.classList.add('has-result');

      if (window.innerWidth <= 768) {
        setTimeout(function() {
          resultPanel.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }, 400);
      }
    });
  });
}

function renderHeroContent(data) {
  return `
    <div class="hero-meta">
      <img class="hero-img" src="${data.photo}" alt="${data.name}" onerror="setPhotoError(this)">
      <div class="hero-title">
        <div class="hero-name">${data.name}</div>
        <div class="hero-alias">${data.alias}</div>
      </div>
    </div>
    <ul class="power-list">
      <li class="power-item">
        <span class="power-label">${data.area || '-'}</span>
        <span class="power-val">${data.areaPower || '-'}</span>
      </li>
      <li class="power-item">
        <span class="power-label">${data.city || '-'}</span>
        <span class="power-val">${data.cityPower || '-'}</span>
      </li>
      <li class="power-item">
        <span class="power-label">${data.province || '-'}</span>
        <span class="power-val">${data.provincePower || '-'}</span>
      </li>
      <li class="power-item">
        <span class="power-label guobiao">国标</span>
        <span class="power-val guobiao">${data.guobiao || '-'}</span>
      </li>
    </ul>
  `;
}

function renderErrorContent(errorMessage) {
  return `
    <div class="hero-meta">
      <div class="hero-title" style="width: 100%;">
        <div class="hero-name">请输入正确的英雄名称</div>
        <div class="hero-alias">${errorMessage}</div>
      </div>
    </div>
    <ul class="power-list">
      <li class="power-item">
        <span class="power-label">-</span>
        <span class="power-val">-</span>
      </li>
      <li class="power-item">
        <span class="power-label">-</span>
        <span class="power-val">-</span>
      </li>
      <li class="power-item">
        <span class="power-label">-</span>
        <span class="power-val">-</span>
      </li>
      <li class="power-item">
        <span class="power-label guobiao">国标</span>
        <span class="power-val guobiao">-</span>
      </li>
    </ul>
  `;
}

function delay(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
}

async function query() {
  const heroInput = document.getElementById('hero');
  const hero = heroInput.value.trim();
  const btn = document.getElementById('queryBtn');
  const container = document.getElementById('container');
  const resultPanel = document.getElementById('resultPanel');
  const content = document.getElementById('resultContent');

  if (!hero) {
    heroInput.focus();
    return;
  }

  btn.disabled = true;
  const originalText = btn.textContent;
  btn.innerHTML = '查询中 <span class="loading-line"></span>';

  if (container.classList.contains('has-result')) {
    container.classList.remove('has-result');
    await delay(400);
  }

  try {
    const url = `https://api.xxoo.team/hero/getHeroInfo.php?hero=${encodeURIComponent(hero)}&type=${currentType}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.code !== 200) {
      throw new Error(data.msg || '无法同步数据');
    }

    content.innerHTML = renderHeroContent(data.data);
  } catch (e) {
    content.innerHTML = renderErrorContent(e.message);
  } finally {
    showResult(container, resultPanel);
    btn.disabled = false;
    btn.textContent = originalText;
  }
}
