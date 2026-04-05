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

// ── Drag to reorder ──
Sortable.create(document.getElementById('planner-grid'), {
    handle: '.drag-handle',
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    onEnd: () => {
        const order = [...document.querySelectorAll('#planner-grid section')].map(s => s.id);
        setCookie('ppt-order', JSON.stringify(order));
    }
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

    // Grid order
    const savedOrder = JSON.parse(getCookie('ppt-order') || 'null');
    if (savedOrder) {
        const grid = document.getElementById('planner-grid');
        savedOrder.forEach(id => {
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

// ── Init ──
load();
renderChecklist();
renderGuests();
renderBudget();
