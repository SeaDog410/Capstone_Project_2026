// ─── Auth state ───────────────────────────────────────────────────────────────
let currentUser = null;

function getToken() { return localStorage.getItem('nest_token'); }
function setToken(t) { localStorage.setItem('nest_token', t); }
function clearToken() { localStorage.removeItem('nest_token'); }

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) { logout(); return null; }
  return res;
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const token = getToken();
  if (!token) { showLogin(); return; }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) { clearToken(); showLogin(); return; }
    currentUser = payload;
    showApp();
  } catch { clearToken(); showLogin(); }
});

// ─── Login screen ─────────────────────────────────────────────────────────────
function showLogin() {
  document.getElementById('app').classList.add('hidden');
  let container = document.getElementById('login-screen');
  if (!container) {
    container = document.createElement('div');
    container.id = 'login-screen';
    document.body.appendChild(container);
  }
  container.className = 'min-h-screen bg-surface flex items-center justify-center px-4';
  container.innerHTML = `
    <div class="w-full max-w-md">
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-primary flex items-center justify-center">
            <span class="material-symbols-outlined text-white text-2xl">health_metrics</span>
          </div>
          <span class="text-3xl font-black tracking-tighter text-primary uppercase">The Nest</span>
        </div>
        <p class="text-on-surface-variant font-medium text-sm uppercase tracking-widest">Performance System</p>
      </div>

      <div class="bg-white border border-surface-variant p-8 shadow-sm">
        <h2 class="text-headline-md font-black uppercase tracking-tight text-on-surface mb-6">Sign In</h2>
        <div id="login-error" class="hidden mb-4 p-3 bg-error-container border-l-4 border-error text-sm font-bold text-on-error-container"></div>
        <form id="login-form" class="space-y-5">
          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Email</label>
            <input id="login-email" type="email" required autocomplete="email"
              class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors"
              placeholder="trainer@university.edu" />
          </div>
          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Password</label>
            <input id="login-password" type="password" required autocomplete="current-password"
              class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••" />
          </div>
          <button type="submit"
            class="w-full bg-primary text-white font-black uppercase tracking-widest py-3 px-6 hover:bg-on-primary-fixed-variant transition-colors active:scale-95 mt-2">
            Sign In
          </button>
        </form>

        <div class="mt-6 pt-6 border-t border-surface-variant">
          <p class="text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-3">New account</p>
          <button onclick="showRegister()"
            class="w-full border-2 border-on-surface text-on-surface font-black uppercase tracking-widest py-2.5 px-6 hover:border-primary hover:text-primary transition-colors text-sm">
            Register
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errEl = document.getElementById('login-error');
    errEl.classList.add('hidden');
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { errEl.textContent = data.error || 'Login failed'; errEl.classList.remove('hidden'); return; }
      setToken(data.token);
      currentUser = data.user;
      container.remove();
      showApp();
    } catch { errEl.textContent = 'Server unreachable'; errEl.classList.remove('hidden'); }
  });
}

function showRegister() {
  const container = document.getElementById('login-screen');
  container.innerHTML = `
    <div class="w-full max-w-md">
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-primary flex items-center justify-center">
            <span class="material-symbols-outlined text-white text-2xl">health_metrics</span>
          </div>
          <span class="text-3xl font-black tracking-tighter text-primary uppercase">The Nest</span>
        </div>
        <p class="text-on-surface-variant font-medium text-sm uppercase tracking-widest">Performance System</p>
      </div>

      <div class="bg-white border border-surface-variant p-8 shadow-sm">
        <h2 class="text-headline-md font-black uppercase tracking-tight text-on-surface mb-6">Create Account</h2>
        <div id="reg-error" class="hidden mb-4 p-3 bg-error-container border-l-4 border-error text-sm font-bold text-on-error-container"></div>
        <form id="register-form" class="space-y-5">
          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Full Name</label>
            <input id="reg-name" type="text" required
              class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors"
              placeholder="Dr. Sarah Miller" />
          </div>
          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Email</label>
            <input id="reg-email" type="email" required
              class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors"
              placeholder="trainer@university.edu" />
          </div>
          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Password</label>
            <input id="reg-password" type="password" required minlength="6"
              class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••" />
          </div>
          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Role</label>
            <select id="reg-role" required
              class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors">
              <option value="">Select role</option>
              <option value="trainer">Trainer</option>
              <option value="athlete">Athlete</option>
              <option value="coach">Coach</option>
            </select>
          </div>
          <button type="submit"
            class="w-full bg-primary text-white font-black uppercase tracking-widest py-3 px-6 hover:bg-on-primary-fixed-variant transition-colors active:scale-95 mt-2">
            Create Account
          </button>
        </form>
        <div class="mt-4 text-center">
          <button onclick="showLogin()" class="text-primary font-black text-sm uppercase tracking-widest hover:underline">Back to Sign In</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;
    const errEl = document.getElementById('reg-error');
    errEl.classList.add('hidden');
    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) { errEl.textContent = data.error || 'Registration failed'; errEl.classList.remove('hidden'); return; }
      setToken(data.token);
      currentUser = data.user;
      const ls = document.getElementById('login-screen');
      if (ls) ls.remove();
      showApp();
    } catch { errEl.textContent = 'Server unreachable'; errEl.classList.remove('hidden'); }
  });
}

// ─── App shell ────────────────────────────────────────────────────────────────
function showApp() {
  const appEl = document.getElementById('app');
  appEl.classList.remove('hidden');
  renderNav();
  navigateTo('dashboard');
}

function logout() {
  clearToken();
  currentUser = null;
  document.getElementById('app').classList.add('hidden');
  showLogin();
}

// ─── Nav rendering (role-based) ───────────────────────────────────────────────
const NAV_ITEMS = {
  trainer: [
    { key: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { key: 'athletes', icon: 'person_search', label: 'Athletes' },
    { key: 'soap', icon: 'edit_note', label: 'SOAP Notes' },
    { key: 'rehab', icon: 'fitness_center', label: 'Rehab Plans' },
    { key: 'inventory', icon: 'inventory_2', label: 'Inventory' },
  ],
  athlete: [
    { key: 'dashboard', icon: 'dashboard', label: 'My Dashboard' },
    { key: 'rehab', icon: 'fitness_center', label: 'My HEP' },
  ],
  coach: [
    { key: 'roster', icon: 'clipboard_check', label: 'Roster' },
  ],
  admin: [
    { key: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { key: 'athletes', icon: 'person_search', label: 'Athletes' },
  ],
};

function renderNav() {
  const role = currentUser?.role || 'trainer';
  const items = NAV_ITEMS[role] || NAV_ITEMS.trainer;

  // Update user avatar area in header
  const userAvatar = document.querySelector('.user-profile .user-avatar, #header-user');
  const headerUserEl = document.getElementById('header-user');
  if (headerUserEl) {
    headerUserEl.textContent = currentUser?.name || '';
  }

  // Build sidebar nav
  const nav = document.querySelector('aside nav.flex-1');
  if (!nav) return;
  nav.innerHTML = items.map((item, i) => `
    <a onclick="navigateTo('${item.key}')" data-nav="${item.key}"
      class="flex items-center gap-3 px-4 py-3 ${i === 0 ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'} rounded-lg transition-all duration-200 cursor-pointer">
      <span class="material-symbols-outlined">${item.icon}</span>
      <span class="font-bold">${item.label}</span>
    </a>
  `).join('');
}

function setActiveNav(key) {
  document.querySelectorAll('[data-nav]').forEach(el => {
    const active = el.dataset.nav === key;
    el.className = el.className
      .replace(/bg-primary text-white/g, '')
      .replace(/text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface/g, '')
      .trim();
    el.className += active
      ? ' bg-primary text-white'
      : ' text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface';
  });
}

// ─── Router ───────────────────────────────────────────────────────────────────
let currentView = null;
let _activeCapsule = null;

function navigateTo(view) {
  if (_activeCapsule) { _activeCapsule.unmount(); _activeCapsule = null; }
  currentView = view;
  setActiveNav(view);
  const main = document.getElementById('dynamic-content');
  if (!main) return;

  const title = document.getElementById('current-view-title');

  switch (view) {
    case 'dashboard':
      if (currentUser?.role === 'athlete') renderAthleteDashboard(main, title);
      else renderTrainerDashboard(main, title);
      break;
    case 'roster':
      renderCoachRoster(main, title);
      break;
    case 'athletes':
      renderAthletesList(main, title);
      break;
    case 'soap':
      renderSoapList(main, title);
      break;
    case 'rehab':
      if (currentUser?.role === 'athlete') renderAthleteHEP(main, title);
      else renderRehabList(main, title);
      break;
    case 'inventory':
      _activeCapsule = inventoryCapsule;
      inventoryCapsule.mount(main, title);
      break;
    default:
      main.innerHTML = '<p class="text-on-surface-variant">Coming soon.</p>';
  }
}

// ─── Views ────────────────────────────────────────────────────────────────────
function renderTrainerDashboard(main, title) {
  if (title) title.textContent = 'Trainer Overview';
  main.innerHTML = `
    <div>
      <div class="mb-6">
        <h1 class="text-4xl font-black uppercase tracking-tighter text-primary">Trainer Overview</h1>
        <p class="text-on-surface-variant font-medium mt-1">Athlete health &amp; clinical management</p>
      </div>

      <!-- TOP HEADER ROW: Team Health Summary + Action Buttons -->
      <div class="flex items-start gap-6 pb-6 border-b-2 border-on-surface">
        <div class="flex-1 min-w-0" id="trainer-stats">
          <div class="bg-white border-2 border-surface-variant animate-pulse h-72"></div>
        </div>
        <div class="flex flex-col gap-3 flex-shrink-0">
          <button onclick="openNewEncounterFromDashboard(true)"
            class="flex items-center gap-2 px-5 py-2.5 border-2 border-primary text-primary font-black uppercase tracking-widest text-sm hover:bg-primary hover:text-white transition-colors active:scale-95">
            <span class="material-symbols-outlined text-base">mic</span> Record Voice Note
          </button>
          <button onclick="openNewEncounterFromDashboard(false)"
            class="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-black uppercase tracking-widest text-sm hover:bg-on-primary-fixed-variant transition-colors active:scale-95">
            <span class="material-symbols-outlined text-base">add_circle</span> + New SOAP Note
          </button>
        </div>
      </div>

      <!-- MAIN CONTENT AREA: Pending Actions | Injury Feed | Weekly Planner -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6 border-b-2 border-on-surface">
        <div id="trainer-pending">
          <div class="bg-white border-2 border-surface-variant animate-pulse h-64"></div>
        </div>
        <div id="injury-feed">
          <div class="bg-white border-2 border-surface-variant animate-pulse h-64"></div>
        </div>
        <div id="trainer-weekly-planner">
          <div class="bg-white border-2 border-surface-variant animate-pulse h-48"></div>
        </div>
      </div>

      <!-- BOTTOM SECTION: Injury Hotspots (full width) -->
      <div class="pt-6" id="injury-hotspots">
        <div class="bg-white border-2 border-surface-variant animate-pulse h-80"></div>
      </div>
    </div>
  `;
  loadTrainerStats();
  loadInjuryFeed();
  loadWeeklyPlanner();
  loadInjuryHotspots();
}

// ─── Team Health Summary card ─────────────────────────────────────────────────
let _healthChart = null;
let _healthChartType = 'doughnut';
let _healthData = { healthy: 0, limited: 0, out: 0 };

async function loadTrainerStats() {
  const [summaryRes, tasksRes, athletesRes] = await Promise.all([
    apiFetch('/api/dashboard/summary'),
    apiFetch('/api/clearance-tasks'),
    apiFetch('/api/athletes')
  ]);
  if (!summaryRes || !tasksRes || !athletesRes) return;
  
  const { healthSummary, pendingActions, pendingCount } = await summaryRes.json();
  const clearanceTasks = await tasksRes.json();
  const athletes = await athletesRes.json();

  _healthData = healthSummary;
  _healthChartType = 'doughnut';

  const pendingEl = document.getElementById('trainer-pending');
  if (pendingEl) pendingEl.innerHTML = renderPendingActionsWidget(pendingActions || [], pendingCount || 0, clearanceTasks || [], athletes || []);

  const statsEl = document.getElementById('trainer-stats');
  if (!statsEl) return;

  const total = healthSummary.healthy + healthSummary.limited + healthSummary.out;

  statsEl.innerHTML = `
    <div class="bg-white border-2 border-on-surface">
      <div class="bg-on-surface flex items-center justify-between px-6 py-3">
        <span class="text-[11px] font-black uppercase tracking-widest text-white">Team Health Summary</span>
        <button id="health-chart-toggle"
          onclick="toggleHealthChart()"
          title="Toggle chart type"
          class="flex items-center justify-center w-7 h-7 rounded hover:bg-white/10 transition-colors">
          <span class="material-symbols-outlined text-white text-xl">bar_chart</span>
        </button>
      </div>
      <div class="p-6">
        <div class="text-center mb-5">
          <p class="text-[64px] font-black leading-none text-on-surface">${total}</p>
          <p class="text-[11px] font-black uppercase tracking-widest text-on-surface-variant mt-1">Active Athletes</p>
        </div>
        <div class="flex justify-center mb-5">
          <canvas id="health-chart" width="260" height="160"></canvas>
        </div>
        <div class="grid grid-cols-3 gap-3 border-t-2 border-surface-variant pt-4">
          <div class="text-center">
            <div class="w-full h-2 bg-green-500 mb-2"></div>
            <p class="text-2xl font-black text-on-surface">${healthSummary.healthy}</p>
            <p class="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Healthy</p>
          </div>
          <div class="text-center">
            <div class="w-full h-2 bg-yellow-400 mb-2"></div>
            <p class="text-2xl font-black text-on-surface">${healthSummary.limited}</p>
            <p class="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Limited</p>
          </div>
          <div class="text-center">
            <div class="w-full h-2 bg-red-600 mb-2"></div>
            <p class="text-2xl font-black text-on-surface">${healthSummary.out}</p>
            <p class="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Out</p>
          </div>
        </div>
      </div>
    </div>
  `;

  _renderHealthChart();
}

function _renderHealthChart() {
  if (_healthChart) { _healthChart.destroy(); _healthChart = null; }
  const canvas = document.getElementById('health-chart');
  if (!canvas) return;

  const { healthy, limited, out } = _healthData;
  const colors = ['#22c55e', '#eab308', '#dc2626'];

  if (_healthChartType === 'doughnut') {
    canvas.width = 200; canvas.height = 200;
    _healthChart = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Healthy', 'Limited', 'Out'],
        datasets: [{ data: [healthy, limited, out], backgroundColor: colors, borderWidth: 0 }],
      },
      options: {
        responsive: false,
        cutout: '65%',
        plugins: { legend: { display: false }, tooltip: { callbacks: {
          label: ctx => ` ${ctx.label}: ${ctx.parsed}`
        }}},
      },
    });
  } else {
    canvas.width = 260; canvas.height = 110;
    _healthChart = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Healthy', 'Limited', 'Out'],
        datasets: [{ data: [healthy, limited, out], backgroundColor: colors, borderWidth: 0, borderRadius: 0 }],
      },
      options: {
        indexAxis: 'y',
        responsive: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: {
          label: ctx => ` ${ctx.parsed.x}`
        }}},
        scales: {
          x: { display: false, grid: { display: false } },
          y: {
            grid: { display: false },
            ticks: { font: { family: 'Lexend', weight: '700', size: 11 }, color: '#1c1b1b' },
          },
        },
      },
    });
  }
}

function toggleHealthChart() {
  _healthChartType = _healthChartType === 'doughnut' ? 'bar' : 'doughnut';
  const btn = document.getElementById('health-chart-toggle');
  if (btn) {
    btn.querySelector('.material-symbols-outlined').textContent =
      _healthChartType === 'doughnut' ? 'bar_chart' : 'donut_large';
  }
  _renderHealthChart();
}

// ─── Pending Actions widget ───────────────────────────────────────────────────
function relativeTime(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr + (dateStr.endsWith('Z') ? '' : 'Z'));
  const days = Math.floor((Date.now() - date) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
}

function renderPendingActionsWidget(actions, count, clearanceTasks, athletes) {
  const actionItems = actions.map(a => {
    let onclick, labelHtml, noteHtml = '';
    if (a.type === 'rehab') {
      onclick = `openRehabProgram(${a.id})`;
      labelHtml = `<p class="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">${escHtml(a.label)}</p>`;
    } else {
      onclick = `navigateTo('soap')`;
      labelHtml = `<p class="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">${escHtml(a.label)}</p>`;
    }

    return `
      <button onclick="${onclick}"
        class="w-full text-left flex items-center justify-between px-5 py-3.5 border-b border-surface-variant hover:bg-surface-container transition-colors group">
        <div class="min-w-0">
          ${labelHtml}
          <div class="mt-0.5" onclick="event.stopPropagation()">
            <a href="javascript:void(0)" onclick="openAthleteProfile(${a.athlete_id})" class="text-sm font-black text-on-surface truncate hover:text-primary hover:underline">${escHtml(a.athlete_name)}</a>
          </div>
          ${noteHtml}
          <p class="text-[11px] font-medium text-on-surface-variant mt-0.5">${relativeTime(a.date)}</p>
        </div>
        <span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-lg flex-shrink-0 ml-3">arrow_forward</span>
      </button>`;
  }).join('');

  const taskItems = clearanceTasks.map(t => {
    const isDone = t.status === 'done';
    const textCls = isDone ? 'text-on-surface-variant line-through' : 'text-on-surface font-medium';
    return `
      <div class="flex items-start gap-3 px-5 py-3 border-b border-surface-variant ${isDone ? 'bg-surface-container-low' : 'bg-white'}">
        <button onclick="${isDone ? '' : `markClearanceTaskDone(${t.id})`}" class="mt-0.5 flex-shrink-0">
          <span class="material-symbols-outlined text-[20px] ${isDone ? 'text-on-surface-variant' : 'text-primary hover:scale-110'} transition-transform">
            ${isDone ? 'check_circle' : 'radio_button_unchecked'}
          </span>
        </button>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black uppercase tracking-widest ${isDone ? 'text-on-surface-variant/70' : 'text-on-surface-variant'}">${escHtml(t.athlete_name)}</span>
            ${isDone ? `<span class="text-[9px] font-black uppercase tracking-widest bg-surface-variant px-1.5 rounded text-on-surface-variant">Done</span>` : ''}
          </div>
          <p class="text-[13px] mt-0.5 ${textCls}">${escHtml(t.note)}</p>
        </div>
      </div>
    `;
  }).join('');

  const emptyState = (actions.length === 0 && clearanceTasks.length === 0) ? `
    <div class="flex flex-col items-center justify-center py-12 text-on-surface-variant">
      <span class="material-symbols-outlined text-4xl mb-3">check_circle</span>
      <p class="text-[11px] font-black uppercase tracking-widest">All caught up</p>
    </div>` : '';

  const athleteOptions = (athletes || []).map(a => `<option value="${a.id}">${escHtml(a.name)}</option>`).join('');

  return `
    <div class="bg-white border-2 border-on-surface h-full flex flex-col">
      <div class="bg-on-surface flex items-center justify-between px-6 py-3 flex-shrink-0">
        <span class="text-[11px] font-black uppercase tracking-widest text-white">Pending Actions</span>
        <span class="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary text-white">${count} Urgent</span>
      </div>
      
      <div class="p-3 border-b border-surface-variant bg-surface-container-lowest flex-shrink-0">
        <form onsubmit="createClearanceTask(event)" class="flex items-center gap-2">
          <select id="new-task-athlete" required class="text-[11px] font-bold uppercase tracking-widest border border-surface-variant bg-white px-2 py-1.5 focus:border-primary outline-none">
            <option value="">Select Athlete</option>
            ${athleteOptions}
          </select>
          <input id="new-task-note" type="text" required placeholder="New clearance task..." class="flex-1 text-[13px] border border-surface-variant bg-white px-2 py-1.5 focus:border-primary outline-none" />
          <button type="submit" class="bg-primary text-white text-[11px] font-black uppercase tracking-widest px-3 py-1.5 hover:bg-on-primary-fixed-variant transition-colors">Add</button>
        </form>
      </div>

      <div class="divide-y divide-surface-variant overflow-y-auto flex-1 max-h-72">
        ${actionItems}
        ${taskItems}
        ${emptyState}
      </div>
    </div>`;
}

window.createClearanceTask = async function(e) {
  e.preventDefault();
  const athlete_id = document.getElementById('new-task-athlete').value;
  const note = document.getElementById('new-task-note').value;
  if (!athlete_id || !note) return;

  const res = await apiFetch('/api/clearance-tasks', {
    method: 'POST',
    body: JSON.stringify({ athlete_id, note })
  });
  if (res && res.ok) {
    loadTrainerStats(); // reload stats to update UI
  }
};

window.markClearanceTaskDone = async function(id) {
  const res = await apiFetch('/api/clearance-tasks/' + id, { method: 'PATCH' });
  if (res && res.ok) {
    loadTrainerStats(); // reload stats to update UI
  }
};

// ─── Recent Injury Feed widget ────────────────────────────────────────────────
let _injuryEncounters = [];
let _injuryFilter = 'weekly';

async function loadInjuryFeed() {
  const res = await apiFetch('/api/encounters');
  if (!res) return;
  _injuryEncounters = await res.json();
  _renderInjuryFeed();
}

function setInjuryFilter(filter) {
  _injuryFilter = filter;
  _renderInjuryFeed();
}

function _injuryInitials(name) {
  const parts = (name || '').trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.[0] || '?').toUpperCase();
}

const _avatarPalette = [
  'bg-blue-600','bg-purple-600','bg-teal-600','bg-indigo-600',
  'bg-pink-600','bg-cyan-700','bg-emerald-600','bg-orange-600',
];

function _avatarColor(name) {
  let h = 0;
  for (const c of (name || '')) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return _avatarPalette[h % _avatarPalette.length];
}

function _injuryStatusBadge(status) {
  if (status === 'green')  return `<span class="bg-green-600 text-white text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider">Healthy</span>`;
  if (status === 'yellow') return `<span class="bg-yellow-500 text-white text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider">Limited</span>`;
  if (status === 'red')    return `<span class="bg-red-600 text-white text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider">Out</span>`;
  return `<span class="bg-surface-variant text-on-surface-variant text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider">—</span>`;
}

function _renderInjuryFeed() {
  const el = document.getElementById('injury-feed');
  if (!el) return;

  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const visible = _injuryFilter === 'weekly'
    ? _injuryEncounters.filter(e => {
        const d = new Date(e.created_at + (e.created_at.endsWith('Z') ? '' : 'Z'));
        return now - d.getTime() <= sevenDays;
      })
    : _injuryEncounters;

  const rows = visible.length
    ? visible.map(e => {
        const initials = _injuryInitials(e.athlete_name);
        const color    = _avatarColor(e.athlete_name);
        return `
          <tr class="border-b border-surface-variant hover:bg-surface-container-low transition-colors">
            <td class="px-6 py-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 ${color} rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer" onclick="openAthleteProfile(${e.athlete_id})">
                  <span class="text-white text-[11px] font-black">${initials}</span>
                </div>
                <a href="javascript:void(0)" onclick="openAthleteProfile(${e.athlete_id})" class="font-black text-sm text-on-surface hover:text-primary hover:underline">${escHtml(e.athlete_name)}</a>
              </div>
            </td>
            <td class="px-6 py-3 text-sm text-on-surface">${escHtml(e.injury_type || '—')}</td>
            <td class="px-6 py-3">
              <span class="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 bg-surface-container-low border border-surface-variant">${escHtml(e.body_part || '—')}</span>
            </td>
            <td class="px-6 py-3">${_injuryStatusBadge(e.clearance_status)}</td>
            <td class="px-6 py-3 text-[11px] text-on-surface-variant font-medium">${relativeTime(e.created_at)}</td>
          </tr>`;
      }).join('')
    : `<tr><td colspan="5" class="px-6 py-10 text-center text-on-surface-variant">
        <span class="material-symbols-outlined text-3xl mb-2 block">search_off</span>
        <p class="text-[11px] font-black uppercase tracking-widest">No encounters in this period</p>
      </td></tr>`;

  const btnCls = (f) => _injuryFilter === f
    ? 'bg-white text-on-surface text-[10px] font-black uppercase tracking-widest px-3 py-1 transition-colors'
    : 'text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest px-3 py-1 transition-colors';

  el.innerHTML = `
    <div class="bg-white border-2 border-on-surface">
      <div class="bg-on-surface flex items-center justify-between px-6 py-3">
        <span class="text-[11px] font-black uppercase tracking-widest text-white">Recent Injury Feed</span>
        <div class="flex gap-1">
          <button onclick="setInjuryFilter('weekly')" class="${btnCls('weekly')}">Weekly</button>
          <button onclick="setInjuryFilter('all')"    class="${btnCls('all')}">All</button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-widest font-black border-b border-surface-variant">
              <th class="px-6 py-4">Athlete</th>
              <th class="px-6 py-4">Injury</th>
              <th class="px-6 py-4">Body Part</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4">When</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="px-6 py-4 border-t border-surface-variant">
        <button onclick="navigateTo('soap')"
          class="flex items-center gap-1 text-primary font-black text-[11px] uppercase tracking-widest hover:underline">
          <span class="material-symbols-outlined text-base">open_in_new</span>
          View Full Injury Registry
        </button>
      </div>
    </div>`;
}

// ─── Weekly Planner widget ────────────────────────────────────────────────────
let _weeklyPlannerOffset = 0;
let _weeklyPlannerData = [];

async function loadWeeklyPlanner() {
  _weeklyPlannerOffset = 0;
  const plannerEl = document.getElementById('trainer-weekly-planner');
  if (!plannerEl) return;

  const [encRes, rehabRes] = await Promise.all([
    apiFetch('/api/encounters'),
    apiFetch('/api/rehab/programs'),
  ]);
  if (!encRes || !rehabRes) return;

  const encounters = await encRes.json();
  const programs = await rehabRes.json();

  _weeklyPlannerData = [
    ...encounters.map(e => ({ date: e.created_at.slice(0, 10), athlete_name: e.athlete_name, type: 'encounter' })),
    ...programs.map(p => ({ date: p.created_at.slice(0, 10), athlete_name: p.athlete_name, type: 'rehab' })),
  ];

  renderWeeklyPlannerWidget();
}

function _plannerSundayOfWeek(offset) {
  const now = new Date();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - now.getDay() + offset * 7);
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

function _plannerDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function renderWeeklyPlannerWidget() {
  const plannerEl = document.getElementById('trainer-weekly-planner');
  if (!plannerEl) return;

  const sunday = _plannerSundayOfWeek(_weeklyPlannerOffset);
  const today = _plannerDateKey(new Date());
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);

  const weekLabel = `${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${saturday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const eventsByDate = {};
  for (const ev of _weeklyPlannerData) {
    if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
    eventsByDate[ev.date].push(ev);
  }

  const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dayColumns = DAY_LABELS.map((label, i) => {
    const dayDate = new Date(sunday);
    dayDate.setDate(sunday.getDate() + i);
    const dateKey = _plannerDateKey(dayDate);
    const isToday = dateKey === today;
    const events = eventsByDate[dateKey] || [];

    const eventItems = events.map(ev => {
      const abbr = escHtml(ev.athlete_name.split(' ')[0]);
      const cls = ev.type === 'rehab'
        ? 'border-l-2 border-primary bg-primary/10 text-primary'
        : 'border-l-2 border-on-surface-variant bg-surface-container text-on-surface';
      return `<div class="text-[10px] font-bold truncate px-1.5 py-0.5 mb-0.5 ${cls}">${abbr}</div>`;
    }).join('');

    const headerCls = isToday ? 'bg-primary border-primary' : 'bg-surface-container border-surface-variant';
    const headerTextCls = isToday ? 'text-white' : 'text-on-surface-variant';
    const colCls = isToday ? 'border-primary border-2 bg-primary/5' : 'border-surface-variant bg-white';

    return `<div class="flex flex-col ${colCls}">
        <div class="px-2 pt-2 pb-1.5 border-b ${headerCls}">
          <p class="text-[10px] font-black uppercase tracking-widest text-center ${headerTextCls}">${label}</p>
          <p class="text-base font-black text-center leading-tight ${headerTextCls}">${dayDate.getDate()}</p>
        </div>
        <div class="p-1 min-h-[80px] overflow-hidden">${eventItems}</div>
      </div>`;
  }).join('');

  plannerEl.innerHTML = `
    <div class="bg-white border-2 border-on-surface">
      <div class="bg-on-surface flex items-center justify-between px-6 py-3">
        <span class="text-[11px] font-black uppercase tracking-widest text-white">Weekly Planner</span>
        <div class="flex items-center gap-3">
          <span class="text-[11px] font-medium text-white/60">${weekLabel}</span>
          ${_weeklyPlannerOffset !== 0 ? `<button onclick="weeklyPlannerToday()"
            class="text-[10px] font-black uppercase tracking-widest px-3 py-1 border border-white/30 text-white hover:bg-white/10 transition-colors">Today</button>` : ''}
          <div class="flex">
            <button onclick="weeklyPlannerPrev()" title="Previous week"
              class="flex items-center justify-center w-7 h-7 hover:bg-white/10 transition-colors">
              <span class="material-symbols-outlined text-white text-xl">chevron_left</span>
            </button>
            <button onclick="weeklyPlannerNext()" title="Next week"
              class="flex items-center justify-center w-7 h-7 hover:bg-white/10 transition-colors">
              <span class="material-symbols-outlined text-white text-xl">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-7 divide-x divide-surface-variant">
        ${dayColumns}
      </div>
      <div class="px-6 py-2 border-t border-surface-variant flex items-center gap-4">
        <span class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          <span class="inline-block w-3 h-3 border-l-2 border-on-surface-variant bg-surface-container"></span> Session
        </span>
        <span class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          <span class="inline-block w-3 h-3 border-l-2 border-primary bg-primary/10"></span> Rehab
        </span>
      </div>
    </div>`;
}

function weeklyPlannerPrev() {
  _weeklyPlannerOffset--;
  renderWeeklyPlannerWidget();
}

function weeklyPlannerNext() {
  _weeklyPlannerOffset++;
  renderWeeklyPlannerWidget();
}

function weeklyPlannerToday() {
  _weeklyPlannerOffset = 0;
  renderWeeklyPlannerWidget();
}

// ─── Injury Hotspots & Rates ──────────────────────────────────────────────────
let _hotspotChart = null;

// Hardcoded prior-season baseline: encounter counts for the matching 6-month window
const _BASELINE_MONTHLY = [5, 8, 7, 10, 9, 6];
const _BASELINE_TOTAL = _BASELINE_MONTHLY.reduce((a, b) => a + b, 0);

function _getLastSixMonths() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return months;
}

async function loadInjuryHotspots() {
  const res = await apiFetch('/api/encounters');
  if (!res) return;
  const encounters = await res.json();
  _renderInjuryHotspots(encounters);
}

function _renderInjuryHotspots(encounters) {
  const el = document.getElementById('injury-hotspots');
  if (!el) return;

  const months = _getLastSixMonths();
  const liveCounts = months.map(({ year, month }) =>
    encounters.filter(e => {
      const d = new Date(e.created_at + (e.created_at.endsWith('Z') ? '' : 'Z'));
      return d.getFullYear() === year && d.getMonth() === month;
    }).length
  );
  const liveTotal = liveCounts.reduce((a, b) => a + b, 0);

  // TOP INJURY SITE
  const bodyPartCounts = {};
  encounters.forEach(e => {
    if (e.body_part) bodyPartCounts[e.body_part] = (bodyPartCounts[e.body_part] || 0) + 1;
  });
  const topSiteEntry = Object.entries(bodyPartCounts).sort((a, b) => b[1] - a[1])[0];
  const topSiteLabel = topSiteEntry ? topSiteEntry[0] : '—';
  const topSitePct = topSiteEntry && encounters.length
    ? Math.round((topSiteEntry[1] / encounters.length) * 100) : 0;

  // TOP MECHANISM
  const mechCounts = {};
  encounters.forEach(e => {
    if (e.injury_type) mechCounts[e.injury_type] = (mechCounts[e.injury_type] || 0) + 1;
  });
  const topMechEntry = Object.entries(mechCounts).sort((a, b) => b[1] - a[1])[0];
  const topMechLabel = topMechEntry ? topMechEntry[0] : '—';

  // RATE CHANGE vs hardcoded baseline
  const rateChangePct = _BASELINE_TOTAL > 0
    ? Math.round(((liveTotal - _BASELINE_TOTAL) / _BASELINE_TOTAL) * 100) : 0;
  const rateUp = rateChangePct >= 0;
  const arrowColor = rateUp ? 'text-red-600' : 'text-green-600';

  el.innerHTML = `
    <div class="bg-white border-2 border-on-surface">
      <div class="bg-on-surface px-6 py-3">
        <span class="text-[11px] font-black uppercase tracking-widest text-white">Injury Hotspots &amp; Rates</span>
      </div>
      <div class="p-6 pb-2">
        <canvas id="hotspot-chart"></canvas>
      </div>
      <div class="grid grid-cols-3 divide-x divide-surface-variant border-t-2 border-surface-variant">
        <div class="p-5">
          <p class="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-3">Top Injury Site</p>
          <p class="text-xl font-black text-on-surface leading-tight">${escHtml(topSiteLabel)}</p>
          ${topSiteEntry ? `<p class="text-[11px] font-medium text-primary mt-1">${topSitePct}% of encounters</p>` : ''}
        </div>
        <div class="p-5">
          <p class="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-3">Top Mechanism</p>
          <p class="text-xl font-black text-on-surface leading-tight">${escHtml(topMechLabel)}</p>
        </div>
        <div class="p-5">
          <p class="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-3">Rate Change</p>
          <p class="text-2xl font-black ${arrowColor} leading-tight">${rateUp ? '↑' : '↓'} ${Math.abs(rateChangePct)}%</p>
          <p class="text-[11px] font-medium text-on-surface-variant mt-1">vs prior season (${_BASELINE_TOTAL} total)</p>
        </div>
      </div>
    </div>
  `;

  if (_hotspotChart) { _hotspotChart.destroy(); _hotspotChart = null; }
  const canvas = document.getElementById('hotspot-chart');
  if (!canvas) return;

  _hotspotChart = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: months.map(m => m.label),
      datasets: [
        {
          label: 'Current Season',
          data: liveCounts,
          borderColor: '#9e0000',
          backgroundColor: 'rgba(158,0,0,0.08)',
          borderWidth: 2.5,
          pointBackgroundColor: '#9e0000',
          pointRadius: 4,
          tension: 0.35,
          fill: true,
        },
        {
          label: 'Prior Season (Baseline)',
          data: _BASELINE_MONTHLY,
          borderColor: '#94a3b8',
          backgroundColor: 'rgba(148,163,184,0.06)',
          borderWidth: 2,
          borderDash: [5, 4],
          pointBackgroundColor: '#94a3b8',
          pointRadius: 3,
          tension: 0.35,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            font: { family: 'Lexend', size: 11, weight: '700' },
            color: '#1c1b1b',
            boxWidth: 14,
            padding: 16,
          },
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Lexend', size: 11, weight: '700' }, color: '#5e3f3a' },
        },
        y: {
          beginAtZero: true,
          grid: { color: '#e5e2e1' },
          ticks: {
            precision: 0,
            font: { family: 'Lexend', size: 11 },
            color: '#5e3f3a',
          },
        },
      },
    },
  });
}

function renderAthleteDashboard(main, title) {
  if (title) title.textContent = 'My Dashboard';
  main.innerHTML = `
    <div class="space-y-6">
      <h1 class="text-4xl font-black uppercase tracking-tighter text-primary">My Dashboard</h1>
      <p class="text-on-surface-variant font-medium -mt-4">Welcome back, ${currentUser?.name || 'Athlete'}</p>
      <div class="bg-white border border-surface-variant p-6 shadow-sm">
        <p class="text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-4">Your Clearance Status</p>
        <div id="athlete-clearance">
          <div class="animate-pulse h-10 bg-surface-container rounded"></div>
        </div>
      </div>
    </div>
  `;
  loadAthleteClearance();
}

async function loadAthleteClearance() {
  const res = await apiFetch('/api/athletes/me');
  if (!res) return;
  const el = document.getElementById('athlete-clearance');
  if (!res.ok) { if (el) el.innerHTML = '<p class="text-on-surface-variant">No athlete profile linked yet.</p>'; return; }
  const athlete = await res.json();
  if (el) el.innerHTML = statusBadge(athlete.clearance_status, true);
}

function renderCoachRoster(main, title) {
  if (title) title.textContent = 'Roster';
  main.innerHTML = `
    <div class="space-y-6">
      <h1 class="text-4xl font-black uppercase tracking-tighter text-primary">Roster Clearance</h1>
      <p class="text-[11px] text-on-surface-variant font-bold uppercase tracking-widest">HIPAA: clearance status only — no medical details shown to coaches</p>
      <div class="bg-white border border-surface-variant shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-widest font-black border-b border-surface-variant">
              <th class="px-6 py-4">Athlete</th>
              <th class="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody id="roster-body">
            <tr><td colspan="2" class="px-6 py-8 text-center text-on-surface-variant">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  loadRoster();
}

async function loadRoster() {
  const res = await apiFetch('/api/athletes/roster');
  if (!res) return;
  const athletes = await res.json();
  const tbody = document.getElementById('roster-body');
  if (!tbody) return;
  if (!athletes.length) { tbody.innerHTML = '<tr><td colspan="2" class="px-6 py-8 text-center text-on-surface-variant">No athletes found.</td></tr>'; return; }
  tbody.innerHTML = athletes.map(a => `
    <tr class="border-b border-surface-variant hover:bg-surface-container-low transition-colors">
      <td class="px-6 py-4 font-black text-on-surface">
        <a href="javascript:void(0)" onclick="openAthleteProfile(${a.id})" class="hover:text-primary hover:underline">${escHtml(a.name)}</a>
      </td>
      <td class="px-6 py-4">${statusBadge(a.clearance_status)}</td>
    </tr>
  `).join('');
}

function renderAthletesList(main, title) {
  if (title) title.textContent = 'Athletes';
  main.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-black uppercase tracking-tighter text-primary">Athletes</h1>
          <p class="text-on-surface-variant font-medium mt-1">Manage profiles and clearance status</p>
        </div>
        <button onclick="showAddAthleteModal()"
          class="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-black uppercase tracking-widest text-sm hover:bg-on-primary-fixed-variant transition-colors active:scale-95">
          <span class="material-symbols-outlined text-base">person_add</span> Add Athlete
        </button>
      </div>
      <div class="bg-white border border-surface-variant shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-widest font-black border-b border-surface-variant">
              <th class="px-6 py-4">Athlete</th>
              <th class="px-6 py-4">Team</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4">Set Clearance</th>
            </tr>
          </thead>
          <tbody id="athletes-body">
            <tr><td colspan="4" class="px-6 py-8 text-center text-on-surface-variant">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  loadAthletesList();
}

async function loadAthletesList() {
  const res = await apiFetch('/api/athletes');
  if (!res) return;
  const athletes = await res.json();
  const tbody = document.getElementById('athletes-body');
  if (!tbody) return;
  if (!athletes.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-12 text-center text-on-surface-variant font-medium">No athletes yet. Click <strong>Add Athlete</strong> to create your first profile.</td></tr>';
    return;
  }
  tbody.innerHTML = athletes.map(a => athleteRow(a)).join('');
}

function athleteRow(a) {
  const btn = (s, label, color, hoverColor) => {
    const active = a.clearance_status === s;
    return `<button onclick="setClearance(${a.id},'${s}')"
      class="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-2 transition-colors
        ${active ? `bg-${color} text-white border-${color}` : `border-${color} text-${color} hover:bg-${color} hover:text-white`}"
      title="${label}">${label[0]}</button>`;
  };
  return `
    <tr id="athlete-row-${a.id}" class="border-b border-surface-variant hover:bg-surface-container-low transition-colors">
      <td class="px-6 py-4 font-black text-on-surface">
        <a href="javascript:void(0)" onclick="openAthleteProfile(${a.id})" class="hover:text-primary hover:underline">${escHtml(a.name)}</a>
      </td>
      <td class="px-6 py-4 text-on-surface-variant font-medium">${escHtml(a.team || '—')}</td>
      <td class="px-6 py-4" id="clearance-badge-${a.id}">${statusBadge(a.clearance_status)}</td>
      <td class="px-6 py-4">
        <div class="flex gap-1.5">
          ${btn('green', 'Cleared', 'green-600', 'green-700')}
          ${btn('yellow', 'Limited', 'orange-500', 'orange-600')}
          ${btn('red', 'Out', 'primary', 'on-primary-fixed-variant')}
        </div>
      </td>
    </tr>
  `;
}

async function setClearance(athleteId, status) {
  const res = await apiFetch(`/api/athletes/${athleteId}/clearance`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  if (!res || !res.ok) return;
  loadAthletesList();
}

function showAddAthleteModal() {
  let modal = document.getElementById('add-athlete-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'add-athlete-modal';
    document.body.appendChild(modal);
  }
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-white border border-surface-variant shadow-lg w-full max-w-md">
      <div class="bg-on-surface px-6 py-4 flex items-center justify-between">
        <h2 class="text-white font-black uppercase tracking-tight text-lg">Add Athlete</h2>
        <button onclick="closeAddAthleteModal()" class="text-white/60 hover:text-white transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="p-6">
        <div id="add-athlete-error" class="hidden mb-4 p-3 bg-error-container border-l-4 border-error text-sm font-bold text-on-error-container"></div>
        <form id="add-athlete-form" class="space-y-5">
          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Full Name *</label>
            <input id="new-athlete-name" type="text" required
              class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors"
              placeholder="Jordan Smith" />
          </div>
          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Team *</label>
            <input id="new-athlete-team" type="text" required
              class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors"
              placeholder="Varsity" />
          </div>
          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Athlete Account Email <span class="text-outline normal-case tracking-normal font-medium">(optional — links to their login)</span></label>
            <input id="new-athlete-email" type="email"
              class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors"
              placeholder="athlete@university.edu" />
          </div>
          <div class="flex gap-3 pt-2">
            <button type="submit"
              class="flex-1 bg-primary text-white font-black uppercase tracking-widest py-3 px-6 hover:bg-on-primary-fixed-variant transition-colors active:scale-95">
              Add Athlete
            </button>
            <button type="button" onclick="closeAddAthleteModal()"
              class="px-5 py-3 border-2 border-on-surface text-on-surface font-black uppercase tracking-widest text-sm hover:border-primary hover:text-primary transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('add-athlete-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('new-athlete-name').value.trim();
    const team = document.getElementById('new-athlete-team').value.trim();
    const email = document.getElementById('new-athlete-email').value.trim();
    const errEl = document.getElementById('add-athlete-error');
    errEl.classList.add('hidden');

    const res = await apiFetch('/api/athletes', {
      method: 'POST',
      body: JSON.stringify({ name, team: team || undefined, email: email || undefined }),
    });
    if (!res) return;
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error || 'Failed to add athlete'; errEl.classList.remove('hidden'); return; }
    closeAddAthleteModal();
    loadAthletesList();
  });
}

function closeAddAthleteModal() {
  const modal = document.getElementById('add-athlete-modal');
  if (modal) modal.remove();
}
// ─── SOAP Notes ───────────────────────────────────────────────────────────────
let _soapAthletes = [];
let _encounterCache = {};
let _mediaRecorder = null;
let _audioChunks = [];
let _isRecording = false;

function renderSoapList(main, title) {
  if (title) title.textContent = 'SOAP Notes';
  main.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-black uppercase tracking-tighter text-primary">SOAP Notes</h1>
          <p class="text-on-surface-variant font-medium mt-1">Athlete encounter records</p>
        </div>
        <button onclick="showNewEncounterModal()"
          class="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-black uppercase tracking-widest text-sm hover:bg-on-primary-fixed-variant transition-colors active:scale-95">
          <span class="material-symbols-outlined text-base">add_circle</span> New Encounter
        </button>
      </div>

      <div class="flex items-center gap-3">
        <label class="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">Athlete:</label>
        <select id="soap-athlete-filter" onchange="loadEncounters(this.value || null)"
          class="bg-white border-b-2 border-on-surface px-2 py-1.5 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors text-sm min-w-40">
          <option value="">All Athletes</option>
        </select>
      </div>

      <div class="bg-white border border-surface-variant shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-widest font-black border-b border-surface-variant">
              <th class="px-6 py-4">Athlete</th>
              <th class="px-6 py-4">Date</th>
              <th class="px-6 py-4">Assessment</th>
              <th class="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody id="encounters-body">
            <tr><td colspan="4" class="px-6 py-8 text-center text-on-surface-variant">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  loadSoapPage();
}

async function loadSoapPage() {
  const [athletesRes, encountersRes] = await Promise.all([
    apiFetch('/api/athletes'),
    apiFetch('/api/encounters'),
  ]);

  if (athletesRes) {
    _soapAthletes = await athletesRes.json();
    const filter = document.getElementById('soap-athlete-filter');
    if (filter) {
      _soapAthletes.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id;
        opt.textContent = a.name;
        filter.appendChild(opt);
      });
    }
  }

  if (encountersRes) {
    const encounters = await encountersRes.json();
    renderEncountersTable(encounters);
  }
}

async function loadEncounters(athleteId) {
  const url = athleteId ? `/api/encounters?athlete_id=${athleteId}` : '/api/encounters';
  const res = await apiFetch(url);
  if (!res) return;
  renderEncountersTable(await res.json());
}

function renderEncountersTable(encounters) {
  encounters.forEach(e => { _encounterCache[e.id] = e; });
  const tbody = document.getElementById('encounters-body');
  if (!tbody) return;
  if (!encounters.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-12 text-center text-on-surface-variant font-medium">No encounters yet. Click <strong>New Encounter</strong> to create one.</td></tr>';
    return;
  }
  tbody.innerHTML = encounters.map(e => `
    <tr class="border-b border-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer" onclick="showEncounterDetail(${e.id})">
      <td class="px-6 py-4 font-black text-on-surface">
        <div onclick="event.stopPropagation()">
          <a href="javascript:void(0)" onclick="openAthleteProfile(${e.athlete_id})" class="hover:text-primary hover:underline">${escHtml(e.athlete_name)}</a>
        </div>
      </td>
      <td class="px-6 py-4 text-on-surface-variant font-medium text-sm">${formatDate(e.created_at)}</td>
      <td class="px-6 py-4 text-on-surface-variant text-sm">${escHtml((e.assessment || '—').slice(0, 80))}${(e.assessment || '').length > 80 ? '…' : ''}</td>
      <td class="px-6 py-4 text-right">
        <button onclick="event.stopPropagation(); showEncounterDetail(${e.id})"
          class="px-3 py-1.5 border-2 border-on-surface text-on-surface text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-colors">
          View
        </button>
      </td>
    </tr>
  `).join('');
}

async function openNewEncounterFromDashboard(focusVoice = false) {
  if (!_soapAthletes.length) {
    const res = await apiFetch('/api/athletes');
    if (res) _soapAthletes = await res.json();
  }
  showNewEncounterModal();
  if (focusVoice) {
    requestAnimationFrame(() => {
      const btn = document.getElementById('voice-btn');
      if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
}

function showNewEncounterModal() {
  if (_isRecording) stopVoiceRecording();
  _audioChunks = [];

  let modal = document.getElementById('encounter-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'encounter-modal';
    document.body.appendChild(modal);
  }
  modal.className = 'fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto';

  if (!_soapAthletes.length) {
    modal.innerHTML = `
      <div class="bg-white border border-surface-variant shadow-lg w-full max-w-md mt-20 p-8 text-center">
        <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-4 block">person_off</span>
        <p class="font-black uppercase tracking-tight text-on-surface mb-2">No Athletes Found</p>
        <p class="text-on-surface-variant text-sm mb-6">Add athletes first before creating an encounter.</p>
        <div class="flex gap-3 justify-center">
          <button onclick="closeEncounterModal(); navigateTo('athletes')"
            class="px-5 py-2.5 bg-primary text-white font-black uppercase tracking-widest text-sm hover:bg-on-primary-fixed-variant transition-colors">
            Go to Athletes
          </button>
          <button onclick="closeEncounterModal()"
            class="px-5 py-2.5 border-2 border-on-surface text-on-surface font-black uppercase tracking-widest text-sm hover:border-primary hover:text-primary transition-colors">
            Cancel
          </button>
        </div>
      </div>`;
    return;
  }

  modal.innerHTML = `
    <div class="bg-white border border-surface-variant shadow-lg w-full max-w-2xl my-4">
      <div class="bg-on-surface px-6 py-4 flex items-center justify-between">
        <h2 class="text-white font-black uppercase tracking-tight text-lg">New Encounter</h2>
        <button onclick="closeEncounterModal()" class="text-white/60 hover:text-white transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="p-6">
        <div id="enc-error" class="hidden mb-4 p-3 bg-error-container border-l-4 border-error text-sm font-bold text-on-error-container"></div>
        <form id="encounter-form" class="space-y-5" onsubmit="saveEncounter(event)">
          <input type="hidden" id="enc-voice-transcript" value="" />

          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Team *</label>
            <select id="enc-team" required onchange="filterEncounterAthletes()"
              class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors">
              <option value="">Select team</option>
              ${[...new Set(_soapAthletes.map(a => a.team).filter(Boolean))].sort().map(t => `<option value="${escHtml(t)}">${escHtml(t)}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Athlete *</label>
            <select id="enc-athlete" required disabled
              class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors disabled:opacity-50">
              <option value="">Select athlete</option>
            </select>
          </div>

          <div class="border-2 border-surface-variant p-4 space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <p class="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">Voice Recording</p>
              <div class="flex items-center gap-3">
                <span id="voice-status" class="text-xs text-on-surface-variant font-medium"></span>
                <button type="button" id="voice-btn" onclick="toggleVoiceRecording()"
                  class="flex items-center gap-2 px-4 py-1.5 border-2 border-primary text-primary font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-colors">
                  <span class="material-symbols-outlined text-base" id="voice-icon">mic</span>
                  <span id="voice-label">Start Recording</span>
                </button>
              </div>
            </div>
            <div id="voice-transcript-preview" class="hidden">
              <p class="text-[11px] font-black uppercase tracking-widest text-outline mb-2">Transcript — pre-filled into Subjective</p>
              <div id="voice-transcript-text" class="bg-surface-container-low p-3 text-sm text-on-surface font-medium border-l-4 border-primary leading-relaxed"></div>
            </div>
          </div>

          <div class="border-2 border-surface-variant p-4 space-y-4">
            <p class="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">Injury Classification</p>
            <div>
              <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Injury Type</label>
              <input type="text" id="enc-injury-type" placeholder="e.g. Sprain, Strain, Contusion..."
                class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors text-sm" />
            </div>
            <div>
              <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Body Part</label>
              <select id="enc-body-part"
                class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors">
                <option value="">Select body part</option>
                <option>Ankle/Foot</option>
                <option>Knee</option>
                <option>Hip/Thigh</option>
                <option>Shoulder</option>
                <option>Elbow/Wrist/Hand</option>
                <option>Head/Neck</option>
                <option>Spine/Back</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          ${soapTextarea('Subjective', 'enc-subjective', "Patient's reported symptoms and history...")}
          ${soapTextarea('Objective', 'enc-objective', 'Observed findings, vitals, range of motion...')}
          ${soapTextarea('Assessment', 'enc-assessment', 'Diagnosis or clinical impression...')}
          ${soapTextarea('Plan', 'enc-plan', 'Treatment plan, exercises, follow-up...')}

          <div class="flex gap-3 pt-2">
            <button type="submit"
              class="flex-1 bg-primary text-white font-black uppercase tracking-widest py-3 px-6 hover:bg-on-primary-fixed-variant transition-colors active:scale-95">
              Save Encounter
            </button>
            <button type="button" onclick="closeEncounterModal()"
              class="px-5 py-3 border-2 border-on-surface text-on-surface font-black uppercase tracking-widest text-sm hover:border-primary hover:text-primary transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function closeEncounterModal() {
  if (_isRecording) stopVoiceRecording();
  const modal = document.getElementById('encounter-modal');
  if (modal) modal.remove();
}

function filterEncounterAthletes() {
  const team = document.getElementById('enc-team').value;
  const athleteSelect = document.getElementById('enc-athlete');
  if (!athleteSelect) return;
  
  athleteSelect.innerHTML = '<option value="">Select athlete</option>';
  if (!team) {
    athleteSelect.disabled = true;
    return;
  }
  
  const filtered = _soapAthletes.filter(a => a.team === team);
  filtered.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a.id;
    opt.textContent = a.name;
    athleteSelect.appendChild(opt);
  });
  athleteSelect.disabled = false;
}

function showEncounterDetail(id, editMode = false) {
  const enc = _encounterCache[id];
  if (!enc) return;
  let modal = document.getElementById('encounter-detail-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'encounter-detail-modal';
    document.body.appendChild(modal);
  }
  modal.className = 'fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto';

  if (editMode) {
    modal.innerHTML = `
      <div class="bg-white border border-surface-variant shadow-lg w-full max-w-2xl my-4">
        <div class="bg-on-surface px-6 py-4 flex items-center justify-between">
          <h2 class="text-white font-black uppercase tracking-tight text-lg">Edit Encounter</h2>
          <button onclick="showEncounterDetail(${id}, false)" class="text-white/60 hover:text-white transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="p-6">
          <div id="edit-enc-error" class="hidden mb-4 p-3 bg-error-container border-l-4 border-error text-sm font-bold text-on-error-container"></div>
          <form id="edit-encounter-form" class="space-y-5" onsubmit="saveEncounterEdit(event, ${id})">
            <div class="border-2 border-surface-variant p-4 space-y-4">
              <p class="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">Injury Classification</p>
              <div>
                <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Injury Type</label>
                <input type="text" id="edit-enc-injury-type" value="${escHtml(enc.injury_type || '')}" placeholder="e.g. Sprain, Strain, Contusion..."
                  class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors text-sm" />
              </div>
              <div>
                <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Body Part</label>
                <select id="edit-enc-body-part"
                  class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors">
                  <option value="">Select body part</option>
                  ${['Ankle/Foot', 'Knee', 'Hip/Thigh', 'Shoulder', 'Elbow/Wrist/Hand', 'Head/Neck', 'Spine/Back', 'Other']
                    .map(part => `<option value="${part}" ${enc.body_part === part ? 'selected' : ''}>${part}</option>`).join('')}
                </select>
              </div>
            </div>

            ${editSoapTextarea('Subjective', 'edit-enc-subjective', enc.subjective)}
            ${editSoapTextarea('Objective', 'edit-enc-objective', enc.objective)}
            ${editSoapTextarea('Assessment', 'edit-enc-assessment', enc.assessment)}
            ${editSoapTextarea('Plan', 'edit-enc-plan', enc.plan)}

            <div class="flex gap-3 pt-2">
              <button type="submit"
                class="flex-1 bg-primary text-white font-black uppercase tracking-widest py-3 px-6 hover:bg-on-primary-fixed-variant transition-colors active:scale-95">
                Save Changes
              </button>
              <button type="button" onclick="showEncounterDetail(${id}, false)"
                class="px-5 py-3 border-2 border-on-surface text-on-surface font-black uppercase tracking-widest text-sm hover:border-primary hover:text-primary transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    return;
  }

  const isTrainer = currentUser?.role === 'trainer' || currentUser?.role === 'admin';
  const updatedText = (enc.updated_at && enc.updated_at !== enc.created_at) 
    ? `<p class="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">Last Updated: ${formatDate(enc.updated_at)}</p>` 
    : '';

  modal.innerHTML = `
    <div class="bg-white border border-surface-variant shadow-lg w-full max-w-2xl my-4">
      <div class="bg-on-surface px-6 py-4 flex items-start justify-between">
        <div>
          <div class="flex items-center gap-4">
            <h2 class="text-white font-black uppercase tracking-tight text-lg hover:underline cursor-pointer" onclick="openAthleteProfile(${enc.athlete_id})">${escHtml(enc.athlete_name)}</h2>
            ${statusBadge(enc.clearance_status)}
          </div>
          <p class="text-white/60 text-xs font-medium mt-0.5">${formatDate(enc.created_at)}</p>
          ${updatedText}
        </div>
        <div class="flex items-center gap-2">
          ${isTrainer ? `
          <button onclick="showEncounterDetail(${id}, true)" class="text-white/80 hover:text-white transition-colors flex items-center justify-center w-8 h-8 rounded" title="Edit Encounter">
            <span class="material-symbols-outlined text-[20px]">edit</span>
          </button>
          ` : ''}
          <button onclick="document.getElementById('encounter-detail-modal').remove()" class="text-white/60 hover:text-white transition-colors flex items-center justify-center w-8 h-8 rounded">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
      <div class="p-6 space-y-5">
        ${(enc.injury_type || enc.body_part) ? `
          <div class="border-2 border-surface-variant p-4 grid grid-cols-2 gap-4">
            <div>
              <p class="text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Injury Type</p>
              <p class="text-sm font-medium text-on-surface">${escHtml(enc.injury_type || '—')}</p>
            </div>
            <div>
              <p class="text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Body Part</p>
              <p class="text-sm font-medium text-on-surface">${escHtml(enc.body_part || '—')}</p>
            </div>
          </div>` : ''}
        ${soapFieldDisplay('Subjective', enc.subjective)}
        ${soapFieldDisplay('Objective', enc.objective)}
        ${soapFieldDisplay('Assessment', enc.assessment)}
        ${soapFieldDisplay('Plan', enc.plan)}
        ${enc.voice_transcript ? `
          <div class="pt-2 border-t border-surface-variant">
            <p class="text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Raw Voice Transcript</p>
            <div class="bg-surface-container-low p-3 text-sm text-on-surface-variant border-l-4 border-outline-variant leading-relaxed">${escHtml(enc.voice_transcript)}</div>
          </div>` : ''}
      </div>
    </div>
  `;
}

async function saveEncounterEdit(e, id) {
  e.preventDefault();
  const injury_type = document.getElementById('edit-enc-injury-type').value.trim();
  const body_part = document.getElementById('edit-enc-body-part').value;
  const subjective = document.getElementById('edit-enc-subjective').value.trim();
  const objective = document.getElementById('edit-enc-objective').value.trim();
  const assessment = document.getElementById('edit-enc-assessment').value.trim();
  const plan = document.getElementById('edit-enc-plan').value.trim();
  const errEl = document.getElementById('edit-enc-error');

  const res = await apiFetch(`/api/encounters/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ injury_type, body_part, subjective, objective, assessment, plan }),
  });
  
  if (!res) return;
  const data = await res.json();
  if (!res.ok) { 
    errEl.textContent = data.error || 'Failed to update'; 
    errEl.classList.remove('hidden'); 
    return; 
  }
  
  _encounterCache[id] = data;
  showEncounterDetail(id, false);
  loadEncounters(null);
}

function editSoapTextarea(label, id, value) {
  return `
    <div>
      <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">${label}</label>
      <textarea id="${id}" rows="3"
        class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors resize-y text-sm leading-relaxed">${escHtml(value || '')}</textarea>
    </div>
  `;
}

// ─── Voice recording ──────────────────────────────────────────────────────────
async function toggleVoiceRecording() {
  if (_isRecording) { stopVoiceRecording(); } else { await startVoiceRecording(); }
}

async function startVoiceRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    _audioChunks = [];
    _mediaRecorder = new MediaRecorder(stream);
    _mediaRecorder.ondataavailable = e => { if (e.data.size > 0) _audioChunks.push(e.data); };
    _mediaRecorder.onstop = handleRecordingStop;
    _mediaRecorder.start();
    _isRecording = true;
    const btn = document.getElementById('voice-btn');
    if (btn) btn.classList.add('bg-primary', 'text-white', 'voice-pulse');
    const icon = document.getElementById('voice-icon');
    if (icon) icon.textContent = 'stop';
    const label = document.getElementById('voice-label');
    if (label) label.textContent = 'Stop Recording';
    const status = document.getElementById('voice-status');
    if (status) status.textContent = 'Recording...';
  } catch {
    const status = document.getElementById('voice-status');
    if (status) status.textContent = 'Microphone access denied';
  }
}

function stopVoiceRecording() {
  if (_mediaRecorder && _isRecording) {
    _mediaRecorder.stop();
    _mediaRecorder.stream.getTracks().forEach(t => t.stop());
    _isRecording = false;
    const btn = document.getElementById('voice-btn');
    if (btn) btn.classList.remove('bg-primary', 'text-white', 'voice-pulse');
    const icon = document.getElementById('voice-icon');
    if (icon) icon.textContent = 'mic';
    const label = document.getElementById('voice-label');
    if (label) label.textContent = 'Start Recording';
    const status = document.getElementById('voice-status');
    if (status) status.textContent = 'Transcribing...';
  }
}

async function handleRecordingStop() {
  const blob = new Blob(_audioChunks, { type: 'audio/webm' });
  const formData = new FormData();
  formData.append('audio', blob, 'recording.webm');
  const statusEl = document.getElementById('voice-status');

  try {
    const token = getToken();
    const res = await fetch('/voice/transcribe', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      if (statusEl) statusEl.textContent = data.error || 'Transcription failed';
      return;
    }
    const transcript = data.transcript || '';
    const previewEl = document.getElementById('voice-transcript-preview');
    const previewText = document.getElementById('voice-transcript-text');
    if (previewEl && previewText) {
      previewText.textContent = transcript;
      previewEl.classList.remove('hidden');
    }
    const subjEl = document.getElementById('enc-subjective');
    if (subjEl && !subjEl.value.trim()) subjEl.value = transcript;
    const hiddenEl = document.getElementById('enc-voice-transcript');
    if (hiddenEl) hiddenEl.value = transcript;
    if (statusEl) statusEl.textContent = 'Transcript ready';
  } catch {
    if (statusEl) statusEl.textContent = 'Transcription failed';
  }
}

async function saveEncounter(e) {
  e.preventDefault();
  const athleteId = document.getElementById('enc-athlete').value;
  const injuryType = document.getElementById('enc-injury-type').value.trim();
  const bodyPart = document.getElementById('enc-body-part').value;
  const subjective = document.getElementById('enc-subjective').value.trim();
  const objective = document.getElementById('enc-objective').value.trim();
  const assessment = document.getElementById('enc-assessment').value.trim();
  const plan = document.getElementById('enc-plan').value.trim();
  const voiceTranscript = document.getElementById('enc-voice-transcript').value;
  const errEl = document.getElementById('enc-error');

  if (!athleteId) {
    errEl.textContent = 'Please select an athlete.';
    errEl.classList.remove('hidden');
    return;
  }

  const res = await apiFetch('/api/encounters', {
    method: 'POST',
    body: JSON.stringify({ athlete_id: athleteId, injury_type: injuryType, body_part: bodyPart, subjective, objective, assessment, plan, voice_transcript: voiceTranscript || null }),
  });
  if (!res) return;
  const data = await res.json();
  if (!res.ok) { errEl.textContent = data.error || 'Failed to save'; errEl.classList.remove('hidden'); return; }
  closeEncounterModal();
  loadEncounters(null);
}

// ─── SOAP helpers ─────────────────────────────────────────────────────────────
function soapTextarea(label, id, placeholder) {
  return `
    <div>
      <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">${label}</label>
      <textarea id="${id}" rows="3" placeholder="${placeholder}"
        class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors resize-y text-sm leading-relaxed"></textarea>
    </div>
  `;
}

function soapFieldDisplay(label, value) {
  return `
    <div>
      <p class="text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-1">${label}</p>
      <p class="text-on-surface font-medium text-sm leading-relaxed whitespace-pre-wrap">${value ? escHtml(value) : '<span class="text-on-surface-variant italic">—</span>'}</p>
    </div>
  `;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr + (dateStr.endsWith('Z') ? '' : 'Z')).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}
// ─── Rehab Plans (Trainer) ────────────────────────────────────────────────────
let _rehabAthletes = [];
let _exerciseLibrary = [];

function renderRehabList(main, title) {
  if (title) title.textContent = 'Rehab Plans';
  main.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-black uppercase tracking-tighter text-primary">Rehab Plans</h1>
          <p class="text-on-surface-variant font-medium mt-1">Build and manage athlete exercise programs</p>
        </div>
        <button onclick="showNewProgramModal()"
          class="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-black uppercase tracking-widest text-sm hover:bg-on-primary-fixed-variant transition-colors active:scale-95">
          <span class="material-symbols-outlined text-base">add_circle</span> New Program
        </button>
      </div>
      <div class="bg-white border border-surface-variant shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-widest font-black border-b border-surface-variant">
              <th class="px-6 py-4">Athlete</th>
              <th class="px-6 py-4">Program</th>
              <th class="px-6 py-4">Exercises</th>
              <th class="px-6 py-4">Created</th>
              <th class="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody id="rehab-programs-body">
            <tr><td colspan="5" class="px-6 py-8 text-center text-on-surface-variant">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  loadRehabPrograms();
}

async function loadRehabPrograms() {
  const res = await apiFetch('/api/rehab/programs');
  if (!res) return;
  const programs = await res.json();
  const tbody = document.getElementById('rehab-programs-body');
  if (!tbody) return;
  if (!programs.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-12 text-center text-on-surface-variant font-medium">No programs yet. Click <strong>New Program</strong> to create one.</td></tr>';
    return;
  }
  tbody.innerHTML = programs.map(p => `
    <tr class="border-b border-surface-variant hover:bg-surface-container-low transition-colors">
      <td class="px-6 py-4 font-black text-on-surface">${escHtml(p.athlete_name)}</td>
      <td class="px-6 py-4 text-on-surface font-medium">${escHtml(p.name)}</td>
      <td class="px-6 py-4 text-on-surface-variant font-medium">${p.exercise_count}</td>
      <td class="px-6 py-4 text-on-surface-variant text-sm font-medium">${formatDate(p.created_at)}</td>
      <td class="px-6 py-4 text-right">
        <button onclick="openRehabProgram(${p.id})"
          class="px-3 py-1.5 border-2 border-on-surface text-on-surface text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-colors">
          Open
        </button>
      </td>
    </tr>
  `).join('');
}

async function showNewProgramModal() {
  const [athletesRes, libRes] = await Promise.all([
    apiFetch('/api/rehab/athletes'),
    apiFetch('/api/rehab/library'),
  ]);
  if (athletesRes) _rehabAthletes = await athletesRes.json();
  if (libRes) _exerciseLibrary = await libRes.json();

  let modal = document.getElementById('new-program-modal');
  if (!modal) { modal = document.createElement('div'); modal.id = 'new-program-modal'; document.body.appendChild(modal); }
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';

  if (!_rehabAthletes.length) {
    modal.innerHTML = `
      <div class="bg-white border border-surface-variant shadow-lg w-full max-w-md p-8 text-center">
        <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-4 block">person_off</span>
        <p class="font-black uppercase tracking-tight text-on-surface mb-2">No Athletes Found</p>
        <p class="text-on-surface-variant text-sm mb-6">Add athletes first before creating a rehab program.</p>
        <div class="flex gap-3 justify-center">
          <button onclick="document.getElementById('new-program-modal').remove(); navigateTo('athletes')"
            class="px-5 py-2.5 bg-primary text-white font-black uppercase tracking-widest text-sm hover:bg-on-primary-fixed-variant transition-colors">
            Go to Athletes
          </button>
          <button onclick="document.getElementById('new-program-modal').remove()"
            class="px-5 py-2.5 border-2 border-on-surface text-on-surface font-black uppercase tracking-widest text-sm hover:border-primary hover:text-primary transition-colors">
            Cancel
          </button>
        </div>
      </div>`;
    return;
  }

  modal.innerHTML = `
    <div class="bg-white border border-surface-variant shadow-lg w-full max-w-md">
      <div class="bg-on-surface px-6 py-4 flex items-center justify-between">
        <h2 class="text-white font-black uppercase tracking-tight text-lg">New Rehab Program</h2>
        <button onclick="document.getElementById('new-program-modal').remove()" class="text-white/60 hover:text-white transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="p-6">
        <div id="new-program-error" class="hidden mb-4 p-3 bg-error-container border-l-4 border-error text-sm font-bold text-on-error-container"></div>
        <form id="new-program-form" class="space-y-5">
          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Athlete *</label>
            <select id="np-athlete" required
              class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors">
              <option value="">Select athlete</option>
              ${_rehabAthletes.map(a => `<option value="${a.id}">${escHtml(a.name)} — ${escHtml(a.team)}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Program Name *</label>
            <input id="np-name" type="text" required
              class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors"
              placeholder="Knee Rehab Phase 1" />
          </div>
          <div class="flex gap-3 pt-2">
            <button type="submit"
              class="flex-1 bg-primary text-white font-black uppercase tracking-widest py-3 px-6 hover:bg-on-primary-fixed-variant transition-colors active:scale-95">
              Create Program
            </button>
            <button type="button" onclick="document.getElementById('new-program-modal').remove()"
              class="px-5 py-3 border-2 border-on-surface text-on-surface font-black uppercase tracking-widest text-sm hover:border-primary hover:text-primary transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('new-program-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const athlete_id = document.getElementById('np-athlete').value;
    const name = document.getElementById('np-name').value.trim();
    const errEl = document.getElementById('new-program-error');
    errEl.classList.add('hidden');
    const res = await apiFetch('/api/rehab/programs', { method: 'POST', body: JSON.stringify({ athlete_id, name }) });
    if (!res) return;
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error || 'Failed to create program'; errEl.classList.remove('hidden'); return; }
    document.getElementById('new-program-modal').remove();
    openRehabProgram(data.id);
  });
}

async function openRehabProgram(programId) {
  const main = document.getElementById('dynamic-content');
  if (!main) return;
  main.innerHTML = `<div class="flex items-center justify-center py-20"><div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>`;

  const [programRes, libRes] = await Promise.all([
    apiFetch(`/api/rehab/programs/${programId}`),
    _exerciseLibrary.length ? Promise.resolve(null) : apiFetch('/api/rehab/library'),
  ]);
  if (libRes) _exerciseLibrary = await libRes.json();
  if (!programRes || !programRes.ok) { main.innerHTML = '<p class="text-error">Program not found.</p>'; return; }
  const program = await programRes.json();
  renderProgramDetail(main, program);
}

function renderProgramDetail(main, program) {
  setActiveNav('rehab');
  main.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <button onclick="navigateTo('rehab')" class="flex items-center gap-1 text-primary font-black text-[11px] uppercase tracking-widest hover:underline mb-2">
            <span class="material-symbols-outlined text-sm">arrow_back</span> All Programs
          </button>
          <h1 class="text-4xl font-black uppercase tracking-tighter text-primary">${escHtml(program.name)}</h1>
          <p class="text-on-surface-variant font-medium mt-1 hover:underline cursor-pointer inline-block" onclick="openAthleteProfile(${program.athlete_id})">${escHtml(program.athlete_name)} · ${escHtml(program.team)}</p>
        </div>
        <button onclick="showAddExerciseModal(${program.id})"
          class="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-black uppercase tracking-widest text-sm hover:bg-on-primary-fixed-variant transition-colors active:scale-95">
          <span class="material-symbols-outlined text-base">add_circle</span> Add Exercise
        </button>
      </div>

      <div id="exercises-table" class="bg-white border border-surface-variant shadow-sm overflow-hidden">
        ${renderExercisesTable(program.exercises, program.id)}
      </div>

      <div>
        <button onclick="toggleHistoryPanel(${program.id})"
          class="flex items-center gap-2 px-4 py-2 border-2 border-on-surface text-on-surface font-black uppercase tracking-widest text-xs hover:border-primary hover:text-primary transition-colors">
          <span class="material-symbols-outlined text-base">history</span> View Completion History
        </button>
        <div id="history-panel" class="hidden mt-4"></div>
      </div>
    </div>
  `;
  window._currentProgramId = program.id;
}

function renderExercisesTable(exercises, programId) {
  if (!exercises.length) {
    return `<div class="px-6 py-12 text-center text-on-surface-variant font-medium">No exercises yet. Click <strong>Add Exercise</strong> to build this program.</div>`;
  }
  return `
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-widest font-black border-b border-surface-variant">
          <th class="px-6 py-4">Exercise</th>
          <th class="px-6 py-4">Sets</th>
          <th class="px-6 py-4">Reps</th>
          <th class="px-6 py-4">Frequency</th>
          <th class="px-6 py-4"></th>
        </tr>
      </thead>
      <tbody>
        ${exercises.map(ex => `
          <tr class="border-b border-surface-variant hover:bg-surface-container-low transition-colors">
            <td class="px-6 py-4 font-black text-on-surface">${escHtml(ex.exercise_name)}</td>
            <td class="px-6 py-4 text-on-surface-variant font-medium">${ex.sets}</td>
            <td class="px-6 py-4 text-on-surface-variant font-medium">${ex.reps}</td>
            <td class="px-6 py-4 text-on-surface-variant font-medium text-sm">${escHtml(ex.frequency)}</td>
            <td class="px-6 py-4 text-right">
              <button onclick="removeExercise(${programId}, ${ex.id})"
                class="px-3 py-1.5 border-2 border-error text-error text-[10px] font-black uppercase tracking-widest hover:bg-error hover:text-white transition-colors">
                Remove
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function showAddExerciseModal(programId) {
  const categories = [...new Set(_exerciseLibrary.map(e => e.category))].sort();

  let modal = document.getElementById('add-exercise-modal');
  if (!modal) { modal = document.createElement('div'); modal.id = 'add-exercise-modal'; document.body.appendChild(modal); }
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-white border border-surface-variant shadow-lg w-full max-w-lg">
      <div class="bg-on-surface px-6 py-4 flex items-center justify-between">
        <h2 class="text-white font-black uppercase tracking-tight text-lg">Add Exercise</h2>
        <button onclick="document.getElementById('add-exercise-modal').remove()" class="text-white/60 hover:text-white transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="p-6">
        <div id="add-ex-error" class="hidden mb-4 p-3 bg-error-container border-l-4 border-error text-sm font-bold text-on-error-container"></div>
        <form id="add-exercise-form" class="space-y-5">
          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Exercise Name *</label>
            <div class="flex gap-2">
              <select id="ex-library-picker" onchange="document.getElementById('ex-name').value = this.value; this.value = ''"
                class="flex-1 bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors text-sm">
                <option value="">— Pick from library —</option>
                ${categories.map(cat => `
                  <optgroup label="${escHtml(cat)}">
                    ${_exerciseLibrary.filter(e => e.category === cat).map(e => `<option value="${escHtml(e.name)}">${escHtml(e.name)}</option>`).join('')}
                  </optgroup>
                `).join('')}
              </select>
            </div>
            <input id="ex-name" type="text" required placeholder="or type a custom name"
              class="mt-2 w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Sets *</label>
              <input id="ex-sets" type="number" min="1" max="99" required placeholder="3"
                class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Reps *</label>
              <input id="ex-reps" type="number" min="1" max="999" required placeholder="15"
                class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Frequency *</label>
            <select id="ex-frequency" required
              class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors">
              <option value="">Select frequency</option>
              <option value="Daily">Daily</option>
              <option value="Twice daily">Twice daily</option>
              <option value="Every other day">Every other day</option>
              <option value="3x/week">3x/week</option>
              <option value="2x/week">2x/week</option>
            </select>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="submit"
              class="flex-1 bg-primary text-white font-black uppercase tracking-widest py-3 px-6 hover:bg-on-primary-fixed-variant transition-colors active:scale-95">
              Add Exercise
            </button>
            <button type="button" onclick="document.getElementById('add-exercise-modal').remove()"
              class="px-5 py-3 border-2 border-on-surface text-on-surface font-black uppercase tracking-widest text-sm hover:border-primary hover:text-primary transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('add-exercise-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const exercise_name = document.getElementById('ex-name').value.trim();
    const sets = document.getElementById('ex-sets').value;
    const reps = document.getElementById('ex-reps').value;
    const frequency = document.getElementById('ex-frequency').value;
    const errEl = document.getElementById('add-ex-error');
    errEl.classList.add('hidden');
    if (!exercise_name) { errEl.textContent = 'Exercise name is required.'; errEl.classList.remove('hidden'); return; }
    const res = await apiFetch(`/api/rehab/programs/${programId}/exercises`, {
      method: 'POST',
      body: JSON.stringify({ exercise_name, sets, reps, frequency }),
    });
    if (!res) return;
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error || 'Failed to add exercise'; errEl.classList.remove('hidden'); return; }
    document.getElementById('add-exercise-modal').remove();
    openRehabProgram(programId);
  });
}

async function removeExercise(programId, exerciseId) {
  if (!confirm('Remove this exercise? Any completion records for it will also be deleted.')) return;
  const res = await apiFetch(`/api/rehab/programs/${programId}/exercises/${exerciseId}`, { method: 'DELETE' });
  if (res && res.ok) openRehabProgram(programId);
}

async function toggleHistoryPanel(programId) {
  const panel = document.getElementById('history-panel');
  if (!panel) return;
  if (!panel.classList.contains('hidden')) { panel.classList.add('hidden'); return; }
  panel.classList.remove('hidden');
  panel.innerHTML = `<div class="flex items-center gap-2 text-on-surface-variant text-sm font-medium"><div class="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div> Loading history...</div>`;
  const res = await apiFetch(`/api/rehab/programs/${programId}/history`);
  if (!res || !res.ok) { panel.innerHTML = '<p class="text-error text-sm">Failed to load history.</p>'; return; }
  const { total_exercises, history } = await res.json();
  if (!history.length) {
    panel.innerHTML = '<p class="text-on-surface-variant text-sm font-medium">No completions recorded yet.</p>';
    return;
  }
  panel.innerHTML = `
    <div class="bg-white border border-surface-variant shadow-sm overflow-hidden">
      <div class="bg-surface-container-low px-6 py-3 border-b border-surface-variant">
        <p class="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">Completion History (last 30 days)</p>
      </div>
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-widest font-black border-b border-surface-variant">
            <th class="px-6 py-4">Date</th>
            <th class="px-6 py-4">Completed</th>
            <th class="px-6 py-4">Progress</th>
          </tr>
        </thead>
        <tbody>
          ${history.map(row => {
            const pct = total_exercises > 0 ? Math.round((row.completed_count / total_exercises) * 100) : 0;
            return `
              <tr class="border-b border-surface-variant">
                <td class="px-6 py-4 font-black text-on-surface">${row.completed_date}</td>
                <td class="px-6 py-4 text-on-surface-variant font-medium">${row.completed_count} / ${total_exercises}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="flex-1 bg-surface-container-high rounded-full h-2 max-w-32">
                      <div class="bg-primary h-2 rounded-full transition-all" style="width:${pct}%"></div>
                    </div>
                    <span class="text-xs font-black text-on-surface-variant">${pct}%</span>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ─── Athlete HEP ──────────────────────────────────────────────────────────────
let _hepCompletions = new Set();

function renderAthleteHEP(main, title) {
  if (title) title.textContent = 'My HEP';
  main.innerHTML = `
    <div class="space-y-6">
      <h1 class="text-4xl font-black uppercase tracking-tighter text-primary">Home Exercise Program</h1>
      <div id="hep-content">
        <div class="flex items-center gap-2 text-on-surface-variant"><div class="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div> Loading your program...</div>
      </div>
    </div>
  `;
  loadAthleteHEP();
}

async function loadAthleteHEP() {
  const res = await apiFetch('/api/rehab/hep');
  const content = document.getElementById('hep-content');
  if (!content) return;
  if (!res) return;
  if (!res.ok) {
    content.innerHTML = '<p class="text-on-surface-variant font-medium">No athlete profile linked to your account yet. Ask your trainer to add you.</p>';
    return;
  }
  const { exercises, completions, today } = await res.json();
  _hepCompletions = new Set(completions);

  if (!exercises.length) {
    content.innerHTML = `
      <div class="bg-white border border-surface-variant p-8 text-center shadow-sm">
        <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">fitness_center</span>
        <p class="font-black uppercase tracking-tight text-on-surface mb-1">No Program Yet</p>
        <p class="text-on-surface-variant text-sm">Your trainer hasn't assigned a rehab program yet.</p>
      </div>`;
    return;
  }

  const total = exercises.length;
  const done = _hepCompletions.size;
  const pct = Math.round((done / total) * 100);

  const dateLabel = new Date(today + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  content.innerHTML = `
    <div class="flex items-center justify-between flex-wrap gap-2">
      <p class="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">${dateLabel}</p>
      <span id="hep-pct-label" class="text-[11px] font-black uppercase tracking-widest text-primary">${done} / ${total} complete</span>
    </div>

    <div class="bg-surface-container-high rounded-full h-3 overflow-hidden">
      <div id="hep-progress-bar" class="bg-primary h-3 rounded-full transition-all duration-300" style="width:${pct}%"></div>
    </div>

    <div class="bg-white border border-surface-variant shadow-sm divide-y divide-surface-variant" id="hep-checklist">
      ${exercises.map(ex => {
        const checked = _hepCompletions.has(ex.id);
        return `
          <label class="flex items-start gap-4 px-6 py-5 cursor-pointer hover:bg-surface-container-low transition-colors ${checked ? 'opacity-60' : ''}">
            <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleHEPExercise(${ex.id}, this.checked)"
              class="mt-1 w-5 h-5 accent-primary cursor-pointer flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="font-black text-on-surface ${checked ? 'line-through' : ''}">${escHtml(ex.exercise_name)}</p>
              <p class="text-sm text-on-surface-variant font-medium mt-0.5">${ex.sets} sets × ${ex.reps} reps &nbsp;·&nbsp; ${escHtml(ex.frequency)}</p>
            </div>
            ${checked ? '<span class="material-symbols-outlined text-green-600 flex-shrink-0 mt-0.5">check_circle</span>' : ''}
          </label>
        `;
      }).join('')}
    </div>
  `;
}

async function toggleHEPExercise(exerciseId, checked) {
  if (checked) {
    _hepCompletions.add(exerciseId);
    await apiFetch('/api/rehab/completions', { method: 'POST', body: JSON.stringify({ exercise_id: exerciseId }) });
  } else {
    _hepCompletions.delete(exerciseId);
    await apiFetch(`/api/rehab/completions/${exerciseId}`, { method: 'DELETE' });
  }
  updateHEPProgress();

  // Refresh the checklist item appearance
  const content = document.getElementById('hep-content');
  if (!content) return;
  const label = content.querySelector(`input[onchange="toggleHEPExercise(${exerciseId}, this.checked)"]`)?.closest('label');
  if (!label) return;
  if (checked) {
    label.classList.add('opacity-60');
    label.querySelector('p.font-black')?.classList.add('line-through');
    if (!label.querySelector('.material-symbols-outlined')) {
      const icon = document.createElement('span');
      icon.className = 'material-symbols-outlined text-green-600 flex-shrink-0 mt-0.5';
      icon.textContent = 'check_circle';
      label.appendChild(icon);
    }
  } else {
    label.classList.remove('opacity-60');
    label.querySelector('p.font-black')?.classList.remove('line-through');
    label.querySelector('.material-symbols-outlined')?.remove();
  }
}

function updateHEPProgress() {
  const checklist = document.getElementById('hep-checklist');
  if (!checklist) return;
  const total = checklist.querySelectorAll('input[type="checkbox"]').length;
  const done = _hepCompletions.size;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const bar = document.getElementById('hep-progress-bar');
  if (bar) bar.style.width = pct + '%';
  const label = document.getElementById('hep-pct-label');
  if (label) label.textContent = `${done} / ${total} complete`;
}
// ─── Inventory capsule ────────────────────────────────────────────────────────
const inventoryCapsule = (() => {
  let _items = [];
  let _athletes = [];
  let _checkoutItemId = null;
  let _scanStream = null;
  let _scanInterval = null;

  // ── Public interface ──────────────────────────────────────────────────────
  function mount(main, title) {
    if (title) title.textContent = 'Inventory';
    main.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-black uppercase tracking-tighter text-primary">Inventory</h1>
          <p class="text-on-surface-variant font-medium mt-1">Equipment &amp; Supplies</p>
        </div>
        <div class="flex gap-3">
          <button data-action="scan-qr"
            class="flex items-center gap-2 px-5 py-2.5 border-2 border-on-surface text-on-surface font-black uppercase tracking-widest text-sm hover:border-primary hover:text-primary transition-colors active:scale-95">
            <span class="material-symbols-outlined text-base">qr_code_scanner</span> Scan QR
          </button>
          <button data-action="add-item"
            class="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-black uppercase tracking-widest text-sm hover:bg-on-primary-fixed-variant transition-colors active:scale-95">
            <span class="material-symbols-outlined text-base">add</span> Add Item
          </button>
        </div>
      </div>

      <div id="inv-stats" class="grid grid-cols-3 gap-4">
        <div class="bg-white border border-surface-variant p-6 shadow-sm animate-pulse h-28"></div>
        <div class="bg-white border border-surface-variant p-6 shadow-sm animate-pulse h-28"></div>
        <div class="bg-white border border-surface-variant p-6 shadow-sm animate-pulse h-28"></div>
      </div>

      <div id="inv-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-white border border-surface-variant p-6 shadow-sm animate-pulse h-40"></div>
        <div class="bg-white border border-surface-variant p-6 shadow-sm animate-pulse h-40"></div>
        <div class="bg-white border border-surface-variant p-6 shadow-sm animate-pulse h-40"></div>
      </div>
    </div>

    <!-- Add Item Modal -->
    <div id="add-item-modal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md shadow-xl">
        <div class="bg-on-surface px-6 py-4 flex items-center justify-between">
          <h3 class="text-white font-black uppercase tracking-widest text-sm">Add Inventory Item</h3>
          <button data-action="close-add" class="text-white hover:text-primary"><span class="material-symbols-outlined">close</span></button>
        </div>
        <div class="p-6 space-y-5">
          <div id="add-item-error" class="hidden p-3 bg-error-container border-l-4 border-error text-sm font-bold text-on-error-container"></div>
          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Item Name</label>
            <input id="item-name" type="text" placeholder="Athletic Tape (1.5&quot;)"
              class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Category</label>
            <input id="item-category" type="text" list="inv-category-list" placeholder="Equipment or Consumable"
              class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors" />
            <datalist id="inv-category-list">
              <option value="Equipment">
              <option value="Consumable">
              <option value="Medical">
              <option value="Protective Gear">
            </datalist>
          </div>
          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Initial Quantity</label>
            <input id="item-qty" type="number" min="0" value="0"
              class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div class="flex gap-3 pt-2">
            <button data-action="close-add" class="flex-1 border-2 border-on-surface text-on-surface font-black uppercase tracking-widest py-2.5 text-sm hover:border-primary hover:text-primary transition-colors">Cancel</button>
            <button data-action="submit-add" class="flex-1 bg-primary text-white font-black uppercase tracking-widest py-2.5 text-sm hover:bg-on-primary-fixed-variant transition-colors">Add Item</button>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Code Modal -->
    <div id="qr-modal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-sm shadow-xl">
        <div class="bg-on-surface px-6 py-4 flex items-center justify-between">
          <h3 id="qr-modal-title" class="text-white font-black uppercase tracking-widest text-sm truncate pr-4">Item QR Code</h3>
          <button data-action="close-qr" class="text-white hover:text-primary flex-shrink-0"><span class="material-symbols-outlined">close</span></button>
        </div>
        <div class="p-6 flex flex-col items-center gap-4">
          <div id="qr-canvas-container" class="border-4 border-on-surface p-2"></div>
          <p class="text-[11px] font-black uppercase tracking-widest text-on-surface-variant text-center">Print or display for scanning</p>
        </div>
      </div>
    </div>

    <!-- Checkout Modal -->
    <div id="checkout-modal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md shadow-xl">
        <div class="bg-on-surface px-6 py-4 flex items-center justify-between">
          <h3 id="checkout-modal-title" class="text-white font-black uppercase tracking-widest text-sm truncate pr-4">Check Out Item</h3>
          <button data-action="close-checkout" class="text-white hover:text-primary flex-shrink-0"><span class="material-symbols-outlined">close</span></button>
        </div>
        <div class="p-6 space-y-5">
          <div id="checkout-error" class="hidden p-3 bg-error-container border-l-4 border-error text-sm font-bold text-on-error-container"></div>
          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Athlete</label>
            <select id="checkout-athlete"
              class="w-full bg-white border-b-2 border-on-surface px-0 py-2 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors">
              <option value="">Select athlete...</option>
            </select>
          </div>
          <div class="flex gap-3 pt-2">
            <button data-action="close-checkout" class="flex-1 border-2 border-on-surface text-on-surface font-black uppercase tracking-widest py-2.5 text-sm hover:border-primary hover:text-primary transition-colors">Cancel</button>
            <button data-action="submit-checkout" class="flex-1 bg-primary text-white font-black uppercase tracking-widest py-2.5 text-sm hover:bg-on-primary-fixed-variant transition-colors">Check Out</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Scan QR Modal -->
    <div id="scan-qr-modal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-sm shadow-xl">
        <div class="bg-on-surface px-6 py-4 flex items-center justify-between">
          <h3 class="text-white font-black uppercase tracking-widest text-sm">Scan Equipment QR</h3>
          <button data-action="close-scan" class="text-white hover:text-primary"><span class="material-symbols-outlined">close</span></button>
        </div>
        <div class="p-6 space-y-4">
          <div id="scan-error" class="hidden p-3 bg-error-container border-l-4 border-error text-sm font-bold text-on-error-container"></div>
          <div class="relative bg-black aspect-square overflow-hidden">
            <video id="scan-video" class="w-full h-full object-cover" playsinline muted></video>
            <canvas id="scan-canvas" class="hidden"></canvas>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-48 h-48 border-4 border-white opacity-60"></div>
            </div>
          </div>
          <p class="text-[11px] font-black uppercase tracking-widest text-on-surface-variant text-center">Point camera at item QR code</p>
        </div>
      </div>
    </div>
  `;
    main.addEventListener('click', _handleClick);
    _load();
  }

  function unmount() {
    _stopQRScan();
    const main = document.getElementById('dynamic-content');
    if (main) main.removeEventListener('click', _handleClick);
  }

  // ── Event delegation ──────────────────────────────────────────────────────
  function _handleClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id ? parseInt(btn.dataset.id) : null;
    const delta = btn.dataset.delta !== undefined ? parseInt(btn.dataset.delta) : null;
    const loan = btn.dataset.loan ? parseInt(btn.dataset.loan) : null;
    switch (action) {
      case 'scan-qr':        _openScanQR(); break;
      case 'add-item':       _openAddItem(); break;
      case 'close-add':      _closeAddItem(); break;
      case 'submit-add':     _submitAddItem(); break;
      case 'show-qr':        _showQRCode(id); break;
      case 'close-qr':       _closeQRModal(); break;
      case 'adj-qty':        _adjustQty(id, delta); break;
      case 'checkout':       _openCheckout(id); break;
      case 'close-checkout': _closeCheckoutModal(); break;
      case 'submit-checkout': _submitCheckout(); break;
      case 'checkin':        _checkInLoan(id, loan); break;
      case 'close-scan':     _closeScanQR(); break;
    }
  }

  // ── Data ──────────────────────────────────────────────────────────────────
  async function _load() {
    const res = await apiFetch('/api/inventory');
    if (!res) return;
    _items = await res.json();
    _renderStats();
    _renderGrid();
  }

  function _renderStats() {
    const el = document.getElementById('inv-stats');
    if (!el) return;
    const total = _items.length;
    const loaned = _items.reduce((sum, i) => sum + i.loaned_count, 0);
    const low = _items.filter(i => i.quantity <= 5).length;
    el.innerHTML = `
      <div class="bg-white border-t-4 border-primary p-6 shadow-sm">
        <p class="text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-3">Total Items</p>
        <p class="text-5xl font-black text-on-surface">${total}</p>
      </div>
      <div class="bg-white border-t-4 border-orange-500 p-6 shadow-sm">
        <p class="text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-3">Items On Loan</p>
        <p class="text-5xl font-black text-on-surface">${loaned}</p>
      </div>
      <div class="bg-white border-t-4 border-yellow-500 p-6 shadow-sm">
        <p class="text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-3">Low Stock</p>
        <p class="text-5xl font-black text-on-surface">${low}</p>
        <p class="text-xs text-on-surface-variant mt-1">5 or fewer units</p>
      </div>
    `;
  }

  function _renderGrid() {
    const grid = document.getElementById('inv-grid');
    if (!grid) return;
    if (_items.length === 0) {
      grid.innerHTML = '<p class="col-span-3 text-on-surface-variant font-medium py-8">No inventory items yet. Click Add Item to get started.</p>';
      return;
    }
    grid.innerHTML = _items.map(item => {
      const isLoaned = item.loaned_count > 0;
      const loanRows = item.active_loans.map(loan => `
        <div class="flex items-center justify-between gap-2 py-1.5 border-b border-surface-variant last:border-0">
          <div class="flex items-center gap-2 min-w-0">
            <span class="material-symbols-outlined text-orange-500 text-base">person</span>
            <span class="font-bold text-sm truncate">${escHtml(loan.athlete_name)}</span>
          </div>
          <button data-action="checkin" data-id="${item.id}" data-loan="${loan.loan_id}"
            class="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-green-600 text-white font-black uppercase tracking-wider text-[10px] hover:bg-green-700 transition-colors active:scale-95">
            <span class="material-symbols-outlined text-sm">check</span> Return
          </button>
        </div>
      `).join('');

      return `
        <div class="bg-white border ${isLoaned ? 'border-orange-300 border-t-4 border-t-orange-500' : 'border-surface-variant'} shadow-sm flex flex-col">
          <div class="p-5 flex-1">
            <div class="flex items-start justify-between gap-2 mb-3">
              <div class="min-w-0">
                <h3 class="font-black text-on-surface text-lg leading-tight">${escHtml(item.name)}</h3>
                <span class="inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 mt-1 ${item.category === 'Equipment' ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}">${escHtml(item.category)}</span>
              </div>
              <button data-action="show-qr" data-id="${item.id}"
                class="flex-shrink-0 w-9 h-9 flex items-center justify-center border border-surface-variant hover:border-primary hover:text-primary text-on-surface-variant transition-colors"
                title="Show QR Code">
                <span class="material-symbols-outlined text-base">qr_code</span>
              </button>
            </div>

            <div class="flex items-center gap-4 my-4">
              <div class="flex items-center">
                <button data-action="adj-qty" data-id="${item.id}" data-delta="-1"
                  class="w-9 h-9 flex items-center justify-center border border-on-surface text-on-surface hover:border-primary hover:text-primary font-black text-lg transition-colors active:scale-95">−</button>
                <span id="qty-${item.id}" class="w-14 text-center text-2xl font-black text-on-surface border-y border-transparent py-1">${item.quantity}</span>
                <button data-action="adj-qty" data-id="${item.id}" data-delta="1"
                  class="w-9 h-9 flex items-center justify-center border border-on-surface text-on-surface hover:border-primary hover:text-primary font-black text-lg transition-colors active:scale-95">+</button>
              </div>
              <span class="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">in stock</span>
            </div>

            ${isLoaned ? `
              <div class="mt-2">
                <p class="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-2 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">swap_horiz</span> ${item.loaned_count} on loan
                </p>
                ${loanRows}
              </div>
            ` : ''}
          </div>
          <div class="border-t border-surface-variant px-5 py-3">
            <button data-action="checkout" data-id="${item.id}"
              class="w-full flex items-center justify-center gap-2 py-2 border border-on-surface text-on-surface font-black uppercase tracking-widest text-xs hover:border-primary hover:text-primary transition-colors active:scale-95">
              <span class="material-symbols-outlined text-sm">arrow_forward</span> Check Out
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  async function _adjustQty(itemId, delta) {
    const res = await apiFetch(`/api/inventory/${itemId}/quantity`, {
      method: 'PATCH',
      body: JSON.stringify({ delta }),
    });
    if (!res || !res.ok) return;
    const data = await res.json();
    const el = document.getElementById(`qty-${itemId}`);
    if (el) el.textContent = data.quantity;
    const item = _items.find(i => i.id === itemId);
    if (item) item.quantity = data.quantity;
    _renderStats();
  }

  async function _checkInLoan(itemId, loanId) {
    const res = await apiFetch(`/api/inventory/${itemId}/checkin`, {
      method: 'POST',
      body: JSON.stringify({ loan_id: loanId }),
    });
    if (!res || !res.ok) return;
    await _load();
  }

  function _openAddItem() {
    document.getElementById('add-item-error')?.classList.add('hidden');
    document.getElementById('item-name').value = '';
    document.getElementById('item-category').value = '';
    document.getElementById('item-qty').value = '0';
    document.getElementById('add-item-modal')?.classList.remove('hidden');
    document.getElementById('item-name')?.focus();
  }
  function _closeAddItem() { document.getElementById('add-item-modal')?.classList.add('hidden'); }
  async function _submitAddItem() {
    const name = document.getElementById('item-name').value.trim();
    const category = document.getElementById('item-category').value.trim();
    const quantity = parseInt(document.getElementById('item-qty').value) || 0;
    const errEl = document.getElementById('add-item-error');
    errEl.classList.add('hidden');
    if (!name || !category) { errEl.textContent = 'Name and category are required.'; errEl.classList.remove('hidden'); return; }
    const res = await apiFetch('/api/inventory', { method: 'POST', body: JSON.stringify({ name, category, quantity }) });
    if (!res) return;
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error || 'Failed to add item.'; errEl.classList.remove('hidden'); return; }
    _closeAddItem();
    _items.push({ ...data, loaned_count: 0, active_loans: [] });
    _renderStats();
    _renderGrid();
  }

  function _showQRCode(itemId) {
    const item = _items.find(i => i.id === itemId);
    if (!item) return;
    const modal = document.getElementById('qr-modal');
    const titleEl = document.getElementById('qr-modal-title');
    const container = document.getElementById('qr-canvas-container');
    if (!modal || !container) return;
    titleEl.textContent = item.name;
    container.innerHTML = '';
    if (typeof QRCode !== 'undefined') {
      new QRCode(container, { text: `nest-inv:${itemId}`, width: 200, height: 200, colorDark: '#1c1b1b', colorLight: '#ffffff' });
    } else {
      container.innerHTML = `<div class="p-6 text-center"><p class="font-black text-on-surface text-lg">ID: ${itemId}</p><p class="text-xs text-on-surface-variant mt-1">QR library not loaded</p></div>`;
    }
    modal.classList.remove('hidden');
  }
  function _closeQRModal() { document.getElementById('qr-modal')?.classList.add('hidden'); }

  function _openCheckout(itemId) {
    const item = _items.find(i => i.id === itemId);
    if (!item) return;
    _checkoutItemId = itemId;
    document.getElementById('checkout-modal-title').textContent = `Check Out: ${item.name}`;
    document.getElementById('checkout-error')?.classList.add('hidden');
    document.getElementById('checkout-modal')?.classList.remove('hidden');
    _loadAthletesForCheckout();
  }
  function _closeCheckoutModal() {
    document.getElementById('checkout-modal')?.classList.add('hidden');
    _checkoutItemId = null;
  }
  async function _loadAthletesForCheckout() {
    if (_athletes.length === 0) {
      const res = await apiFetch('/api/athletes');
      if (!res) return;
      _athletes = await res.json();
    }
    const sel = document.getElementById('checkout-athlete');
    if (!sel) return;
    sel.innerHTML = '<option value="">Select athlete...</option>' +
      _athletes.map(a => `<option value="${a.id}">${escHtml(a.name)} — ${escHtml(a.team)}</option>`).join('');
  }
  async function _submitCheckout() {
    const athleteId = document.getElementById('checkout-athlete').value;
    const errEl = document.getElementById('checkout-error');
    errEl.classList.add('hidden');
    if (!athleteId) { errEl.textContent = 'Please select an athlete.'; errEl.classList.remove('hidden'); return; }
    const res = await apiFetch(`/api/inventory/${_checkoutItemId}/checkout`, {
      method: 'POST',
      body: JSON.stringify({ athlete_id: parseInt(athleteId) }),
    });
    if (!res) return;
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error || 'Checkout failed.'; errEl.classList.remove('hidden'); return; }
    _closeCheckoutModal();
    await _load();
  }

  function _openScanQR() {
    document.getElementById('scan-error')?.classList.add('hidden');
    document.getElementById('scan-qr-modal')?.classList.remove('hidden');
    _startQRScan();
  }
  async function _startQRScan() {
    const video = document.getElementById('scan-video');
    const errEl = document.getElementById('scan-error');
    if (!video) return;
    try {
      _scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      video.srcObject = _scanStream;
      await video.play();
      _scanInterval = setInterval(_scanFrame, 200);
    } catch {
      if (errEl) { errEl.textContent = 'Camera access denied or unavailable.'; errEl.classList.remove('hidden'); }
    }
  }
  function _scanFrame() {
    const video = document.getElementById('scan-video');
    const canvas = document.getElementById('scan-canvas');
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (typeof jsQR === 'undefined') return;
    const code = jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
    if (code && code.data.startsWith('nest-inv:')) {
      const itemId = parseInt(code.data.replace('nest-inv:', ''));
      if (!isNaN(itemId)) { _stopQRScan(); _closeScanQR(); _handleScannedItem(itemId); }
    }
  }
  function _stopQRScan() {
    if (_scanInterval) { clearInterval(_scanInterval); _scanInterval = null; }
    if (_scanStream) { _scanStream.getTracks().forEach(t => t.stop()); _scanStream = null; }
  }
  function _closeScanQR() { _stopQRScan(); document.getElementById('scan-qr-modal')?.classList.add('hidden'); }
  function _handleScannedItem(itemId) {
    const item = _items.find(i => i.id === itemId);
    if (!item) { alert('Item not found in inventory.'); return; }
    if (item.loaned_count > 0) {
      const loan = item.active_loans[0];
      if (confirm(`Check in "${item.name}" from ${loan.athlete_name}?`)) _checkInLoan(item.id, loan.loan_id);
    } else {
      _openCheckout(item.id);
    }
  }

  return { mount, unmount };
})();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusBadge(status, large = false) {
  const size = large ? 'text-base px-4 py-2' : 'text-[10px] px-2.5 py-1';
  if (status === 'green') return `<span class="bg-green-600 text-white ${size} rounded-full font-black uppercase tracking-wider">Cleared</span>`;
  if (status === 'yellow') return `<span class="bg-orange-500 text-white ${size} rounded-full font-black uppercase tracking-wider">Limited</span>`;
  if (status === 'red') return `<span class="bg-primary text-white ${size} rounded-full font-black uppercase tracking-wider">Out</span>`;
  return '';
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Athlete Profile Modal ───────────────────────────────────────────────────

let currentAthleteProfileId = null;
let isAthleteProfileEditMode = false;
let currentAthleteProfileData = null;

async function openAthleteProfile(athleteId) {
  currentAthleteProfileId = athleteId;
  isAthleteProfileEditMode = false;
  
  const res = await apiFetch(`/api/athletes/${athleteId}`);
  if (!res) return;
  currentAthleteProfileData = await res.json();
  
  renderAthleteProfileModal();
}

function renderAthleteProfileModal() {
  const data = currentAthleteProfileData;
  const isTrainer = currentUser?.role === 'trainer' || currentUser?.role === 'admin';
  
  let modal = document.getElementById('athlete-profile-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'athlete-profile-modal';
    modal.className = 'fixed inset-0 z-[100] flex flex-col bg-surface overflow-y-auto';
    document.body.appendChild(modal);
  }
  
  const v = (val) => val ? escHtml(val) : '—';
  
  const renderField = (label, key, type = 'text') => {
    if (isAthleteProfileEditMode) {
      const val = data[key] || '';
      return `
        <div>
          <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-1">${label}</label>
          <input id="edit-profile-${key}" type="${type}" value="${escHtml(val)}"
            class="w-full bg-white border-b-2 border-on-surface px-0 py-1 text-on-surface font-medium focus:outline-none focus:border-primary transition-colors" />
        </div>`;
    } else {
      return `
        <div>
          <label class="block text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-1">${label}</label>
          <p class="text-on-surface font-medium">${v(data[key])}</p>
        </div>`;
    }
  };

  modal.innerHTML = `
    <!-- Header -->
    <header class="sticky top-0 right-0 left-0 h-16 flex justify-between items-center px-6 z-50 bg-white border-b border-surface-variant">
      <div class="flex items-center gap-4">
        <button onclick="closeAthleteProfile()" class="flex items-center justify-center w-10 h-10 hover:bg-surface-container rounded-full transition-colors text-on-surface">
          <span class="material-symbols-outlined">close</span>
        </button>
        <span class="text-xl font-black uppercase tracking-tight text-on-surface">Athlete Profile</span>
      </div>
      <div class="flex items-center gap-4">
        ${statusBadge(data.clearance_status)}
        ${isTrainer ? `
          <button onclick="toggleAthleteProfileEditMode()"
            class="px-4 py-2 text-[11px] font-black uppercase tracking-widest ${isAthleteProfileEditMode ? 'bg-surface-variant text-on-surface' : 'bg-primary text-white hover:bg-on-primary-fixed-variant'} transition-colors">
            ${isAthleteProfileEditMode ? 'Cancel' : 'Edit'}
          </button>
          ${isAthleteProfileEditMode ? `
            <button onclick="saveAthleteProfile()"
              class="px-4 py-2 text-[11px] font-black uppercase tracking-widest bg-primary text-white hover:bg-on-primary-fixed-variant transition-colors">
              Save
            </button>
          ` : ''}
        ` : ''}
      </div>
    </header>

    <div class="flex-1 p-6 max-w-4xl mx-auto w-full">
      <div class="mb-8 flex items-center gap-4 border-b-2 border-on-surface pb-6">
        <div class="w-20 h-20 ${_avatarColor(data.name)} rounded-full flex items-center justify-center">
          <span class="text-white text-3xl font-black">${_injuryInitials(data.name)}</span>
        </div>
        <div>
          <h1 class="text-4xl font-black uppercase tracking-tighter text-on-surface">${escHtml(data.name)}</h1>
          <p class="text-on-surface-variant font-medium mt-1">#${data.id} · ${v(data.team)}</p>
        </div>
      </div>

      <div id="profile-save-error" class="hidden mb-6 p-3 bg-error-container border-l-4 border-error text-sm font-bold text-on-error-container"></div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 pb-10">
        <!-- Personal -->
        <div>
          <h2 class="text-lg font-black uppercase tracking-tight text-primary mb-4 border-b border-surface-variant pb-2">Personal</h2>
          <div class="space-y-4">
            ${renderField('Name', 'name')}
            ${renderField('Team', 'team')}
            ${renderField('Year', 'year')}
            ${renderField('Phone', 'phone', 'tel')}
            ${renderField('Emergency Contact Name', 'emergency_contact_name')}
            ${renderField('Emergency Contact Phone', 'emergency_contact_phone', 'tel')}
            ${renderField('Insurance', 'insurance')}
          </div>
        </div>

        <!-- Physical -->
        <div>
          <h2 class="text-lg font-black uppercase tracking-tight text-primary mb-4 border-b border-surface-variant pb-2">Physical</h2>
          <div class="space-y-4">
            ${renderField('Age', 'age', 'number')}
            ${renderField('Height', 'height')}
            ${renderField('Weight (lbs)', 'weight', 'number')}
            ${renderField('Blood Type', 'blood_type')}
          </div>
        </div>

        <!-- Medical -->
        <div>
          <h2 class="text-lg font-black uppercase tracking-tight text-primary mb-4 border-b border-surface-variant pb-2">Medical</h2>
          <div class="space-y-4">
            ${renderField('Allergies', 'allergies')}
            ${renderField('Medications', 'medications')}
            ${renderField('Medical History', 'medical_history')}
            ${renderField('Last Physical Date', 'last_physical', 'date')}
            ${renderField('Primary Physician', 'primary_physician')}
          </div>
        </div>

        <!-- Injury -->
        <div>
          <h2 class="text-lg font-black uppercase tracking-tight text-primary mb-4 border-b border-surface-variant pb-2">Injury</h2>
          <div class="space-y-4">
            ${renderField('Injury Type', 'injury_type')}
            ${renderField('Body Part', 'body_part')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function toggleAthleteProfileEditMode() {
  isAthleteProfileEditMode = !isAthleteProfileEditMode;
  renderAthleteProfileModal();
}

function closeAthleteProfile() {
  const modal = document.getElementById('athlete-profile-modal');
  if (modal) {
    modal.remove();
  }
}

async function saveAthleteProfile() {
  const fields = [
    'name', 'team', 'year', 'phone', 'emergency_contact_name', 'emergency_contact_phone', 'insurance',
    'age', 'height', 'weight', 'blood_type',
    'allergies', 'medications', 'medical_history', 'last_physical', 'primary_physician',
    'injury_type', 'body_part'
  ];
  
  const body = {};
  for (const f of fields) {
    const el = document.getElementById(`edit-profile-${f}`);
    if (el) {
      const val = el.value.trim();
      body[f] = val === '' ? null : val;
    }
  }

  const errEl = document.getElementById('profile-save-error');
  errEl.classList.add('hidden');

  const res = await apiFetch(`/api/athletes/${currentAthleteProfileId}`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  });

  if (!res || !res.ok) {
    const err = res ? await res.json() : null;
    errEl.textContent = err?.error || 'Failed to update athlete';
    errEl.classList.remove('hidden');
    return;
  }

  currentAthleteProfileData = await res.json();
  isAthleteProfileEditMode = false;
  
  // Refresh modal and underlying view
  renderAthleteProfileModal();
  if (currentView === 'dashboard') loadTrainerStats(), loadInjuryFeed(), loadWeeklyPlanner();
  else if (currentView === 'athletes') loadAthletesList();
  else if (currentView === 'roster') loadCoachRoster();
}
