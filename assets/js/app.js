let currentType = 'aqq';
const defaultImg = 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/167/167.jpg';

// Platform selection
document.getElementById('platformGrid').addEventListener('click', (e) => {
  const btn = e.target.closest('.platform-btn');
  if (btn) {
    document.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentType = btn.dataset.type;
  }
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

// Initial theme setup
updateTheme(mediaQuery);

// Listen for system theme changes
mediaQuery.addEventListener('change', updateTheme);

function setPhotoError(img) {
  img.onerror = null;
  img.src = defaultImg;
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

  // Reset result panel state for new query
  if (container.classList.contains('has-result')) {
    // First remove the class to trigger exit animation
    container.classList.remove('has-result');
    // Wait for exit animation to complete
    await new Promise(resolve => setTimeout(resolve, 400));
  }

  try {
    const res = await fetch(`https://api.xxoo.team/hero/getHeroInfo.php?hero=${encodeURIComponent(hero)}&type=${currentType}`);
    const data = await res.json();

    if (data.code !== 200) throw new Error(data.msg || '无法同步数据');

    const d = data.data;

    // Render content
    content.innerHTML = `
      <div class="hero-meta">
        <img class="hero-img" src="${d.photo}" alt="${d.name}" onerror="setPhotoError(this)">
        <div class="hero-title">
          <div class="hero-name">${d.name}</div>
          <div class="hero-alias">${d.alias}</div>
        </div>
      </div>
      <ul class="power-list">
        <li class="power-item">
          <span class="power-label">${d.area || '-'}</span>
          <span class="power-val">${d.areaPower || '-'}</span>
        </li>
        <li class="power-item">
          <span class="power-label">${d.city || '-'}</span>
          <span class="power-val">${d.cityPower || '-'}</span>
        </li>
        <li class="power-item">
          <span class="power-label">${d.province || '-'}</span>
          <span class="power-val">${d.provincePower || '-'}</span>
        </li>
        <li class="power-item">
          <span class="power-label guobiao">国标</span>
          <span class="power-val guobiao">${d.guobiao || '-'}</span>
        </li>
      </ul>
    `;

    // Trigger animations with proper timing
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add('has-result');
        container.classList.add('has-result');

        // Auto scroll to result panel on mobile
        if (window.innerWidth <= 768) {
          setTimeout(() => {
            resultPanel.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            });
          }, 400);
        }
      });
    });

  } catch (e) {
    content.innerHTML = `
      <div class="hero-meta">
        <div class="hero-title" style="width: 100%;">
          <div class="hero-name">请输入正确的英雄名称</div>
          <div class="hero-alias">${e.message}</div>
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
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add('has-result');
        container.classList.add('has-result');

        // Auto scroll to result panel on mobile
        if (window.innerWidth <= 768) {
          setTimeout(() => {
            resultPanel.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            });
          }, 400);
        }
      });
    });
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}
