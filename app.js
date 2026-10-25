'use strict';

const uiGames = {
  pubg: ['🪖','ENG MASHHUR','from-amber-500/20 to-orange-500/5'],
  freefire: ['🔥','TEZKOR','from-orange-500/20 to-rose-500/5'],
  ml: ['⚔️','TOP TANLOV','from-cyan-500/20 to-blue-500/5'],
  roblox: ['🧱','YANGI','from-red-500/20 to-pink-500/5'],
  genshin: ['✨','FANTASY','from-violet-500/20 to-indigo-500/5']
};
const state = { user: null, games: [], game: null, packIndex: -1, playerId: '', method: '', health: null };
const $ = (selector, root=document) => root.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const money = value => `${new Intl.NumberFormat('uz-UZ').format(Number(value)||0)} so‘m`;

async function api(path, options={}) {
  const headers = {'Content-Type':'application/json', ...(options.headers||{})};
  const response = await fetch(path, {...options, headers, credentials:'same-origin'});
  let data={}; try { data=await response.json(); } catch {}
  if (!response.ok) throw new Error(data.error || `Server xatosi (${response.status})`);
  return data;
}
function toast(message) {
  const el=$('#toast'); el.textContent=message; el.classList.remove('opacity-0','translate-y-4');
  clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.add('opacity-0','translate-y-4'),3000);
}
function modalHead(title, subtitle='') {
  return `<div class="flex items-start justify-between border-b border-white/[.08] px-5 py-4 sm:px-6"><div><h2 class="text-xl font-bold">${esc(title)}</h2>${subtitle?`<p class="mt-1 text-xs text-slate-400">${esc(subtitle)}</p>`:''}</div><button type="button" data-action="close" aria-label="Yopish" class="rounded-lg px-2 text-2xl leading-none text-slate-500 hover:text-white">×</button></div>`;
}
function showModal(content) {
  const root=$('#modalRoot');
  root.innerHTML=`<div class="modal-shell fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6" role="presentation"><section role="dialog" aria-modal="true" class="modal-panel scrollbar max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#11141e] shadow-2xl">${content}</section></div>`;
  requestAnimationFrame(()=>root.firstElementChild.classList.add('open'));
  root.firstElementChild.addEventListener('click',event=>{if(event.target===root.firstElementChild)closeModal()});
  $('[data-action="close"]',root)?.focus();
}
function closeModal() {
  const root=$('#modalRoot');
  if(root.firstElementChild){root.firstElementChild.classList.remove('open');setTimeout(()=>{if(root.firstElementChild&&!root.firstElementChild.classList.contains('open'))root.innerHTML=''},200)}
}
function renderGames() {
  const grid=$('#gameGrid');
  grid.innerHTML=state.games.map(game=>{
    const [emoji,tag,color]=uiGames[game.id]||['🎮','GAME','from-slate-500/20 to-slate-500/5'];
    return `<article class="game-card glass overflow-hidden rounded-2xl"><div class="relative flex h-36 items-center justify-center bg-gradient-to-br ${color}"><span class="absolute left-4 top-4 rounded-md border border-white/10 bg-black/20 px-2 py-1 text-[9px] font-bold tracking-[.12em] text-slate-300">${esc(tag)}</span><span class="text-6xl">${emoji}</span><span class="absolute bottom-3 right-4 text-xs text-white/30">LEVELUP</span></div><div class="p-5"><div class="flex items-start justify-between gap-2"><div><h3 class="text-lg font-bold">${esc(game.name)}</h3><p class="mt-1 text-xs text-slate-500">${esc(game.unit)} top-up</p></div><span class="rounded-lg bg-white/[.05] px-2 py-1 text-xs text-slate-400">⚡ Tezkor</span></div><button data-game="${esc(game.id)}" class="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white/[.06] py-3 text-sm font-bold transition hover:bg-[#c8ff3d] hover:text-[#10130a]">Donat qilish <span>↗</span></button></div></article>`;
  }).join('');
}
function openPricing(gameId) {
  state.game=state.games.find(game=>game.id===gameId); state.packIndex=-1;
  if(!state.game)return toast('O‘yin topilmadi');
  showModal(`${modalHead(`${state.game.name} donati`,`Valyuta paketini tanlang · ${state.game.unit}`)}<form id="pricingForm" class="p-5 sm:p-6"><label for="playerId" class="mb-2 block text-xs font-semibold text-slate-400">O‘YINCHI ID</label><input id="playerId" required maxlength="100" class="w-full rounded-xl border border-white/10 bg-[#0b0e16] px-4 py-3 text-sm" placeholder="ID raqamingizni kiriting"><div class="mb-3 mt-6 flex items-center justify-between"><p class="text-sm font-bold">Paketlar</p><p class="text-xs text-slate-500">Narxlar so‘mda</p></div><div class="grid grid-cols-2 gap-3">${state.game.packages.map((pack,index)=>`<button type="button" data-package="${index}" class="rounded-xl border border-white/10 bg-white/[.025] p-4 text-left transition hover:border-[#c8ff3d]/50"><span class="block text-lg font-bold">${Number(pack[0])} <small class="text-xs font-medium text-slate-400">${esc(state.game.unit)}</small></span><span class="mt-2 block text-sm text-[#c8ff3d]">${money(pack[1])}</span></button>`).join('')}</div><button id="continuePayment" class="mt-5 w-full rounded-xl bg-[#c8ff3d] py-3.5 text-sm font-bold text-[#10130a] opacity-50" disabled>Davom etish →</button><p class="mt-3 text-center text-[11px] text-slate-500">To‘lov faqat provayder tasdiqlagandan so‘ng amalga oshadi.</p></form>`);
  $('#playerId').focus();
}
function openLogin(register=false, resumePayment=false) {
  const title=register?'Hisob yaratish':'Xush kelibsiz';
  showModal(`${modalHead(title,register?'Hisobingiz bazada himoyalangan holda saqlanadi':'Hisobingizga kiring')}<form id="authForm" data-register="${register}" data-resume="${resumePayment}" class="space-y-4 p-5 sm:p-6"><div class="grid grid-cols-2 gap-2 rounded-xl bg-white/[.04] p-1"><button type="button" data-action="login-tab" class="rounded-lg ${register?'':'bg-white/10'} py-2 text-sm ${register?'text-slate-400':'font-semibold'}">Kirish</button><button type="button" data-action="register-tab" class="rounded-lg ${register?'bg-white/10':''} py-2 text-sm ${register?'font-semibold':'text-slate-400'}">Ro‘yxatdan o‘tish</button></div>${register?'<div><label for="authName" class="mb-2 block text-xs text-slate-400">Ismingiz</label><input id="authName" required maxlength="80" class="w-full rounded-xl border border-white/10 bg-[#0b0e16] px-4 py-3 text-sm" placeholder="Ism"></div>':''}<div><label for="authEmail" class="mb-2 block text-xs text-slate-400">Email yoki telefon</label><input id="authEmail" required maxlength="254" autocomplete="username" class="w-full rounded-xl border border-white/10 bg-[#0b0e16] px-4 py-3 text-sm" placeholder="name@example.com yoki +998..."></div><div><label for="authPassword" class="mb-2 block text-xs text-slate-400">Parol</label><input id="authPassword" required type="password" minlength="10" maxlength="128" autocomplete="${register?'new-password':'current-password'}" class="w-full rounded-xl border border-white/10 bg-[#0b0e16] px-4 py-3 text-sm" placeholder="Kamida 10 ta belgi"></div><button class="w-full rounded-xl bg-[#c8ff3d] py-3 font-bold text-[#10130a]">${register?'Hisob yaratish':'Kirish'}</button></form>`);
}
async function openPayment() {
  let payments={payme:false,click:false,uzum:false,cardTokenization:false};
  try { const h=await api('/api/health'); payments=h.payments||payments; } catch {}
  const choices=[['payme','Payme','🟢',!!payments.payme],['click','Click','🔵',!!payments.click],['uzum','Uzum Bank','🟣',!!payments.uzum],['card','Plastik karta','💳',!!payments.cardTokenization]];
  state.method='';
  showModal(`${modalHead('To‘lov','Faqat sozlangan va faol usullar ishlaydi')}<div class="p-5 sm:p-6"><div class="rounded-2xl border border-white/10 bg-white/[.03] p-4"><div class="flex items-center justify-between text-sm"><span class="text-slate-400">${esc(state.game.name)} · ${state.game.packages[state.packIndex][0]} ${esc(state.game.unit)}</span><span class="font-bold">${money(state.game.packages[state.packIndex][1])}</span></div><p class="mt-2 break-all text-xs text-slate-500">O‘yinchi ID: ${esc(state.playerId)}</p></div><p class="mb-3 mt-6 text-sm font-bold">To‘lov usulini tanlang</p><div class="grid grid-cols-2 gap-3">${choices.map(([key,label,icon,enabled])=>`<button type="button" data-method="${key}" ${enabled?'':'disabled'} class="flex items-center gap-3 rounded-xl border border-white/10 p-4 text-left ${enabled?'hover:border-[#c8ff3d]/50':'cursor-not-allowed opacity-40'}"><span class="text-xl">${icon}</span><span><span class="block text-sm font-semibold">${label}</span><span class="block text-[10px] text-slate-500">${enabled?'Ulangan':'Hali ulanmagan'}</span></span></button>`).join('')}</div><button data-action="pay" class="mt-5 w-full rounded-xl bg-[#c8ff3d] py-3.5 font-bold text-[#10130a]">${money(state.game.packages[state.packIndex][1])} to‘lash</button><p class="mt-3 text-center text-[11px] text-slate-500">Donat faqat to‘lov tasdiqlangach yuboriladi.</p></div>`);
}
function openCard() {
  showModal(`${modalHead('Karta qo‘shish','Karta xavfsizligi')}<div class="space-y-4 p-5 sm:p-6"><div class="rounded-2xl border border-[#c8ff3d]/15 bg-[#c8ff3d]/[.05] p-4 text-sm leading-6 text-slate-300"><b class="text-white">Karta formasi hozircha o‘chiq.</b><br>Karta raqami va CVV saytga kiritilmaydi. Saqlash PCI tokenizatsiya provayderi ulangandan keyin faollashadi.</div><button data-action="close" class="w-full rounded-xl border border-white/10 py-3 text-sm font-semibold">Yopish</button></div>`);
}
async function openProfile() {
  if(!state.user)return openLogin();
  try {
    const data=await api('/api/profile'); state.user=data.user;
    const cards=data.cards||[],orders=data.transactions||[];
    showModal(`${modalHead('Shaxsiy kabinet',`Xush kelibsiz, ${data.user.name}`)}<div class="p-5 sm:p-6"><div class="grid grid-cols-2 gap-3"><div class="rounded-2xl border border-[#c8ff3d]/15 bg-[#c8ff3d]/[.06] p-4"><p class="text-xs text-slate-400">LEVELUP balansi</p><p class="mt-2 text-xl font-bold text-[#c8ff3d]">${money(data.balance||0)}</p></div><div class="rounded-2xl border border-white/10 bg-white/[.03] p-4"><p class="text-xs text-slate-400">Hisob</p><p class="mt-2 truncate text-sm font-semibold">${esc(data.user.email)}</p></div></div><div class="mt-6 flex items-center justify-between"><h3 class="font-bold">Saqlangan kartalar</h3><button data-action="add-card" class="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold">＋ Karta qo‘shish</button></div><div class="mt-3 space-y-2">${cards.length?cards.map(card=>`<div class="rounded-xl border border-white/[.08] p-3 text-sm">💳 ${esc(card.brand)} •••• ${esc(card.last4)}</div>`).join(''):'<p class="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-slate-500">Tokenizatsiya qilingan karta yo‘q</p>'}</div><div class="mt-6"><h3 class="font-bold">Buyurtmalar tarixi</h3><div class="mt-3 max-h-44 space-y-2 overflow-auto">${orders.length?orders.map(order=>`<div class="flex items-center justify-between gap-3 rounded-xl border border-white/[.08] p-3 text-xs"><span><b>${esc(order.game_name)}</b><span class="ml-2 text-slate-500">${Number(order.package_amount)} ${esc(order.package_unit)} · ${new Date(order.created_at).toLocaleDateString('uz-UZ')}</span><span class="mt-1 block text-slate-500">${esc(order.status)}</span></span><span class="shrink-0 text-[#c8ff3d]">${money(order.amount_uzs)}</span></div>`).join(''):'<p class="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-slate-500">Buyurtmalar hali mavjud emas</p>'}</div></div><button data-action="logout" class="mt-6 text-xs text-rose-300">Hisobdan chiqish</button></div>`);
  } catch(error) { if(error.message.includes('Kirish')){state.user=null;openLogin()}else toast(error.message) }
}
async function logout() {
  try { await api('/api/auth/logout',{method:'POST'}); } catch {}
  state.user=null;closeModal();toast('Hisobdan chiqdingiz');
}
async function submitAuth(form) {
  const isRegister=form.dataset.register==='true';
  const payload={email:$('#authEmail').value.trim(),password:$('#authPassword').value};
  if(isRegister){payload.name=$('#authName').value.trim();if(new TextEncoder().encode(payload.password).length>128)return toast('Parol 128 baytdan oshmasin')}
  try {
    const result=await api(isRegister?'/api/auth/register':'/api/auth/login',{method:'POST',body:JSON.stringify(payload)});
    state.user=result.user;closeModal();toast(isRegister?'Hisob yaratildi':'Hisobga kirdingiz');
    if(form.dataset.resume==='true')setTimeout(openPayment,220);
  } catch(error){toast(error.message)}
}
async function createOrder() {
  if(!state.method)return toast('Faol to‘lov usulini tanlang');
  try {
    const result=await api('/api/orders',{method:'POST',body:JSON.stringify({gameId:state.game.id,packageIndex:state.packIndex,playerId:state.playerId,provider:state.method})});
    const checkout=await api('/api/payments/checkout',{method:'POST',body:JSON.stringify({orderId:result.order.id})});
    window.location.assign(checkout.checkoutUrl);
  } catch(error){toast(error.message)}
}
function addChat(text,fromUser=false) {
  const box=$('#chatMessages'),bubble=document.createElement('div');
  bubble.className='chat-bubble max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-5 '+(fromUser?'ml-auto rounded-tr-sm bg-[#c8ff3d] text-[#10130a]':'rounded-tl-sm bg-white/[.07] text-slate-200');
  bubble.textContent=text;box.appendChild(bubble);box.scrollTop=box.scrollHeight;
}
async function replyChat(message) {
  try { const result=await api('/api/ai-chat',{method:'POST',body:JSON.stringify({message})});addChat(result.reply); }
  catch { addChat('Yordam xizmati hozircha ulanmagan. Operator: @levelup_support'); }
}

$('#gameGrid').addEventListener('click',event=>{const button=event.target.closest('[data-game]');if(button)openPricing(button.dataset.game)});
$('#profileBtn').addEventListener('click',openProfile);
$('#loginBtn').addEventListener('click',()=>openLogin());
$('#modalRoot').addEventListener('click',event=>{
  const packageButton=event.target.closest('[data-package]');
  if(packageButton){state.packIndex=Number(packageButton.dataset.package);$('#modalRoot').querySelectorAll('[data-package]').forEach(button=>button.classList.remove('border-[#c8ff3d]','bg-[#c8ff3d]/[.06]'));packageButton.classList.add('border-[#c8ff3d]','bg-[#c8ff3d]/[.06]');$('#continuePayment').disabled=false;$('#continuePayment').classList.remove('opacity-50');return}
  const methodButton=event.target.closest('[data-method]');
  if(methodButton&&!methodButton.disabled){state.method=methodButton.dataset.method;$('#modalRoot').querySelectorAll('[data-method]').forEach(button=>button.classList.remove('border-[#c8ff3d]','bg-[#c8ff3d]/[.06]'));methodButton.classList.add('border-[#c8ff3d]','bg-[#c8ff3d]/[.06]');return}
  const action=event.target.closest('[data-action]')?.dataset.action;
  if(action==='close')closeModal();if(action==='login-tab')openLogin(false);if(action==='register-tab')openLogin(true);if(action==='add-card')openCard();if(action==='logout')logout();if(action==='pay')createOrder();
});
$('#modalRoot').addEventListener('submit',event=>{
  event.preventDefault();
  if(event.target.id==='pricingForm'){state.playerId=$('#playerId').value.trim();if(!state.playerId)return toast('O‘yinchi ID raqamini kiriting');if(state.packIndex<0)return toast('Avval paketni tanlang');if(!state.token)return openLogin(false,true);openPayment();}
  if(event.target.id==='authForm')submitAuth(event.target);
});
$('#chatToggle').addEventListener('click',()=>$('#chatWindow').classList.toggle('hidden'));
$('#chatClose').addEventListener('click',()=>$('#chatWindow').classList.add('hidden'));
$('#chatForm').addEventListener('submit',event=>{event.preventDefault();const input=$('#chatInput'),message=input.value.trim();if(!message)return;addChat(message,true);input.value='';replyChat(message)});
document.querySelectorAll('.quick-question').forEach(button=>button.addEventListener('click',()=>{const question=button.dataset.q;addChat(question,true);replyChat(question)}));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeModal()});

(async()=>{
  try { const response=await api('/api/games');state.games=response.data||[];renderGames(); }
  catch { toast('O‘yinlar serveridan ma’lumot olinmadi. Saytni node level.js orqali oching.'); }
  try{const response=await api('/api/profile');state.user=response.user;}catch{state.user=null}
})();
