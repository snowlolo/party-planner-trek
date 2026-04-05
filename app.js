// ── Music ──
const MUSIC = {
    birthday:   { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', title: 'Birthday Party Mix' },
    wedding:    { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', title: 'Wedding Ambience' },
    graduation: { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', title: 'Graduation Celebration' },
    halloween:  { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', title: 'Halloween Spooky Mix' },
    holiday:    { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', title: 'Holiday Music' },
    custom:     { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', title: 'Party Beats' },
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

// ── Theme toggle ──
const themeBtn = document.getElementById('theme-toggle');
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    themeBtn.textContent = isLight ? 'Dark Mode' : 'Light Mode';
    setCookie('ppt-theme', isLight ? 'light' : 'dark');
});

// ── Drag to reorder (connected grid ↔ sidebar) ──
const sectionGroup = { name: 'sections', pull: true, put: true };

function saveSectionLayout() {
    const main    = [...document.querySelectorAll('#planner-grid section')].map(s => s.id);
    const sidebar = [...document.querySelectorAll('#sidebar-sections section')].map(s => s.id);
    setCookie('ppt-main-sections',    JSON.stringify(main));
    setCookie('ppt-sidebar-sections', JSON.stringify(sidebar));
}

Sortable.create(document.getElementById('planner-grid'), {
    group: sectionGroup,
    handle: '.drag-handle',
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    onEnd: saveSectionLayout,
});

Sortable.create(document.getElementById('sidebar-sections'), {
    group: sectionGroup,
    handle: '.drag-handle',
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    onEnd: saveSectionLayout,
});

// ── Party type checklists ──
const DEFAULT_CHECKLISTS = {
    birthday:   ['Book a venue', 'Send invitations', 'Order cake', 'Buy decorations', 'Plan activities', 'Arrange food & drinks'],
    wedding:    ['Choose a venue', 'Set a date', 'Send invitations', 'Book catering', 'Arrange flowers', 'Plan music/DJ', 'Organize transport'],
    graduation: ['Book a venue', 'Send invitations', 'Order graduation cake', 'Arrange catering', 'Plan slideshow/photos', 'Buy decorations'],
    halloween:  ['Choose a theme', 'Buy costumes', 'Decorate venue', 'Plan candy/treats', 'Set up spooky lighting', 'Create playlist'],
    holiday:    ['Decorate venue', 'Send invitations', 'Plan menu', 'Buy gifts/prizes', 'Arrange music', 'Prepare activities'],
    custom:     [],
};

let currentType = 'birthday';
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
function save() {
    setCookie('ppt-type',      currentType);
    setCookie('ppt-checklist', JSON.stringify(checklist));
    setCookie('ppt-guests',    JSON.stringify(guests));
    setCookie('ppt-expenses',  JSON.stringify(expenses));
    setCookie('ppt-budget',    budgetTotal);
    setCookie('ppt-notes',     document.getElementById('notes-input').value);
    setCookie('ppt-volume',    document.getElementById('volume-slider').value);
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
    document.querySelectorAll('.type-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.type === currentType);
    });

    // Checklist
    checklist = JSON.parse(getCookie('ppt-checklist') || 'null')
        || DEFAULT_CHECKLISTS[currentType].map(t => ({ text: t, done: false }));

    // Guests
    guests = JSON.parse(getCookie('ppt-guests') || '[]');

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

    // Section layout (main grid + sidebar)
    const mainSections    = JSON.parse(getCookie('ppt-main-sections')    || 'null');
    const sidebarSections = JSON.parse(getCookie('ppt-sidebar-sections') || '[]');
    const grid    = document.getElementById('planner-grid');
    const sideBar = document.getElementById('sidebar-sections');

    sidebarSections.forEach(id => {
        const el = document.getElementById(id);
        if (el) sideBar.appendChild(el);
    });
    if (mainSections) {
        mainSections.forEach(id => {
            const el = document.getElementById(id);
            if (el) grid.appendChild(el);
        });
    }
}

// ── Party type buttons ──
document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentType = btn.dataset.type;
        checklist = DEFAULT_CHECKLISTS[currentType].map(t => ({ text: t, done: false }));
        renderChecklist();
        loadMusic(currentType);
        save();
        renderDashboard();
    });
});

// ── Checklist ──
function renderChecklist() {
    const ul = document.getElementById('checklist');
    ul.innerHTML = '';
    checklist.forEach((item, i) => {
        const li = document.createElement('li');
        if (item.done) li.classList.add('done');
        li.innerHTML = `
            <input type="checkbox" ${item.done ? 'checked' : ''}>
            <span>${item.text}</span>
            <button class="del-btn" title="Remove">✕</button>
        `;
        li.querySelector('input').addEventListener('change', () => {
            checklist[i].done = !checklist[i].done;
            renderChecklist();
            save();
        });
        li.querySelector('.del-btn').addEventListener('click', () => {
            checklist.splice(i, 1);
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
    guests.forEach((name, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${name}</span><button class="remove-btn" title="Remove">✕</button>`;
        li.querySelector('.remove-btn').addEventListener('click', () => {
            guests.splice(i, 1);
            renderGuests();
            save();
        });
        ul.appendChild(li);
    });
    document.getElementById('guest-count').textContent = guests.length;
}

document.getElementById('guest-btn').addEventListener('click', addGuest);
document.getElementById('guest-input').addEventListener('keydown', e => { if (e.key === 'Enter') addGuest(); });

function addGuest() {
    const input = document.getElementById('guest-input');
    const name = input.value.trim();
    if (!name) return;
    guests.push(name);
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
        li.innerHTML = `
            <span>${exp.name}</span>
            ${exp.phone ? `<span class="phone">${exp.phone}</span>` : ''}
            <span class="cost">$${exp.cost.toFixed(2)}</span>
            <button class="remove-btn" title="Remove">✕</button>
        `;
        li.querySelector('.remove-btn').addEventListener('click', () => {
            expenses.splice(i, 1);
            renderBudget();
            save();
        });
        ul.appendChild(li);
    });
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

    const done  = checklist.filter(t => t.done).length;
    const total = checklist.length;
    document.getElementById('dash-tasks').textContent = `${done} / ${total}`;

    const today = new Date().toISOString().slice(0, 10);
    const next  = calEvents.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
    document.getElementById('dash-next').textContent = next
        ? `${next.name} (${next.date.slice(5).replace('-', '/')})`
        : 'None';

    document.getElementById('dash-type').textContent =
        currentType.charAt(0).toUpperCase() + currentType.slice(1);
}

// ── Calendar ──
const TYPE_COLORS = {
    birthday: '#f472b6', wedding: '#a78bfa', graduation: '#60a5fa',
    halloween: '#fb923c', holiday: '#4ade80', custom: '#94a3b8',
};
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

let calEvents = [];
let calDate   = new Date();
let calSelectedDate = '';

function saveCalEvents() { setCookie('ppt-cal', JSON.stringify(calEvents)); renderDashboard(); }
function loadCalEvents() { calEvents = JSON.parse(getCookie('ppt-cal') || '[]'); }

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

// ── Init ──
load();
loadCalEvents();
renderChecklist();
renderGuests();
renderBudget();
renderCalendar();
renderDashboard();
