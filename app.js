// ── Music ──
const MUSIC = {
    birthday:   { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', title: 'Birthday Bangers' },
    sleepover:  { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', title: 'Late Night Sleepover Mix' },
    graduation: { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', title: 'Grad Celebration Mix' },
    halloween:  { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', title: 'Halloween Spooky Mix' },
    hangout:    { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', title: 'Chill Hangout Beats' },
    custom:     { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', title: 'Party Playlist' },
};

const audio = document.getElementById('bg-audio');
const musicToggle = document.getElementById('music-toggle');
const musicTitle = document.getElementById('music-title');

function loadMusic(type) {
    const wasPlaying = !audio.paused;
    audio.src = MUSIC[type].url;
    audio.volume = document.getElementById('volume-slider').value / 100;
    musicTitle.textContent = MUSIC[type].title;
    if (wasPlaying) audio.play();
    else musicToggle.textContent = 'Play';
}

musicToggle.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        musicToggle.textContent = 'Pause';
    } else {
        audio.pause();
        musicToggle.textContent = 'Play';
    }
});

document.getElementById('volume-slider').addEventListener('input', function () {
    audio.volume = this.value / 100;
    document.getElementById('volume-display').textContent = this.value + '%';
    save();
});

// ── Settings panel ──
const settingsBtn   = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const settingsClose = document.getElementById('settings-close');
const overlay       = document.getElementById('settings-overlay');

function openSettings()  { settingsPanel.classList.add('open'); overlay.classList.add('open'); }
function closeSettings() { settingsPanel.classList.remove('open'); overlay.classList.remove('open'); }

settingsBtn.addEventListener('click', openSettings);
settingsClose.addEventListener('click', closeSettings);
overlay.addEventListener('click', closeSettings);

// ── Fullscreen ──
const fullscreenBtn = document.getElementById('fullscreen-btn');
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});
document.addEventListener('fullscreenchange', () => {
    fullscreenBtn.textContent = document.fullscreenElement ? 'Exit Fullscreen' : 'Enter Fullscreen';
});

// ── Theme toggle ──
const themeBtn = document.getElementById('theme-toggle');
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    themeBtn.textContent = isLight ? 'Dark Mode' : 'Light Mode';
    setCookie('ppt-theme', isLight ? 'light' : 'dark');
});


// ── Party type checklists ──
const DEFAULT_CHECKLISTS = {
    birthday:   ['Pick a venue or spot', 'Send invites to the squad', 'Order a cake', 'Buy decorations', 'Make a playlist', 'Plan activities & games', 'Arrange snacks & drinks'],
    sleepover:  ['Send invites', 'Get sleeping bags & pillows', 'Pick movies to watch', 'Stock up on snacks', 'Set up gaming or activities', 'Make a playlist', 'Arrange breakfast'],
    graduation: ['Book a venue or spot', 'Send invites', 'Order graduation cake', 'Plan food & drinks', 'Set up a photo area', 'Make a slideshow', 'Buy decorations'],
    halloween:  ['Pick your costume', 'Buy costume supplies', 'Decorate the venue', 'Plan candy & treats', 'Set up spooky lighting', 'Create a scary playlist', 'Plan games & activities'],
    hangout:    ['Choose a location', 'Invite your crew', 'Plan snacks & drinks', 'Set up games or activities', 'Make a playlist', 'Grab supplies', 'Sort transport home'],
    custom:     [],
};

let currentType = 'birthday';
let typeLocked = false;
let checklist = [];
let guests = [];
let expenses = [];
let budgetTotal = 0;

// ── Cookies ──
function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

// ── Save / Load ──
function renderTypeLock() {
    const display  = document.getElementById('type-locked-display');
    const picker   = document.getElementById('party-types');
    const nameEl   = document.getElementById('type-locked-name');
    const btn = document.querySelector(`.type-btn[data-type="${currentType}"]`);
    nameEl.textContent = btn ? btn.textContent : currentType;
    display.hidden = !typeLocked;
    picker.hidden  = typeLocked;
}

function save() {
    setCookie('ppt-type',        currentType);
    setCookie('ppt-type-locked', typeLocked ? '1' : '0');
    setCookie('ppt-checklist',   JSON.stringify(checklist));
    setCookie('ppt-guests',      JSON.stringify(guests));
    setCookie('ppt-expenses',    JSON.stringify(expenses));
    setCookie('ppt-budget',      budgetTotal);
    setCookie('ppt-notes',       document.getElementById('notes-input').value);
    setCookie('ppt-volume',      document.getElementById('volume-slider').value);
    renderDashboard();
}

function load() {
    // Theme
    if (getCookie('ppt-theme') === 'light') {
        document.body.classList.add('light');
        themeBtn.textContent = 'Dark Mode';
    }

    // Party type
    currentType = getCookie('ppt-type') || 'birthday';
    typeLocked = getCookie('ppt-type-locked') === '1';
    document.querySelectorAll('.type-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.type === currentType);
    });
    renderTypeLock();

    // Checklist
    checklist = JSON.parse(getCookie('ppt-checklist') || 'null')
        || DEFAULT_CHECKLISTS[currentType].map(t => ({ text: t, done: false }));

    // Guests (handle legacy string[] format)
    guests = JSON.parse(getCookie('ppt-guests') || '[]');
    guests = guests.map(g => typeof g === 'string' ? { name: g, important: false } : g);

    // Expenses
    expenses = JSON.parse(getCookie('ppt-expenses') || '[]');

    // Budget
    budgetTotal = parseFloat(getCookie('ppt-budget')) || 0;
    document.getElementById('budget-total').value = budgetTotal || '';

    // Notes
    document.getElementById('notes-input').value = getCookie('ppt-notes') || '';

    // Volume
    const vol = getCookie('ppt-volume') || '50';
    document.getElementById('volume-slider').value = vol;
    document.getElementById('volume-display').textContent = vol + '%';
    audio.volume = vol / 100;

    loadMusic(currentType);

    // Nav collapsed state
    if (getCookie('ppt-nav-collapsed') === '1') setNavCollapsed(true);
}

// ── Party type buttons ──
document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentType = btn.dataset.type;
        typeLocked = true;
        renderTypeLock();
        checklist = DEFAULT_CHECKLISTS[currentType].map(t => ({ text: t, done: false }));
        renderChecklist();
        loadMusic(currentType);
        save();
        renderDashboard();
    });
});

document.getElementById('type-unlock-btn').addEventListener('click', () => {
    typeLocked = false;
    renderTypeLock();
    setCookie('ppt-type-locked', '0');
});

// ── Checklist ──
function findMatchingExpense(text) {
    if (!expenses.length) return null;
    const words = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 2);
    const clWords = words(text);
    let best = null, bestScore = 0;
    expenses.forEach(exp => {
        const expWords = words(exp.name);
        let score = 0;
        clWords.forEach(cw => expWords.forEach(ew => {
            if (cw === ew || cw.includes(ew) || ew.includes(cw)) score += 2;
        }));
        if (score > bestScore) { bestScore = score; best = exp; }
    });
    return bestScore >= 2 ? best : null;
}

function renderChecklist() {
    const ul = document.getElementById('checklist');
    ul.innerHTML = '';
    checklist.forEach((item, i) => {
        const li = document.createElement('li');
        li.dataset.idx = i;
        if (item.done) li.classList.add('done');
        const match = findMatchingExpense(item.text);
        const costHTML = match ? `<span class="cl-cost">$${match.cost.toFixed(2)}</span>` : '';
        li.innerHTML = `
            <input type="checkbox" ${item.done ? 'checked' : ''}>
            <span>${item.text}</span>
            ${costHTML}
            <button class="del-btn" title="Remove">✕</button>
        `;
        li.querySelector('input').addEventListener('change', () => {
            checklist[+li.dataset.idx].done = !checklist[+li.dataset.idx].done;
            li.classList.toggle('done', checklist[+li.dataset.idx].done);
            save();
        });
        li.querySelector('.del-btn').addEventListener('click', () => {
            checklist.splice(+li.dataset.idx, 1);
            renderChecklist();
            save();
        });
        ul.appendChild(li);
    });
}

document.getElementById('checklist-btn').addEventListener('click', addChecklistItem);
document.getElementById('checklist-input').addEventListener('keydown', e => { if (e.key === 'Enter') addChecklistItem(); });

function addChecklistItem() {
    const input = document.getElementById('checklist-input');
    const text = input.value.trim();
    if (!text) return;
    checklist.push({ text, done: false });
    input.value = '';
    renderChecklist();
    save();
}

// ── Guest list ──
function renderGuests() {
    const ul = document.getElementById('guest-list');
    ul.innerHTML = '';

    // Important guests first
    const sorted = guests
        .map((g, i) => ({ ...g, origIdx: i }))
        .sort((a, b) => b.important - a.important);

    sorted.forEach(({ name, important, origIdx }) => {
        const li = document.createElement('li');
        if (important) li.classList.add('vip');
        li.dataset.idx = origIdx;
        li.innerHTML = `
            <button class="vip-btn${important ? ' on' : ''}" title="${important ? 'Remove VIP' : 'Mark as VIP'}">&#9733;</button>
            <span>${name}</span>
            <button class="remove-btn" title="Remove">&#x2715;</button>
        `;
        li.querySelector('.vip-btn').addEventListener('click', () => {
            guests[origIdx].important = !guests[origIdx].important;
            renderGuests();
            save();
        });
        li.querySelector('.remove-btn').addEventListener('click', () => {
            guests.splice(origIdx, 1);
            renderGuests();
            save();
        });
        ul.appendChild(li);
    });

    document.getElementById('guest-count').textContent = guests.length;
    const vipN = guests.filter(g => g.important).length;
    const vipEl = document.getElementById('vip-count');
    vipEl.textContent = vipN > 0 ? `${vipN} VIP` : '';
}

document.getElementById('guest-btn').addEventListener('click', addGuest);
document.getElementById('guest-input').addEventListener('keydown', e => { if (e.key === 'Enter') addGuest(); });

function addGuest() {
    const input = document.getElementById('guest-input');
    const name = input.value.trim();
    if (!name) return;
    guests.push({ name, important: false });
    input.value = '';
    renderGuests();
    save();
}

// ── Budget ──
document.getElementById('budget-total').addEventListener('input', e => {
    budgetTotal = parseFloat(e.target.value) || 0;
    renderBudget();
    save();
});

function renderBudget() {
    const spent = expenses.reduce((sum, e) => sum + e.cost, 0);
    const remaining = budgetTotal - spent;
    document.getElementById('budget-spent').textContent = `$${spent.toFixed(2)}`;
    const remEl = document.getElementById('budget-remaining');
    remEl.textContent = `$${remaining.toFixed(2)}`;
    remEl.className = remaining < 0 ? 'over' : 'ok';

    const ul = document.getElementById('expense-list');
    ul.innerHTML = '';
    expenses.forEach((exp, i) => {
        const li = document.createElement('li');
        li.dataset.idx = i;
        li.innerHTML = `
            <span>${exp.name}</span>
            ${exp.phone ? `<span class="phone">${exp.phone}</span>` : ''}
            <span class="cost">$${exp.cost.toFixed(2)}</span>
            <button class="remove-btn" title="Remove">✕</button>
        `;
        li.querySelector('.remove-btn').addEventListener('click', () => {
            expenses.splice(+li.dataset.idx, 1);
            renderBudget();
            save();
        });
        ul.appendChild(li);
    });
    renderChecklist();
    renderSpendingChart();
}

document.getElementById('expense-btn').addEventListener('click', addExpense);
document.getElementById('expense-cost').addEventListener('keydown', e => { if (e.key === 'Enter') addExpense(); });

function addExpense() {
    const name = document.getElementById('expense-name').value.trim();
    const cost = parseFloat(document.getElementById('expense-cost').value) || 0;
    const phone = document.getElementById('expense-phone').value.trim();
    if (!name || cost <= 0) return;
    expenses.push({ name, cost, phone });
    document.getElementById('expense-name').value = '';
    document.getElementById('expense-cost').value = '';
    document.getElementById('expense-phone').value = '';
    renderBudget();
    save();
}

// ── Spending Chart ──
const CHART_PALETTE = ['#60a5fa','#f472b6','#4ade80','#fb923c','#a78bfa','#34d399','#f87171','#fbbf24','#818cf8','#e879f9'];

let spendingChart = null;

const centerTextPlugin = {
    id: 'centerText',
    afterDraw(chart) {
        if (!chart.data.datasets[0].data.length) return;
        const { ctx, chartArea: { top, bottom, left, right } } = chart;
        const cx = (left + right) / 2, cy = (top + bottom) / 2;
        const spent = expenses.reduce((a, e) => a + e.cost, 0);
        const style = getComputedStyle(document.documentElement);
        ctx.save();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = 'bold 1.25rem Segoe UI, system-ui, sans-serif';
        ctx.fillStyle = style.getPropertyValue('--text').trim() || '#e2e8f0';
        ctx.fillText('$' + spent.toFixed(0), cx, cy - 9);
        ctx.font = '0.68rem Segoe UI, system-ui, sans-serif';
        ctx.fillStyle = style.getPropertyValue('--text3').trim() || '#64748b';
        ctx.fillText('total spent', cx, cy + 11);
        ctx.restore();
    }
};

function renderSpendingChart() {
    const emptyEl = document.getElementById('spending-empty');
    const bodyEl  = document.getElementById('spending-body');

    if (!expenses.length) {
        bodyEl.style.display  = 'none';
        emptyEl.style.display = '';
        if (spendingChart) { spendingChart.destroy(); spendingChart = null; }
        return;
    }

    bodyEl.style.display  = '';
    emptyEl.style.display = 'none';

    const spent     = expenses.reduce((s, e) => s + e.cost, 0);
    const remaining = budgetTotal > 0 ? Math.max(0, budgetTotal - spent) : 0;
    const base      = budgetTotal > 0 ? budgetTotal : spent;

    const labels = expenses.map(e => e.name);
    const data   = expenses.map(e => e.cost);
    const colors = expenses.map((_, i) => CHART_PALETTE[i % CHART_PALETTE.length]);

    if (remaining > 0) {
        labels.push('Remaining');
        data.push(remaining);
        colors.push('#334155');
    }

    if (spendingChart) {
        spendingChart.data.labels = labels;
        spendingChart.data.datasets[0].data = data;
        spendingChart.data.datasets[0].backgroundColor = colors;
        spendingChart.update();
    } else {
        spendingChart = new Chart(document.getElementById('spending-chart'), {
            type: 'doughnut',
            data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] },
            options: {
                responsive: true,
                cutout: '68%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: { label: ctx => ` ${ctx.label}: $${ctx.parsed.toFixed(2)}` }
                    }
                }
            },
            plugins: [centerTextPlugin]
        });
    }

    // Legend list
    const ul = document.getElementById('spending-legend');
    ul.innerHTML = '';
    expenses.forEach((exp, i) => {
        const pct = base > 0 ? ((exp.cost / base) * 100).toFixed(0) : 0;
        const li  = document.createElement('li');
        li.innerHTML = `
            <span class="legend-dot" style="background:${CHART_PALETTE[i % CHART_PALETTE.length]}"></span>
            <span class="legend-name">${exp.name}</span>
            <span class="legend-cost">$${exp.cost.toFixed(2)}</span>
            <span class="legend-pct">${pct}%</span>
        `;
        ul.appendChild(li);
    });
    if (remaining > 0) {
        const remPct = ((remaining / budgetTotal) * 100).toFixed(0);
        const li = document.createElement('li');
        li.className = 'legend-remaining';
        li.innerHTML = `
            <span class="legend-dot" style="background:#334155;border:1px solid #475569"></span>
            <span class="legend-name">Remaining</span>
            <span class="legend-cost">$${remaining.toFixed(2)}</span>
            <span class="legend-pct">${remPct}%</span>
        `;
        ul.appendChild(li);
    }

    // Progress bar
    const pct   = budgetTotal > 0 ? Math.min(100, (spent / budgetTotal) * 100) : 0;
    document.getElementById('spending-bar-fill').style.width      = pct + '%';
    document.getElementById('spending-bar-fill').style.background = pct >= 100 ? 'var(--red)' : pct >= 80 ? '#fbbf24' : 'var(--accent)';
    document.getElementById('spending-bar-pct').textContent       = pct.toFixed(0) + '%';
    document.getElementById('spending-spent-lbl').textContent     = `$${spent.toFixed(2)} spent`;
    document.getElementById('spending-budget-lbl').textContent    = budgetTotal > 0 ? `of $${budgetTotal.toFixed(0)}` : 'no budget set';
}

// ── Mini Calculator ──
let calcVal  = '0';
let calcPrev = null;
let calcOp   = null;
let calcJustEvaled = false;

function calcUpdate() {
    const el = document.getElementById('calc-display');
    el.textContent = calcVal;
    el.style.fontSize = calcVal.length > 10 ? '1rem' : calcVal.length > 7 ? '1.2rem' : '1.5rem';
    const exprParts = [calcPrev, calcOp === '*' ? '×' : calcOp === '/' ? '÷' : calcOp].filter(Boolean);
    document.getElementById('calc-expr').textContent = exprParts.join(' ');
}

function calcInput(v) {
    if (v === 'C') {
        calcVal = '0'; calcPrev = null; calcOp = null; calcJustEvaled = false;
    } else if (v === 'back') {
        calcVal = calcVal.length > 1 ? calcVal.slice(0, -1) : '0';
    } else if (v === '%') {
        calcVal = String(parseFloat(calcVal) / 100);
    } else if (['+', '-', '*', '/'].includes(v)) {
        if (calcOp && !calcJustEvaled) calcEval();
        calcPrev = parseFloat(calcVal);
        calcOp   = v;
        calcJustEvaled = false;
        // Flag that next digit starts fresh
        calcVal  = calcVal; // keep showing current for reference
        calcJustEvaled = true;  // reuse flag: next digit resets display
    } else if (v === '=') {
        if (calcOp && calcPrev !== null) { calcEval(); calcOp = null; }
    } else {
        if (calcJustEvaled && ['+', '-', '*', '/'].includes(calcOp || '')) {
            calcVal = v === '.' ? '0.' : v;
            calcJustEvaled = false;
        } else {
            if (v === '.' && calcVal.includes('.')) return;
            calcVal = calcVal === '0' && v !== '.' ? v : calcVal + v;
        }
    }
    calcUpdate();
}

function calcEval() {
    const curr = parseFloat(calcVal);
    const ops  = { '+': (a,b)=>a+b, '-': (a,b)=>a-b, '*': (a,b)=>a*b, '/': (a,b)=>b!==0?a/b:NaN };
    const res  = ops[calcOp](calcPrev, curr);
    calcVal    = isNaN(res) ? 'Error' : String(parseFloat(res.toFixed(10)));
    calcPrev   = null;
    calcJustEvaled = true;
}

document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => calcInput(btn.dataset.val));
});

document.getElementById('calc-use-btn').addEventListener('click', () => {
    const v = parseFloat(calcVal);
    if (!isNaN(v) && v >= 0) {
        document.getElementById('expense-cost').value = v;
        document.getElementById('expense-cost').focus();
    }
});

// ── Notes ──
document.getElementById('notes-input').addEventListener('input', save);

// ── Dashboard ──
function renderDashboard() {
    document.getElementById('dash-guests').textContent = guests.length;

    const spent     = expenses.reduce((s, e) => s + e.cost, 0);
    const remaining = budgetTotal - spent;
    const remEl     = document.getElementById('dash-budget');
    remEl.textContent  = `$${remaining.toFixed(0)}`;
    remEl.style.color  = remaining < 0 ? 'var(--red)' : 'var(--green)';

    document.getElementById('dash-expenses').textContent = `$${spent.toFixed(0)}`;

    const done    = checklist.filter(t => t.done).length;
    const total   = checklist.length;
    const tasksEl = document.getElementById('dash-tasks');
    tasksEl.textContent = `${done} / ${total}`;
    tasksEl.style.color = (total > 0 && done === total) ? 'var(--green)' : '';
}

// ── Calendar ──
const TYPE_COLORS = {
    birthday: '#f472b6', sleepover: '#a78bfa', graduation: '#60a5fa',
    halloween: '#fb923c', hangout: '#4ade80', custom: '#94a3b8',
};
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

let calEvents = [];
let calDate   = new Date();
let calSelectedDate = '';

function saveCalEvents() { setCookie('ppt-cal', JSON.stringify(calEvents)); renderDashboard(); updateCountdown(); }
function loadCalEvents() { calEvents = JSON.parse(getCookie('ppt-cal') || '[]'); }

function updateCountdown() {
    const now  = new Date();
    const today = now.toISOString().slice(0, 10);
    const next  = calEvents
        .filter(e => e.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))[0];

    const nameEl  = document.getElementById('countdown-name');
    const daysEl  = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minsEl  = document.getElementById('cd-mins');
    const secsEl  = document.getElementById('cd-secs');

    if (!next) {
        nameEl.textContent  = 'No upcoming parties';
        [daysEl, hoursEl, minsEl, secsEl].forEach(el => el.textContent = '--');
        return;
    }

    nameEl.textContent = next.name;

    const target = new Date(next.date + 'T00:00:00');
    const diff   = target - now;

    if (diff <= 0) {
        nameEl.textContent = next.name + ' — Today!';
        [daysEl, hoursEl, minsEl, secsEl].forEach(el => el.textContent = '00');
        return;
    }

    daysEl.textContent  = String(Math.floor(diff / 864e5)).padStart(2, '0');
    hoursEl.textContent = String(Math.floor((diff % 864e5) / 36e5)).padStart(2, '0');
    minsEl.textContent  = String(Math.floor((diff % 36e5) / 6e4)).padStart(2, '0');
    secsEl.textContent  = String(Math.floor((diff % 6e4) / 1e3)).padStart(2, '0');
}

function renderCalendar() {
    const year  = calDate.getFullYear();
    const month = calDate.getMonth();
    document.getElementById('cal-month-year').textContent = `${MONTH_NAMES[month]} ${year}`;

    const grid = document.getElementById('cal-grid');
    grid.innerHTML = '';

    DAY_NAMES.forEach(d => {
        const el = document.createElement('div');
        el.className = 'cal-day-header';
        el.textContent = d;
        grid.appendChild(el);
    });

    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today       = new Date();

    for (let i = 0; i < firstDay; i++) {
        const el = document.createElement('div');
        el.className = 'cal-day empty';
        grid.appendChild(el);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr    = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const dayEvents  = calEvents.filter(e => e.date === dateStr);
        const isToday    = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

        const el = document.createElement('div');
        el.className = 'cal-day' + (isToday ? ' today' : '');

        let html = `<span class="cal-day-num">${d}</span>`;
        if (dayEvents.length) {
            html += `<div class="cal-dots">`;
            dayEvents.slice(0, 3).forEach(e => {
                html += `<span class="cal-dot" style="background:${TYPE_COLORS[e.type] || TYPE_COLORS.custom}"></span>`;
            });
            html += `</div>`;
        }
        el.innerHTML = html;
        el.addEventListener('click', () => openCalModal(dateStr));
        grid.appendChild(el);
    }
}

function openCalModal(dateStr) {
    calSelectedDate = dateStr;
    const [y, m, d] = dateStr.split('-');
    document.getElementById('cal-modal-date').textContent = `${MONTH_NAMES[+m - 1]} ${+d}, ${y}`;
    renderCalModalEvents();
    document.getElementById('cal-modal-overlay').removeAttribute('hidden');
}

function closeCalModal() {
    document.getElementById('cal-modal-overlay').setAttribute('hidden', '');
    document.getElementById('cal-event-name').value = '';
}

function renderCalModalEvents() {
    const ul = document.getElementById('cal-modal-events');
    ul.innerHTML = '';
    const dayEvents = calEvents.filter(e => e.date === calSelectedDate);
    if (!dayEvents.length) {
        ul.innerHTML = `<li style="color:var(--text3);font-size:0.85rem;">No parties yet.</li>`;
        return;
    }
    dayEvents.forEach(ev => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="event-dot" style="background:${TYPE_COLORS[ev.type] || TYPE_COLORS.custom}"></span>
            <span class="event-name">${ev.name}</span>
            <span class="event-type">${ev.type}</span>
            <button class="remove-btn" title="Delete">✕</button>
        `;
        li.querySelector('.remove-btn').addEventListener('click', () => {
            calEvents = calEvents.filter(e => e.id !== ev.id);
            saveCalEvents();
            renderCalModalEvents();
            renderCalendar();
        });
        ul.appendChild(li);
    });
}

document.getElementById('cal-event-add-btn').addEventListener('click', () => {
    const name = document.getElementById('cal-event-name').value.trim();
    const type = document.getElementById('cal-event-type').value;
    if (!name) return;
    calEvents.push({ id: Date.now(), date: calSelectedDate, name, type });
    saveCalEvents();
    document.getElementById('cal-event-name').value = '';
    renderCalModalEvents();
    renderCalendar();
});

document.getElementById('cal-event-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('cal-event-add-btn').click();
});

document.getElementById('cal-modal-close').addEventListener('click', closeCalModal);
document.getElementById('cal-modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('cal-modal-overlay')) closeCalModal();
});

document.getElementById('cal-prev').addEventListener('click', () => {
    calDate.setMonth(calDate.getMonth() - 1);
    renderCalendar();
});
document.getElementById('cal-next').addEventListener('click', () => {
    calDate.setMonth(calDate.getMonth() + 1);
    renderCalendar();
});

// ── Invitation Card ──
const inviteOverlay = document.getElementById('invite-overlay');

function openInviteModal() {
    // Auto-populate from current data
    const today = new Date().toISOString().slice(0, 10);
    const next  = calEvents.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];

    document.getElementById('inv-title').value    = next ? next.name : currentType.charAt(0).toUpperCase() + currentType.slice(1) + ' Party';
    document.getElementById('inv-date').value     = next ? formatInviteDate(next.date) : '';
    document.getElementById('inv-time').value     = '';
    document.getElementById('inv-location').value = '';
    document.getElementById('inv-host').value     = '';
    document.getElementById('inv-rsvp').value     = '';
    document.getElementById('inv-message').value  = '';

    document.getElementById('invite-card').className = 'type-' + currentType;
    updateInvitePreview();
    inviteOverlay.removeAttribute('hidden');
}

function formatInviteDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const names = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const days  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const dow   = new Date(y, m - 1, d).getDay();
    return `${days[dow]}, ${names[m - 1]} ${d}, ${y}`;
}

function updateInvitePreview() {
    const title    = document.getElementById('inv-title').value.trim();
    const date     = document.getElementById('inv-date').value.trim();
    const time     = document.getElementById('inv-time').value.trim();
    const location = document.getElementById('inv-location').value.trim();
    const host     = document.getElementById('inv-host').value.trim();
    const rsvp     = document.getElementById('inv-rsvp').value.trim();
    const message  = document.getElementById('inv-message').value.trim();

    document.getElementById('ic-title').textContent    = title || 'Party Name';
    document.getElementById('ic-date').textContent     = date;
    document.getElementById('ic-time').textContent     = time;
    document.getElementById('ic-location').textContent = location;
    document.getElementById('ic-host').textContent     = host;
    document.getElementById('ic-rsvp').textContent     = rsvp;
    document.getElementById('ic-message').textContent  = message;

    document.getElementById('ic-row-date').style.display     = date     ? '' : 'none';
    document.getElementById('ic-row-time').style.display     = time     ? '' : 'none';
    document.getElementById('ic-row-location').style.display = location ? '' : 'none';
    document.getElementById('ic-row-host').style.display     = host     ? '' : 'none';
}

document.getElementById('invite-card-btn').addEventListener('click', openInviteModal);
document.getElementById('invite-close').addEventListener('click', () => inviteOverlay.setAttribute('hidden', ''));
inviteOverlay.addEventListener('click', e => { if (e.target === inviteOverlay) inviteOverlay.setAttribute('hidden', ''); });

['inv-title','inv-date','inv-time','inv-location','inv-host','inv-rsvp','inv-message'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateInvitePreview);
});

document.getElementById('invite-print-btn').addEventListener('click', () => window.print());

document.getElementById('invite-share-btn').addEventListener('click', async () => {
    const v = id => document.getElementById(id).value.trim();
    const title    = v('inv-title');
    const date     = v('inv-date');
    const time     = v('inv-time');
    const location = v('inv-location');
    const host     = v('inv-host');
    const rsvp     = v('inv-rsvp');
    const message  = v('inv-message');

    const lines = [];
    if (title)    lines.push(`🎉 ${title}`);
    if (date)     lines.push(`📅 ${date}${time ? ' at ' + time : ''}`);
    if (location) lines.push(`📍 ${location}`);
    if (host)     lines.push(`Hosted by: ${host}`);
    if (rsvp)     lines.push(`RSVP: ${rsvp}`);
    if (message)  lines.push(`\n${message}`);
    lines.push('\nPlan yours at party-planner-trek.vercel.app');

    const text = lines.join('\n');
    const btn  = document.getElementById('invite-share-btn');

    if (navigator.share) {
        try { await navigator.share({ title: title || 'Party Invite', text }); } catch (_) {}
    } else {
        await navigator.clipboard.writeText(text);
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Share Event'; }, 2000);
    }
});

// ── Side nav ──
const sideNav     = document.getElementById('side-nav');
const navToggleBtn = document.getElementById('nav-toggle');

function setNavCollapsed(collapsed) {
    sideNav.classList.toggle('collapsed', collapsed);
    navToggleBtn.innerHTML  = collapsed ? '&#8250;' : '&#8249;';
    navToggleBtn.title      = collapsed ? 'Expand navigation' : 'Collapse navigation';
    setCookie('ppt-nav-collapsed', collapsed ? '1' : '0');
}

navToggleBtn.addEventListener('click', () => {
    setNavCollapsed(!sideNav.classList.contains('collapsed'));
});

document.querySelectorAll('.nav-item, .mob-nav-item').forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();
        const target = document.getElementById(item.dataset.target);
        if (!target) return;
        const headerH = document.querySelector('header').offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
        window.scrollTo({ top, behavior: 'smooth' });
    });
});

// Scroll spy
const navSections = [...document.querySelectorAll('.nav-item, .mob-nav-item')]
    .map(item => ({ item, el: document.getElementById(item.dataset.target) }))
    .filter(x => x.el);

const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            document.querySelectorAll('.nav-item, .mob-nav-item').forEach(item => {
                item.classList.toggle('active', item.dataset.target === id);
            });
        }
    });
}, { rootMargin: '-15% 0px -75% 0px', threshold: 0 });

navSections.forEach(({ el }) => navObserver.observe(el));

// ── Share ──
document.getElementById('share-btn').addEventListener('click', async () => {
    const shareData = {
        title: 'Party Planner Trek',
        text: 'Plan your next event with Party Planner Trek — a free app for teens & young adults!',
        url: 'https://party-planner-trek.vercel.app'
    };
    const btn = document.getElementById('share-btn');
    if (navigator.share) {
        try { await navigator.share(shareData); } catch (_) {}
    } else {
        await navigator.clipboard.writeText(shareData.url);
        btn.textContent = 'Link copied!';
        setTimeout(() => { btn.textContent = 'Share this app'; }, 2000);
    }
});

// ── Init ──
load();
loadCalEvents();
renderChecklist();
renderGuests();
renderBudget();
renderCalendar();
renderDashboard();
renderSpendingChart();
updateCountdown();
setInterval(updateCountdown, 1000);

