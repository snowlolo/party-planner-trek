// ── Music ──
const MUSIC = {
    birthday:   { id: 'ZbZSe6N_BXs', title: 'Birthday Party Mix' },
    wedding:    { id: 'GRxofEmo3HA', title: 'Canon in D — Wedding Music' },
    graduation: { id: 'Sj_9CiNkkn4', title: 'Pomp and Circumstance' },
    halloween:  { id: 'HqylqMF4SRo', title: 'Halloween Music Mix' },
    holiday:    { id: 'aAkMkVFwAoo', title: 'Christmas Music Mix' },
    custom:     { id: 'jfKfPfyJRdk', title: 'Chill Party Beats' },
};

let ytPlayer;

window.onYouTubeIframeAPIReady = function () {
    ytPlayer = new YT.Player('yt-player', {
        height: '140',
        width: '250',
        videoId: MUSIC['birthday'].id,
        playerVars: { autoplay: 0, controls: 1, rel: 0 },
        events: {
            onReady: function (e) {
                e.target.setVolume(50);
                document.getElementById('music-title').textContent = MUSIC['birthday'].title;
            }
        }
    });
};

function loadMusic(type) {
    if (ytPlayer && ytPlayer.loadVideoById) {
        ytPlayer.loadVideoById(MUSIC[type].id);
        ytPlayer.pauseVideo();
    }
    document.getElementById('music-title').textContent = MUSIC[type].title;
}

document.getElementById('volume-slider').addEventListener('input', function () {
    if (ytPlayer && ytPlayer.setVolume) ytPlayer.setVolume(parseInt(this.value));
    document.getElementById('volume-display').textContent = this.value + '%';
});

// ── Theme toggle ──
const themeBtn = document.getElementById('theme-toggle');
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light');
    themeBtn.textContent = document.body.classList.contains('light') ? 'Dark Mode' : 'Light Mode';
});

// ── Party type checklists ──
const DEFAULT_CHECKLISTS = {
    birthday: ['Book a venue', 'Send invitations', 'Order cake', 'Buy decorations', 'Plan activities', 'Arrange food & drinks'],
    wedding:  ['Choose a venue', 'Set a date', 'Send invitations', 'Book catering', 'Arrange flowers', 'Plan music/DJ', 'Organize transport'],
    graduation: ['Book a venue', 'Send invitations', 'Order graduation cake', 'Arrange catering', 'Plan slideshow/photos', 'Buy decorations'],
    halloween: ['Choose a theme', 'Buy costumes', 'Decorate venue', 'Plan candy/treats', 'Set up spooky lighting', 'Create playlist'],
    holiday:  ['Decorate venue', 'Send invitations', 'Plan menu', 'Buy gifts/prizes', 'Arrange music', 'Prepare activities'],
    custom:   [],
};

let currentType = 'birthday';
let checklist = [];
let guests = [];
let expenses = [];
let budgetTotal = 0;

// ── Party type buttons ──
document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentType = btn.dataset.type;
        checklist = DEFAULT_CHECKLISTS[currentType].map(t => ({ text: t, done: false }));
        renderChecklist();
        loadMusic(currentType);
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
        });
        li.querySelector('.del-btn').addEventListener('click', () => {
            checklist.splice(i, 1);
            renderChecklist();
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
}

// ── Budget ──
document.getElementById('budget-total').addEventListener('input', e => {
    budgetTotal = parseFloat(e.target.value) || 0;
    renderBudget();
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
}

// ── Init ──
checklist = DEFAULT_CHECKLISTS[currentType].map(t => ({ text: t, done: false }));
renderChecklist();
renderGuests();
renderBudget();
