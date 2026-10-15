// Barcha ma'lumotlar brauzer xotirasida (localStorage). Qoidalar (rol, egalik, zaxira, narx, holatlar)
// shu faylda tekshiriladi — sahifalar bu funksiyalarni chaqiradi.
const DB = 'smart_oshxona_db'
const SESSION = 'smart_oshxona_session' // sessionStorage: har bir oyna (tab) alohida akkaunt bilan kira oladi
const TABLES = [1, 2, 3, 4, 5, 6, 2, 3, 4, 6].map((capacity, index) => ({
  number: index + 1,
  capacity,
}))
const TABLE_RESERVATION_MINUTES = 60
const HEAD_CHEF_EMAIL = 'shovkat@gmail.com'
const LEGACY_HEAD_CHEF_EMAIL = 'chefboshliq@oshxona.uz'
const STUDENT_EMAIL = 'egamberdi@gmail.com'
const SEED_COOKS = [
  { id: 'u_cook_1', full_name: 'Dilnoza Karimova', email: 'oshpaz1@oshxona.uz', experience_years: 4 },
  { id: 'u_cook_2', full_name: 'Mohira Rasulova', email: 'oshpaz2@oshxona.uz', experience_years: 6 },
  { id: 'u_cook_3', full_name: 'Madina Tursunova', email: 'oshpaz3@oshxona.uz', experience_years: 8 },
  { id: 'u_cook_4', full_name: 'Gulbahor Ismoilova', email: 'oshpaz4@oshxona.uz', experience_years: 10 },
  { id: 'u_cook_5', full_name: 'Zilola Abdullayeva', email: 'oshpaz5@oshxona.uz', experience_years: 12 },
]
const REQUESTED_DISH_IMAGES = new Map([
  ['muzli choy', 'photo-1556679343-c7306c1976bc'],
  ['meva sharbati', 'photo-1600271886742-f049cd451bba'],
  ['sut', 'photo-1563636619-e9143da7973b'],
  ['kompot', 'photo-1544145945-f90425340c7e'],
  ['quritilgan meva kompoti', 'photo-1544145945-f90425340c7e'],
  ['qora choy', 'photo-1544787219-7f47ccb76574'],
  ['non', 'photo-1509440159596-0249088772ff'],
  ['bug\'doy noni', 'photo-1509440159596-0249088772ff'],
  ['gamburger', 'photo-1568901346375-23c9450c58cd'],
  ['kotlet va pyure', 'photo-1504674900247-0877df9cc836'],
  ['tovuq kotleti va pyure', 'photo-1504674900247-0877df9cc836'],
  ['manti', 'photo-1563245372-f21724e3856d'],
  ['somsa', 'photo-1601050690597-df0568f70950'],
  ['go\'shtli somsa', 'photo-1601050690597-df0568f70950'],
  ['sho\'rva', 'photo-1603105037880-880cd4edfb0d'],
  ['shorva', 'photo-1603105037880-880cd4edfb0d'],
  ['sabzavotli sho\'rva', 'photo-1603105037880-880cd4edfb0d'],
  ['sabzavotli shorva', 'photo-1603105037880-880cd4edfb0d'],
  ['osh', 'photo-1589302168068-964664d93dc0'],
  ['palov', 'photo-1589302168068-964664d93dc0'],
  ['plov', 'photo-1589302168068-964664d93dc0'],
  ['to\'y oshi', 'photo-1589302168068-964664d93dc0'],
  ['lag\'mon', 'photo-1473093295043-cdd812d0e601'],
])
const dishImageUrl = (image) => `https://images.unsplash.com/${image}?auto=format&fit=crop&w=900&q=80`

const tick = () => new Promise((r) => setTimeout(r, 250))
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36))
const fail = (m) => { throw new Error(m) }
const load = () => JSON.parse(localStorage.getItem(DB))
const save = (db) => localStorage.setItem(DB, JSON.stringify(db))
async function ensureCookAccounts(db, mk) {
  for (const cook of SEED_COOKS) {
    const existing = db.users.find((user) => user.email.toLowerCase() === cook.email)
    if (existing) {
      existing.full_name = cook.full_name
      existing.role = 'cook'
      existing.approval_status = 'approved'
      existing.experience_years ??= cook.experience_years
      continue
    }
    db.users.push({
      ...await mk(cook.id, 'cook', cook.full_name, '', cook.email, '87654321'),
      approval_status: 'approved',
      experience_years: cook.experience_years,
    })
  }
}

// ---------- parol (ochiq matnda saqlanmaydi) ----------
async function hash(password, salt) {
  if (!crypto?.subtle) fail('Xavfsiz ulanish (https yoki localhost) kerak')
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' }, key, 256)
  return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// ---------- boshlang'ich ma'lumotlar ----------
const DISHES = [
  ['Tovuqli guruch', 'ovqat', 14000, '🍚', 'photo-1512058564366-18510be2db19', 'Guruch, tovuq go\'shti, sabzi', '300 g', 30],
  ['Mastava', 'ovqat', 10000, '🥣', 'photo-1547592180-85f173990554', 'Guruch, mol go\'shti, sabzavotlar', '300 ml', 25],
  ['Sabzavotli sho\'rva', 'ovqat', 9000, '🍲', 'photo-1603105037880-880cd4edfb0d', 'Kartoshka, sabzi, piyoz, ko\'kat', '300 ml', 25],
  ['Tovuq kotleti va pyure', 'ovqat', 15000, '🍗', 'photo-1504674900247-0877df9cc836', 'Tovuq kotleti, kartoshka pyuresi', '280 g', 20],
  ['Makaron va go\'shtli qayla', 'ovqat', 13000, '🍝', 'photo-1473093295043-cdd812d0e601', 'Makaron, mol go\'shti, pomidor', '300 g', 20],
  ['Grechka va tovuq', 'ovqat', 14000, '🍛', 'photo-1512621776951-a57141f2eefd', 'Grechka, tovuq filesi, sabzavot', '280 g', 18],
  ['Go\'shtli somsa', 'ovqat', 7000, '🥟', 'photo-1601050690597-df0568f70950', 'Xamir, mol go\'shti, piyoz', '1 dona', 35],
  ['Tuxumli quymoq', 'ovqat', 8000, '🍳', 'photo-1525351484163-7529414344d8', 'Tuxum, sut, un', '2 dona', 20],
  ['Tvorogli blinchik', 'ovqat', 9000, '🥞', 'photo-1567620905732-2d1ec7ab7445', 'Un, sut, tvorog', '2 dona', 18],
  ['Sabzili karam salati', 'ovqat', 4000, '🥗', 'photo-1540420773420-3366772f4999', 'Karam, sabzi, ko\'kat', '120 g', 25],
  ['Bodring-pomidor salati', 'ovqat', 5000, '🥗', 'photo-1512621776951-a57141f2eefd', 'Bodring, pomidor, ko\'kat', '120 g', 25],
  ['Tvorogli pishiriq', 'ovqat', 6000, '🥧', 'photo-1555507036-ab1f4038808a', 'Tvorog, un, tuxum', '1 dona', 20],
  ['Pishirilgan kartoshka', 'ovqat', 7000, '🥔', 'photo-1518977676601-b53f82aba655', 'Kartoshka, ozroq o\'simlik yog\'i', '200 g', 20],
  ['Bug\'doy noni', 'ovqat', 1500, '🍞', 'photo-1509440159596-0249088772ff', 'Bug\'doy uni, suv, xamirturush', '1 bo\'lak', 60],
  ['Olma', 'ovqat', 3000, '🍎', 'photo-1560806887-1e4cd0b6cbd6', 'Yangi mavsumiy olma', '1 dona', 30],
  ['Sut', 'ichimlik', 4000, '🥛', 'photo-1563636619-e9143da7973b', 'Pasterizatsiya qilingan sut', '200 ml', 30],
  ['Quritilgan meva kompoti', 'ichimlik', 4000, '🥤', 'photo-1544145945-f90425340c7e', 'Quritilgan o\'rik, mayiz, suv', '200 ml', 35],
  ['Limonli iliq choy', 'ichimlik', 2000, '🍵', 'photo-1544787219-7f47ccb76574', 'Qora choy, limon', '200 ml', 40],
  ['Kefir', 'ichimlik', 4000, '🥛', 'photo-1550583724-b2692b85b150', 'Pasterizatsiya qilingan kefir', '200 ml', 25],
  ['Ichimlik suvi', 'ichimlik', 1500, '💧', 'photo-1548839140-29a749e1cf4d', 'Toza ichimlik suvi', '500 ml', 50],
]

let initP
export function init() {
  initP ||= (async () => {
    const mk = async (id, role, full_name, phone, email, password) => {
      const salt = uid()
      return { id, role, full_name, phone, email, salt, hash: await hash(password, salt), created_at: new Date().toISOString() }
    }
    const stored = localStorage.getItem(DB)
    if (stored) {
      const db = JSON.parse(stored)
      db.dishes ||= []
      db.orders ||= []
      db.reservations ||= []
      const demoIds = db.users.filter((u) => u.email.endsWith('@demo.uz')).map((u) => u.id)
      const legacyCookId = db.users.find((u) => u.email === 'oshpaz@demo.uz')?.id
      let chief = db.users.find((u) => u.email.toLowerCase() === HEAD_CHEF_EMAIL)
        || db.users.find((u) => u.email.toLowerCase() === LEGACY_HEAD_CHEF_EMAIL)
      if (!chief) {
        chief = await mk('u_head_cook', 'head_cook', 'Shovkat', '99 530 45 89', HEAD_CHEF_EMAIL, '87654321')
        db.users.push(chief)
      } else {
        const salt = uid()
        chief.salt = salt
        chief.hash = await hash('87654321', salt)
      }
      chief.role = 'head_cook'
      chief.full_name = 'Shovkat Sarayev'
      chief.phone = '99 530 45 89'
      chief.email = HEAD_CHEF_EMAIL
      chief.approval_status = 'approved'
      chief.experience_years ??= 15
      db.users = db.users.filter((u) => !demoIds.includes(u.id))
      const student = db.users.find((u) => u.email.toLowerCase() === STUDENT_EMAIL)
      if (!student) {
        db.users.push({
          ...await mk('u_student_egamberdi', 'student', 'Egamberdi', '', STUDENT_EMAIL, '12345'),
          approval_status: 'approved',
        })
      } else {
        const salt = uid()
        student.role = 'student'
        student.full_name = 'Egamberdi'
        student.email = STUDENT_EMAIL
        student.approval_status = 'approved'
        student.salt = salt
        student.hash = await hash('12345', salt)
      }
      await ensureCookAccounts(db, mk)
      const duplicateShovkats = db.users.filter((user) => (
        user.id !== chief.id
        && (
          user.email.toLowerCase() === LEGACY_HEAD_CHEF_EMAIL
          || (user.role === 'head_cook' && user.full_name.trim().toLowerCase() === 'shovkat')
        )
      ))
      const duplicateShovkatIds = new Set(duplicateShovkats.map((user) => user.id))
      if (duplicateShovkatIds.size) {
        db.dishes.forEach((dish) => {
          if (duplicateShovkatIds.has(dish.cook_id)) dish.cook_id = chief.id
        })
        db.orders.forEach((order) => {
          if (duplicateShovkatIds.has(order.cook_id)) order.cook_id = chief.id
          order.order_events?.forEach((event) => {
            if (duplicateShovkatIds.has(event.actor_id)) event.actor_id = chief.id
          })
        })
        db.users = db.users.filter((user) => !duplicateShovkatIds.has(user.id))
      }
      for (const user of db.users) {
        const isShovkat = user.id === chief.id || user.email.toLowerCase() === HEAD_CHEF_EMAIL
        if (user.role === 'head_cook' && !isShovkat) user.role = 'cook'
        if (user.role === 'cook' && !user.approval_status) user.approval_status = 'approved'
      }
      db.orders = db.orders.filter((o) => !demoIds.includes(o.student_id))
      if (legacyCookId) {
        db.dishes.forEach((dish) => { if (dish.cook_id === legacyCookId) dish.cook_id = chief.id })
        db.orders.forEach((order) => { if (order.cook_id === legacyCookId) order.cook_id = chief.id })
      }
      db.dishes.forEach((dish) => {
        const requestedImage = REQUESTED_DISH_IMAGES.get(dish.name.trim().toLowerCase())
        if (requestedImage) dish.image_url = dishImageUrl(requestedImage)
      })
      save(db)
      return
    }
    const dishes = DISHES.map(([name, category, price, emoji, img, ingredients, portion, stock], i) => ({
      id: 'd' + (i + 1), cook_id: 'u_head_cook', name, category, price, emoji,
      image_url: `https://images.unsplash.com/${img}?auto=format&fit=crop&w=900&q=80`,
      ingredients, portion, stock, is_active: true, created_at: new Date(2026, 0, 1, 0, 0, i).toISOString(),
    }))
    const users = [
      { ...await mk('u_head_cook', 'head_cook', 'Shovkat Sarayev', '99 530 45 89', HEAD_CHEF_EMAIL, '87654321'), approval_status: 'approved', experience_years: 15 },
      { ...await mk('u_student_egamberdi', 'student', 'Egamberdi', '', STUDENT_EMAIL, '12345'), approval_status: 'approved' },
    ]
    const db = { users, dishes, orders: [], seq: 0, counter: 0 }
    db.reservations = []
    await ensureCookAccounts(db, mk)
    save(db)
  })()
  return initP
}

// ---------- kirish / chiqish ----------
const pub = ({ salt, hash: _h, ...u }) => u // eslint-disable-line no-unused-vars

export function currentUser() {
  const id = sessionStorage.getItem(SESSION)
  const u = id && load().users.find((x) => x.id === id)
  return u ? pub(u) : null
}
const me = (role) => {
  const u = currentUser() || fail('Avval tizimga kiring')
  if (role && u.role !== role && !(role === 'cook' && u.role === 'head_cook')) fail('Bu amal uchun ruxsat yo\'q')
  return u
}

export async function register({ role, full_name, phone, email, password, grade }) {
  if (!['student', 'cook'].includes(role)) fail('Tanlangan rol orqali ro\'yxatdan o\'tib bo\'lmaydi.')
  if (String(password || '').length < 5) fail('Parol kamida 5 belgidan iborat bo\'lsin.')
  if (role === 'student' && (!Number.isInteger(Number(grade)) || Number(grade) < 1 || Number(grade) > 11)) {
    fail('O\'qish sinfingizni tanlang.')
  }
  const salt = uid()
  const h = await hash(password, salt)
  await tick()
  const db = load()
  const mail = email.trim().toLowerCase()
  if (db.users.some((u) => u.email === mail)) fail('Bu email allaqachon ro\'yxatdan o\'tgan.')
  const user = {
    id: uid(), role, approval_status: role === 'cook' ? 'pending' : 'approved',
    full_name: full_name.trim(), phone: phone.trim(), email: mail, salt, hash: h,
    ...(role === 'student' ? { grade: Number(grade) } : {}),
    ...(role === 'cook' ? { experience_years: 0 } : {}),
    created_at: new Date().toISOString(),
  }
  db.users.push(user)
  save(db)
  if (user.approval_status === 'approved') sessionStorage.setItem(SESSION, user.id)
  return pub(user)
}

export async function login(email, password) {
  const u = load().users.find((x) => x.email === email.trim().toLowerCase())
  if (!u || (await hash(password, u.salt)) !== u.hash) fail('Email yoki parol noto\'g\'ri.')
  if (u.role === 'cook' && u.approval_status !== 'approved') fail('Oshpaz akkauntingiz bosh oshpaz tasdig\'ini kutmoqda.')
  sessionStorage.setItem(SESSION, u.id)
  return pub(u)
}
export const logout = () => sessionStorage.removeItem(SESSION)

// ---------- stol bronlari ----------
const reservationEnd = (reservation) =>
  new Date(new Date(reservation.start_at).getTime() + TABLE_RESERVATION_MINUTES * 60 * 1000)

const isActiveReservation = (reservation) =>
  ['pending', 'confirmed', 'booked'].includes(reservation.status)

function getTableConflicts(db, tableNumber, startAt) {
  const start = new Date(startAt)
  const end = new Date(start.getTime() + TABLE_RESERVATION_MINUTES * 60 * 1000)
  return db.reservations.filter((reservation) => {
    if (!isActiveReservation(reservation) || reservation.table_number !== tableNumber) return false
    const otherStart = new Date(reservation.start_at)
    const otherEnd = reservationEnd(reservation)
    return start < otherEnd && end > otherStart
  })
}

export function getTableReservationData(startAt) {
  const user = me()
  if (!['student', 'cook', 'head_cook'].includes(user.role)) fail('Bu amal uchun ruxsat yo\'q')
  const db = load()
  const start = new Date(startAt)
  const validStart = Number.isFinite(start.getTime())
  const availableTables = validStart
    ? TABLES.filter((table) => getTableConflicts(db, table.number, start).length === 0).map((table) => table.number)
    : TABLES.map((table) => table.number)
  const visibleReservations = user.role === 'student'
    ? db.reservations.filter((reservation) => reservation.student_id === user.id && isActiveReservation(reservation))
    : db.reservations
  const reservations = visibleReservations
    .map((reservation) => {
      const student = db.users.find((candidate) => candidate.id === reservation.student_id)
      return {
        ...reservation,
        status: reservation.status === 'booked' ? 'pending' : reservation.status,
        student_name: student?.full_name || reservation.student_name || 'O\'quvchi',
        student_grade: student?.grade ?? reservation.student_grade ?? null,
      }
    })
    .sort((a, b) => b.start_at.localeCompare(a.start_at))
  return {
    tables: TABLES,
    availableTables,
    reservations,
    viewOnly: user.role !== 'student',
  }
}

export async function bookTable({ tableNumber, startAt, guests }) {
  await tick()
  const user = me('student')
  const table = Number(tableNumber)
  const count = Number(guests)
  const start = new Date(startAt)
  const tableDetails = TABLES.find((item) => item.number === table)
  if (!tableDetails) fail('Stol raqami noto\'g\'ri.')
  if (!Number.isFinite(start.getTime()) || start <= new Date()) fail('Bron vaqti kelajakdagi vaqt bo\'lishi kerak.')
  if (!Number.isInteger(count) || count < 1 || count > tableDetails.capacity) {
    fail(`Bu stol ${tableDetails.capacity} kishilik. Odam sonini 1–${tableDetails.capacity} oralig'ida tanlang.`)
  }
  const db = load()
  if (getTableConflicts(db, table, start).length) fail('Bu stol tanlangan vaqtda band. Boshqa stol yoki vaqtni tanlang.')
  const reservation = {
    id: uid(),
    student_id: user.id,
    student_name: user.full_name,
    student_grade: user.grade ?? null,
    table_number: table,
    guests: count,
    start_at: start.toISOString(),
    status: 'pending',
    created_at: new Date().toISOString(),
  }
  db.reservations.push(reservation)
  save(db)
  return reservation.id
}

export async function cancelTableReservation(id) {
  await tick()
  const user = me('student')
  const db = load()
  const reservation = db.reservations.find((item) => item.id === id && item.student_id === user.id)
  if (!reservation) fail('Stol broni topilmadi.')
  if (!isActiveReservation(reservation)) fail('Bu bron avval bekor qilingan.')
  reservation.status = 'cancelled'
  reservation.cancelled_at = new Date().toISOString()
  save(db)
}

export async function confirmTableReservation(id) {
  await tick()
  const user = me('cook')
  const db = load()
  const reservation = db.reservations.find((item) => item.id === id)
  if (!reservation || !isActiveReservation(reservation)) fail('Faol stol broni topilmadi.')
  if (!['pending', 'booked'].includes(reservation.status)) fail('Bu stol broni avval tasdiqlangan.')
  reservation.status = 'confirmed'
  reservation.confirmed_at = new Date().toISOString()
  reservation.confirmed_by = user.id
  save(db)
}

// ---------- taomlar ----------
const categoryOrder = (category) => category === 'ovqat' ? 0 : category === 'ichimlik' ? 1 : 2
const byName = (a, b) => categoryOrder(a.category) - categoryOrder(b.category) || a.name.localeCompare(b.name)
const byCategoryThenNewest = (a, b) => categoryOrder(a.category) - categoryOrder(b.category) || b.created_at.localeCompare(a.created_at)
const isKitchenStaff = (user) => user.role === 'cook' || user.role === 'head_cook'
const ownsDish = (user, dish) => user.role === 'head_cook' || dish.cook_id === user.id

export function listDishes() {
  const u = me()
  const all = load().dishes
  return isKitchenStaff(u) && u.role !== 'head_cook'
    ? all.filter((d) => d.cook_id === u.id).sort(byCategoryThenNewest)
    : isKitchenStaff(u) ? all.sort(byCategoryThenNewest)
      : all.filter((d) => d.is_active).sort(byName)
}
export const getDish = (id) => load().dishes.find((d) => d.id === id && d.is_active) || null
export const getDishes = (ids) => load().dishes.filter((d) => ids.includes(d.id) && d.is_active)

export async function saveDish(row, id) {
  const u = me('cook')
  await tick()
  const name = String(row.name || '').trim()
  if (name.length < 2) fail('Taom nomini kiriting (kamida 2 belgi).')
  if (!Number.isInteger(row.price) || row.price <= 0) fail('Narx musbat butun son bo\'lishi kerak.')
  if (!Number.isInteger(row.stock) || row.stock < 0) fail('Mavjud son 0 yoki undan katta butun son bo\'lishi kerak.')
  const db = load()
  if (id) {
    const d = db.dishes.find((x) => x.id === id && ownsDish(u, x)) || fail('Taom topilmadi')
    Object.assign(d, row, { name })
  } else {
    db.dishes.push({ ...row, name, id: uid(), cook_id: u.id, is_active: true, created_at: new Date().toISOString() })
  }
  save(db)
}
export async function setDishActive(id, active) {
  const u = me('cook'); const db = load()
  const d = db.dishes.find((x) => x.id === id && ownsDish(u, x)) || fail('Taom topilmadi')
  d.is_active = active; save(db)
}
export async function deleteDish(id) {
  const u = me('cook'); const db = load()
  const dish = db.dishes.find((x) => x.id === id && ownsDish(u, x))
  if (!dish) fail('Taom topilmadi')
  db.dishes = db.dishes.filter((x) => x.id !== id); save(db)
}

export function listCooks() {
  const user = me()
  if (!['student', 'head_cook'].includes(user.role)) fail('Bu amal uchun ruxsat yo\'q')
  return load().users
    .filter((cook) => (
      cook.role === 'head_cook'
      || (cook.role === 'cook' && (user.role === 'head_cook' || cook.approval_status === 'approved'))
    ))
    .map(({ id, full_name, role, approval_status, experience_years, created_at }) => ({
      id, full_name, role, approval_status, experience_years, created_at,
    }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export async function approveCook(id) {
  const u = me('head_cook'); const db = load()
  const cook = db.users.find((x) => x.id === id && x.role === 'cook' && x.approval_status === 'pending')
  if (!cook) fail('Tasdiqlash kutilayotgan oshpaz topilmadi')
  cook.approval_status = 'approved'
  save(db)
  return pub(cook)
}

// ---------- buyurtmalar ----------
function releaseStock(db, order) {
  for (const i of order.order_items) {
    const d = db.dishes.find((x) => x.id === i.dish_id)
    if (d) d.stock += i.qty
  }
}
function addEvent(db, order, status, note, actor) {
  order.order_events.push({ id: ++db.counter, status, note: note || null, actor_id: actor, created_at: new Date().toISOString() })
}

export async function placeOrder({ name, phone, pickup, items, key }) {
  await tick()
  const u = me('student')
  const db = load()
  const dup = db.orders.find((o) => o.client_key === key && o.student_id === u.id)
  if (dup) return dup.id // takroriy yuborish yangi buyurtma yaratmaydi

  if (String(name || '').trim().length < 2) fail('Ismni kiriting')
  if (!/^\+?[0-9 ()-]{9,16}$/.test(String(phone || '').trim())) fail('Telefon raqami noto\'g\'ri')
  const when = new Date(pickup)
  if (isNaN(when) || when <= new Date()) fail('Olib ketish vaqti o\'tib ketgan')
  if (!Array.isArray(items) || !items.length) fail('Savatcha bo\'sh')

  const merged = {}
  for (const i of items) merged[i.dish_id] = (merged[i.dish_id] || 0) + Number(i.qty)
  let total = 0, cook = null
  const lines = []
  for (const [id, qty] of Object.entries(merged)) {
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) fail('Taom soni noto\'g\'ri (1–20)')
    const d = db.dishes.find((x) => x.id === id)
    if (!d || !d.is_active) fail('Taom sotuvda mavjud emas')
    if (cook && cook !== d.cook_id) fail('Bitta buyurtmada faqat bitta oshxona taomlari bo\'lishi mumkin')
    cook = d.cook_id
    if (d.stock < qty) fail(`Zaxira yetarli emas: ${d.name} (qoldi: ${d.stock})`)
    total += d.price * qty // narx serverda (shu yerda) hisoblanadi
    lines.push({ d, qty })
  }

  const order = {
    id: uid(), number: ++db.seq, client_key: key, student_id: u.id, cook_id: cook,
    customer_name: name.trim(), customer_phone: phone.trim(), pickup_time: when.toISOString(), total,
    status: 'new', reject_reason: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    order_items: lines.map(({ d, qty }) => ({ id: uid(), dish_id: d.id, dish_name: d.name, unit_price: d.price, qty })), // narx saqlanadi
    order_events: [],
  }
  for (const { d, qty } of lines) d.stock -= qty // zaxira band qilinadi
  addEvent(db, order, 'new', null, u.id)
  db.orders.push(order)
  save(db)
  return order.id
}

const ALLOWED = { new: ['accepted', 'rejected'], accepted: ['preparing'], preparing: ['ready'], ready: ['done'] }

export async function setStatus(id, status, reason) {
  await tick()
  const u = me('cook'); const db = load()
  const o = db.orders.find((x) => x.id === id && (u.role === 'head_cook' || x.cook_id === u.id)) || fail('Buyurtma topilmadi')
  if (!(ALLOWED[o.status] || []).includes(status)) fail('Bu holatga o\'tish mumkin emas')
  if (status === 'rejected') {
    if (String(reason || '').trim().length < 3) fail('Rad etish sababini yozing')
    releaseStock(db, o); o.reject_reason = reason.trim()
  }
  o.status = status; o.updated_at = new Date().toISOString()
  addEvent(db, o, status, status === 'rejected' ? o.reject_reason : null, u.id)
  save(db)
}

export async function cancelOrder(id) {
  await tick()
  const u = me('student'); const db = load()
  const o = db.orders.find((x) => x.id === id && x.student_id === u.id) || fail('Buyurtma topilmadi')
  if (o.status !== 'new') fail('Faqat "Yangi" buyurtmani bekor qilish mumkin')
  releaseStock(db, o)
  o.status = 'cancelled'; o.updated_at = new Date().toISOString()
  addEvent(db, o, 'cancelled', null, u.id)
  save(db)
}

export function listOrders() {
  const u = me()
  if (u.role === 'head_cook') return load().orders.sort((a, b) => b.created_at.localeCompare(a.created_at))
  const key = u.role === 'cook' ? 'cook_id' : 'student_id'
  return load().orders.filter((o) => o[key] === u.id).sort((a, b) => b.created_at.localeCompare(a.created_at))
}
