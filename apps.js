// Location Data
const locationData = {
  quad: {
    name: 'Main Quad',
    type: 'campus',
    aqi: 42,
    level: 'Good',
    pm25: 8.2,
    co2: 412,
    temp: 34,
    humidity: 65,
    story: '47 mature trees absorb ~24 tons of CO₂ annually—equivalent to driving 52,000 miles.'
  },
  bird: {
    name: 'Bird Library',
    type: 'campus',
    aqi: 40,
    level: 'Good',
    pm25: 7.5,
    co2: 418,
    temp: 70,
    humidity: 45,
    story: 'LED lighting on first floor cut energy use by nearly 70%.'
  },
  cst: {
    name: 'Center for Science & Tech',
    type: 'energy',
    aqi: 45,
    level: 'Good',
    pm25: 9.1,
    co2: 428,
    temp: 72,
    humidity: 42,
    story: 'Heat recovery loop captures exhaust heat. 2019-2024 HVAC upgrade cut steam usage significantly.'
  },
  dome: {
    name: 'JMA Wireless Dome',
    type: 'campus',
    aqi: 44,
    level: 'Good',
    pm25: 8.8,
    co2: 422,
    temp: 68,
    humidity: 52,
    story: '49,000+ capacity. Game days create temporary AQ impacts. Renovated 2020-22.'
  },
  ernie: {
    name: 'Ernie Davis Hall',
    type: 'campus',
    aqi: 38,
    level: 'Good',
    pm25: 6.8,
    co2: 405,
    temp: 71,
    humidity: 48,
    story: 'LEED-certified. HVAC sensors recalibrated to reduce excess energy consumption.'
  },
  steam: {
    name: 'SU Steam Station',
    type: 'energy',
    aqi: 68,
    level: 'Moderate',
    pm25: 18.4,
    co2: 485,
    temp: 38,
    humidity: 58,
    story: 'Burns natural gas for heating—biggest campus GHG source. 60% of emissions. Target: carbon neutral 2032.'
  },
  south: {
    name: 'South Campus',
    type: 'energy',
    aqi: 35,
    level: 'Good',
    pm25: 6.1,
    co2: 398,
    temp: 32,
    humidity: 68,
    story: '240 solar panels heat water for 160 apartments, avoiding 125 tons GHG/year. DOE net-zero retrofit underway.'
  }
};

// DOM Elements
const svg = document.getElementById('map');
const container = document.getElementById('container');
const popup = document.getElementById('popup');
const popupOverlay = document.getElementById('popup-overlay');
const popupContent = document.getElementById('popup-content');
const hint = document.getElementById('hint');

// Pan & Zoom State
let scale = 1.5;
let panX = -200;
let panY = -100;
let isDragging = false;
let startX, startY;

// Update map transform
function updateTransform() {
  svg.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
}

// Initialize view
updateTransform();

// Hide hint after 3 seconds
setTimeout(() => {
  hint.style.opacity = '0';
}, 3000);

// Mouse Events
container.addEventListener('mousedown', (e) => {
  if (e.target.closest('.marker-group')) return;
  isDragging = true;
  startX = e.clientX - panX;
  startY = e.clientY - panY;
});

container.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  panX = e.clientX - startX;
  panY = e.clientY - startY;
  updateTransform();
});

container.addEventListener('mouseup', () => {
  isDragging = false;
});

container.addEventListener('mouseleave', () => {
  isDragging = false;
});

// Touch Events
container.addEventListener('touchstart', (e) => {
  if (e.target.closest('.marker-group')) return;
  isDragging = true;
  startX = e.touches[0].clientX - panX;
  startY = e.touches[0].clientY - panY;
});

container.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  e.preventDefault();
  panX = e.touches[0].clientX - startX;
  panY = e.touches[0].clientY - startY;
  updateTransform();
});

container.addEventListener('touchend', () => {
  isDragging = false;
});

// Scroll Zoom
container.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  const newScale = Math.min(Math.max(scale * delta, 0.8), 4);
  
  // Zoom toward cursor
  const rect = container.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  panX = mouseX - (mouseX - panX) * (newScale / scale);
  panY = mouseY - (mouseY - panY) * (newScale / scale);
  scale = newScale;
  
  updateTransform();
});

// Zoom Controls
document.getElementById('zoom-in').addEventListener('click', () => {
  scale = Math.min(scale * 1.3, 4);
  updateTransform();
});

document.getElementById('zoom-out').addEventListener('click', () => {
  scale = Math.max(scale * 0.7, 0.8);
  updateTransform();
});

document.getElementById('reset-view').addEventListener('click', () => {
  scale = 1.5;
  panX = -200;
  panY = -100;
  updateTransform();
});

// Marker Click Events
document.querySelectorAll('.marker-group').forEach(marker => {
  marker.addEventListener('click', () => {
    const locationId = marker.dataset.location;
    showPopup(locationId);
  });
});

// Show Popup
function showPopup(id) {
  const d = locationData[id];
  if (!d) return;
  
  const aqiClass = d.aqi <= 50 ? 'aqi-good' : 'aqi-moderate';
  const levelColor = d.aqi <= 50 ? '#4ade80' : '#facc15';
  const typeLabel = d.type === 'campus' ? 'Campus Building' : 'Energy/Emissions';
  
  popupContent.innerHTML = `
    <span class="popup-type type-${d.type}">${typeLabel}</span>
    <h3>${d.name}</h3>
    <p class="popup-sub">Environmental data</p>
    <div class="aqi-row">
      <div class="aqi-badge ${aqiClass}">
        <span class="num">${d.aqi}</span>
        <span class="lbl">AQI</span>
      </div>
      <div class="aqi-info">
        <div class="level" style="color:${levelColor}">${d.level}</div>
        <div class="trend">Updated: Just now</div>
      </div>
    </div>
    <div class="data-grid">
      <div class="data-item">
        <div class="label">PM2.5</div>
        <div class="value">${d.pm25} µg/m³</div>
      </div>
      <div class="data-item">
        <div class="label">CO₂</div>
        <div class="value">${d.co2} ppm</div>
      </div>
      <div class="data-item">
        <div class="label">Temp</div>
        <div class="value">${d.temp}°F</div>
      </div>
      <div class="data-item">
        <div class="label">Humidity</div>
        <div class="value">${d.humidity}%</div>
      </div>
    </div>
    <div class="story">${d.story}</div>
  `;
  
  popup.classList.add('active');
  popupOverlay.classList.add('active');
}

// Close Popup
function closePopup() {
  popup.classList.remove('active');
  popupOverlay.classList.remove('active');
}

document.getElementById('popup-close').addEventListener('click', closePopup);
popupOverlay.addEventListener('click', closePopup);

// Close popup with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closePopup();
  }
});
