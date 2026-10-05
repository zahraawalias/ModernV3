/* ====== LOGO LOADING: tunggu semua gambar & font siap ====== */
(function () {
    const urls = new Set();
    document.querySelectorAll('img[src]').forEach(i => urls.add(i.currentSrc || i.src));
    const re = /url\(["']?([^"')]+)["']?\)/g; let m;
    const bg = getComputedStyle(document.getElementById('app')).backgroundImage || '';
    while ((m = re.exec(bg))) urls.add(m[1]);
    const imgs = [...urls].map(src => new Promise(res => { const im = new Image(); im.onload = im.onerror = res; im.src = src; }));
    const fonts = ['400 1em "Cormorant Garamond"', '600 1em "Cormorant Garamond"', '600 1em "Playfair Display"', '400 1em "Homemade Apple"', '600 1em "Caveat"', '400 1em "Jost"', '500 1em "Jost"', '400 1em "Amiri"', '400 1em "Courier Prime"']
        .map(f => document.fonts && document.fonts.load ? document.fonts.load(f, 'A\u0628').catch(() => { }) : null);
    const t0 = Date.now();
    Promise.race([Promise.all(imgs.concat(fonts)), new Promise(r => setTimeout(r, 20000))]).then(() => {
        setTimeout(() => { window.scrollTo(0, 0); document.body.classList.add('loaded'); }, Math.max(0, 500 - (Date.now() - t0)));
    });
})();

/* ====== KONFIGURASI ====== */
const CFG = {
    target: '2026-12-14T18:30:00+07:00',
    sheetUrl: '' // <- tempel URL Web App Google Apps Script (berakhiran /exec). Kosong = mode demo (localStorage)
};
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pad = n => String(n).padStart(2, '0');
const css = (el, o) => Object.assign(el.style, o);
const mk = (tag, o = {}, props = {}) => { const el = document.createElement(tag); Object.assign(el, props); css(el, o); return el; };

/* nama tamu dari ?to=Nama */
const to = new URLSearchParams(location.search).get('to');
if (to) $('#guest').textContent = to;

/* ====== GALERI: ubah 4 foto jadi SLIDER (dibangun dari JS, HTML tidak perlu diubah) ====== */
let track, slides = [], dotsBox;
(function buildSlider() {
    const old = $$('#acara .g'); if (!old.length) return;
    const wrap = mk('div', {
        position: 'absolute', left: '13.611%', top: '60.573%', width: '72.87%', height: '35.5%', zIndex: 3, overflow: 'hidden',
        borderRadius: '2.2cqw', boxShadow: '0 .8cqw 3cqw rgba(0,0,0,.45)', outline: '.5cqw solid rgba(255,255,255,.85)', outlineOffset: '-.5cqw', background: '#0e1a30'
    }, { className: 'gslider rv' });
    wrap.dataset.a = 'pop';
    track = mk('div', { display: 'flex', height: '100%', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollBehavior: 'smooth', scrollbarWidth: 'none', overscrollBehaviorX: 'contain' });
    old.forEach(b => {
        const img = $('img', b);
        css(img, { width: '100%', height: '100%', objectFit: 'cover', display: 'block', maxWidth: 'none' });
        const s = mk('button', { flex: '0 0 100%', height: '100%', scrollSnapAlign: 'center', overflow: 'hidden', cursor: 'zoom-in', padding: 0, border: 0, background: 'none', position: 'relative' }, { type: 'button' });
        s.setAttribute('aria-label', 'Perbesar foto'); s.appendChild(img); track.appendChild(s); slides.push(s); b.remove();
    });
    const glass = { position: 'absolute', background: 'rgba(14,26,48,.6)', color: '#fff', font: '500 2.1cqw Jost,sans-serif', padding: '.6cqw 1.8cqw', borderRadius: '3cqw', zIndex: 2 };
    const arrow = (txt, side, label) => mk('button', {
        position: 'absolute', top: '50%', [side]: '1.4cqw', transform: 'translateY(-50%)', width: '6.4cqw', height: '6.4cqw', borderRadius: '50%',
        background: 'rgba(14,26,48,.55)', color: '#fff', fontSize: '5cqw', lineHeight: 1, display: 'grid', placeItems: 'center', zIndex: 2, border: 0, cursor: 'pointer', padding: 0
    }, { type: 'button', textContent: txt, ariaLabel: label });
    const prev = arrow('‹', 'left', 'Sebelumnya'), next = arrow('›', 'right', 'Berikutnya');
    prev.id = 'gPrev'; next.id = 'gNext';
    const hint = mk('span', { ...glass, left: '1.6cqw', top: '1.6cqw', pointerEvents: 'none' });
    const cnt = mk('span', { ...glass, right: '1.6cqw', top: '1.6cqw' }, { id: 'gCnt' });
    dotsBox = mk('div', { position: 'absolute', left: 0, right: 0, bottom: '7cqw', display: 'flex', justifyContent: 'center', gap: '1.1cqw', zIndex: 2 });
    wrap.append(track, prev, next, hint, cnt, dotsBox);
    const hy = $('#acara .hortensia');
    if (hy) { hy.style.pointerEvents = 'none'; sec_insert(wrap, hy); } else $('#acara').appendChild(wrap);
    function sec_insert(n, ref) { ref.parentNode.insertBefore(n, ref); }
})();

/* buka undangan + musik */
const bgm = $('#bgm');
$('#openBtn').onclick = () => {
    document.body.classList.remove('locked');
    bgm.play().catch(() => { });
    $('#home').scrollIntoView({ behavior: 'smooth' });
};
window.scrollTo(0, 0);

/* animasi terbit saat di-scroll (ulang tiap masuk layar) */
const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('in', e.isIntersecting)), { threshold: .15 });
$$('.rv').forEach(el => io.observe(el));

/* navbar aktif sesuai posisi */
const links = $$('#nav a');
links.forEach(a => {
    const sec = $(a.getAttribute('href'));
    new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) links.forEach(x => x.classList.toggle('on', x === a));
    }), { rootMargin: '-45% 0px -50% 0px' }).observe(sec);
});

/* countdown */
function tick() {
    const d = Math.max(0, new Date(CFG.target) - Date.now()) / 1000;
    $('#cdD').textContent = pad(Math.floor(d / 86400));
    $('#cdH').textContent = pad(Math.floor(d % 86400 / 3600));
    $('#cdM').textContent = pad(Math.floor(d % 3600 / 60));
    $('#cdS').textContent = pad(Math.floor(d % 60));
}
tick(); setInterval(tick, 1000);

/* toast */
let tt;
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), 2200); }


// Gift: expand / collapse
const moreGift = document.getElementById('moreGift');
const giftExtra = document.getElementById('giftExtra');

moreGift.addEventListener('click', () => {
    const open = giftExtra.classList.toggle('open');
    moreGift.textContent = open ? 'Sembunyikan' : 'Lihat Lebih Banyak';
    moreGift.setAttribute('aria-expanded', open);
    if (open) setTimeout(() => giftExtra.scrollIntoView({ behavior: 'smooth', block: 'center' }), 350);
});

$$('.copy').forEach(b => b.onclick = () => {
    navigator.clipboard?.writeText(b.dataset.t).then(() => toast('Berhasil disalin ✓'), () => toast('Gagal menyalin'));
});

/* ====== GALERI: kontrol slider + lightbox (zoom, flip, swipe) ====== */
const imgs = slides.map(s => $('img', s).src);
let page = 0, rest = 0;
const mark = () => { $$('i', dotsBox).forEach((d, k) => css(d, { width: k === page ? '4.4cqw' : '1.4cqw', background: k === page ? '#fff' : 'rgba(255,255,255,.55)' })); $('#gCnt').textContent = `${page + 1} / ${slides.length}`; };
function goTo(i) { page = (i + slides.length) % slides.length; track.scrollTo({ left: page * track.clientWidth, behavior: 'smooth' }); mark(); }
slides.forEach((_, i) => dotsBox.appendChild(mk('i', { height: '1.4cqw', borderRadius: '2cqw', transition: '.35s', cursor: 'pointer', display: 'block' }, { onclick: () => { rest = 8; goTo(i); } })));
let sc;
track.addEventListener('scroll', () => { clearTimeout(sc); sc = setTimeout(() => { page = Math.round(track.scrollLeft / track.clientWidth); mark(); }, 60); });
$('#gPrev').onclick = () => { rest = 8; goTo(page - 1); };
$('#gNext').onclick = () => { rest = 8; goTo(page + 1); };
['pointerdown', 'wheel'].forEach(ev => track.addEventListener(ev, () => rest = 8, { passive: true }));
mark();
let inView = false;
new IntersectionObserver(e => inView = e[0].isIntersecting, { threshold: .4 }).observe(track.parentNode);
setInterval(() => { if (rest > 0) rest--; else if (inView && $('#lb').hidden) goTo(page + 1); }, 4000);

const box = $('#lbs'), lbc = mk('div', { position: 'absolute', bottom: '22px', left: 0, right: 0, textAlign: 'center', font: '15px Jost,sans-serif', color: '#cfd8e8', zIndex: 2 });
$('#lb').appendChild(lbc);
let cur = 0;
function show(n, dir = 1) {
    const old = $('img', box);
    const im = new Image(); im.src = imgs[n];
    im.style.opacity = 0; im.style.transform = `rotateY(${dir * 90}deg)`;
    im.onclick = () => im.classList.toggle('zoom');
    box.appendChild(im);
    requestAnimationFrame(() => requestAnimationFrame(() => { im.style.opacity = 1; im.style.transform = 'rotateY(0)'; }));
    if (old) { old.style.opacity = 0; old.style.transform = `rotateY(${-dir * 90}deg)`; setTimeout(() => old.remove(), 700); }
    cur = n; lbc.textContent = `${n + 1} / ${imgs.length}  ·  ketuk foto untuk zoom`;
}
const go = d => show((cur + d + imgs.length) % imgs.length, d);
slides.forEach((s, i) => s.onclick = () => { $('#lb').hidden = false; box.innerHTML = ''; show(i); });
$('#lbn').onclick = () => go(1); $('#lbp').onclick = () => go(-1);
$('#lbx').onclick = () => { $('#lb').hidden = true; goTo(cur); };
let sx = 0;
box.addEventListener('touchstart', e => sx = e.touches[0].clientX);
box.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); });
document.addEventListener('keydown', e => { if ($('#lb').hidden) return; if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); if (e.key === 'Escape') $('#lbx').click(); });

/* ====== WISHES: dibaca dari Google Sheet ====== */
const LOCAL = 'wishes-raka-kaina';
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const badge = a => a === 'Masih Ragu' ? 'background:#f6e6bf;color:#7a5a12' : a === 'Tidak Hadir' ? 'background:#f3d3d0;color:#8a2c25' : '';
const card = w => `<div class="w"><div><b>${esc(w.n)}</b><em style="${badge(w.a)}">${esc(w.a)}</em></div><i>${esc(w.m)}</i></div>`;
const wishBox = $('#wishes');
let wishes = [];
const render = () => wishBox.innerHTML = wishes.length ? wishes.map(card).join('')
    : '<div class="w" style="text-align:center;font-style:italic;color:#6b7fa3">Jadilah yang pertama mengirim ucapan 🤍</div>';
async function loadWishes() {
    wishBox.innerHTML = '<div class="w" style="opacity:.5">&nbsp;</div>'.repeat(3);
    if (!CFG.sheetUrl) { wishes = JSON.parse(localStorage.getItem(LOCAL) || '[]'); return render(); }
    try { wishes = (await (await fetch(CFG.sheetUrl + '?t=' + Date.now())).json()).wishes || []; }
    catch (e) { wishes = []; toast('Ucapan belum bisa dimuat'); }
    render();
}
loadWishes();

/* ====== RSVP: interaktif + kirim ke Google Sheet ====== */
const nameEl = $('#rName'), attEl = $('#rAtt'), gcEl = $('#rGc'), msgEl = $('#rMsg'), sendBtn = $('#send'), okBtn = $('#ok');
nameEl.maxLength = 60; msgEl.maxLength = 300;
const bad = el => { el.classList.remove('err'); void el.offsetWidth; el.classList.add('err'); el.focus(); };
// tamu "Tidak Hadir" tidak perlu isi jumlah tamu
/* --- Tombol Hadir / Tidak Hadir --- */
const rsvpBtns = $$('.rsvp-btns button');
const setAtt = (val) => {
    attEl.value = val;
    rsvpBtns.forEach(b => {
        const aktif = b.dataset.val === val;
        b.style.background = aktif ? '#1a3050' : '#2a4a7a';
        b.style.color = '#fff';
    });
    const off = val === 'Tidak Hadir';
    gcEl.disabled = off;
    gcEl.style.opacity = off ? .4 : 1;
    gcEl.style.pointerEvents = off ? 'none' : 'auto';  // <-- tambah ini
    if (off) gcEl.value = '';                            // reset kalau tidak hadir
    // kalau pindah dari "Tidak Hadir" ke "Hadir", biarkan user pilih ulang
};
rsvpBtns.forEach(btn => {
    btn.addEventListener('click', () => setAtt(btn.dataset.val));
});

// bagian ucapan (sheet): penghitung huruf, ucapan cepat, honeypot anti-bot
const cnt = mk('small', { display: 'block', textAlign: 'right', margin: '4px 2px 0', color: '#8a7f78' }, { textContent: '0/300' });
msgEl.after(cnt);
msgEl.addEventListener('input', () => cnt.textContent = msgEl.value.length + '/300');
const quick = mk('div', { display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '10px 0 0' });
['Barakallah 🤍', 'Selamat menempuh hidup baru!', 'Semoga sakinah, mawaddah, warahmah 🌸'].forEach(t =>
    quick.appendChild(mk('button', { border: '1px solid #3a5a94', borderRadius: '20px', padding: '6px 12px', fontSize: '13px', background: '#fffdf8', cursor: 'pointer' },
        { type: 'button', textContent: t, onclick: () => { msgEl.value = t; msgEl.dispatchEvent(new Event('input')); msgEl.focus(); } })));
cnt.after(quick);
const hp = mk('input', { position: 'absolute', left: '-9999px', opacity: 0 }, { type: 'text', tabIndex: -1, autocomplete: 'off' });
hp.setAttribute('aria-hidden', 'true'); msgEl.after(hp);

function hearts(from) {
    const r = from.getBoundingClientRect();
    for (let i = 0; i < 16; i++) {
        const h = document.createElement('span'); h.className = 'hrt'; h.textContent = ['🤍', '💙', '🌸'][i % 3];
        h.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top}px;--x:${(Math.random() - .5) * 240}px;--r:${(Math.random() - .5) * 90}deg`;
        document.body.appendChild(h); setTimeout(() => h.remove(), 1700);
    }
}
// langkah 1: validasi form
sendBtn.onclick = () => {
    if (!nameEl.value.trim()) { toast('Isi nama Anda dulu ya'); return bad(nameEl); }
    if (!attEl.value) { toast('Pilih konfirmasi kehadiran'); return bad(attEl); }
    if (!gcEl.disabled && !gcEl.value) { toast('Pilih jumlah tamu'); return bad(gcEl); }
    $('#sheet').hidden = false; msgEl.focus();
};
$('#cancel').onclick = () => $('#sheet').hidden = true;
// langkah 2: kirim ke Google Sheet
okBtn.onclick = async () => {
    const data = { nama: nameEl.value.trim(), hadir: attEl.value, jumlah: attEl.value === 'Tidak Hadir' ? 0 : +gcEl.value, ucapan: msgEl.value.trim(), website: hp.value };
    okBtn.disabled = true; okBtn.textContent = 'Mengirim…';
    try {
        if (CFG.sheetUrl) {
            const r = await fetch(CFG.sheetUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) });
            const j = await r.json(); if (!j.ok) throw new Error(j.error);
        }
        if (data.ucapan) {
            wishes.unshift({ n: data.nama, a: data.hadir, m: data.ucapan });
            if (!CFG.sheetUrl) localStorage.setItem(LOCAL, JSON.stringify(wishes.slice(0, 50)));
            render(); wishBox.scrollTo({ top: 0, behavior: 'smooth' });
        }
        $('#sheet').hidden = true; hearts(sendBtn); toast('Terima kasih, konfirmasi Anda sudah kami terima 🤍');
        nameEl.value = msgEl.value = ''; attEl.value = gcEl.value = ''; gcEl.disabled = false; gcEl.style.opacity = 1; cnt.textContent = '0/300';
        $('#wishes').scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) { toast('Gagal mengirim, periksa koneksi lalu coba lagi'); }
    okBtn.disabled = false; okBtn.textContent = 'Kirim Ucapan';
};

/* kalender Oktober 2026 (1 Okt = Kamis) */
(function () {
    let h = ['27', '28', '29', '30'].map(d => `<span class="o">${d}</span>`).join('');
    for (let d = 1; d <= 31; d++) h += `<span${d === 24 ? ' class="h"' : ''}>${d}</span>`;
    $('#oct').innerHTML = h;
})();

/* mini player */
const fmt = s => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;
bgm.ontimeupdate = () => {
    if (!bgm.duration) return;
    $('#pb').style.width = bgm.currentTime / bgm.duration * 100 + '%';
    $('#tc').textContent = fmt(bgm.currentTime); $('#tr').textContent = '-' + fmt(bgm.duration - bgm.currentTime);
};
$('#pp').onclick = () => { bgm.paused ? bgm.play() : bgm.pause(); };
bgm.onplay = () => $('#pp').textContent = '⏸'; bgm.onpause = () => $('#pp').textContent = '▶';
$('#prv').onclick = () => bgm.currentTime = Math.max(0, bgm.currentTime - 10);
$('#nxt').onclick = () => bgm.currentTime += 10;