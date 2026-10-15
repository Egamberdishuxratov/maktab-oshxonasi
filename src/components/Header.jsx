export default function Header({ profile, page, setPage, cartCount, onLogout }) {
  const isCook = profile.role === 'cook' || profile.role === 'head_cook'
  const items = profile.role === 'head_cook'
    ? [['corders', 'Buyurtmalar'], ['cmenu', 'Menyu'], ['cooks', 'Oshpazlar'], ['tables', 'Stollar']]
    : isCook
      ? [['corders', 'Buyurtmalar'], ['cmenu', 'Menyu'], ['tables', 'Stollar']]
    : [
      ['catalog', 'Menyu'],
      ['cooks', 'Oshpazlar'],
      ['tables', 'Stol bron'],
      ['cart', cartCount ? `Savatcha (${cartCount})` : 'Savatcha'],
      ['orders', 'Buyurtmalarim'],
    ]
  const current = page === 'detail' ? 'catalog' : page
  return (
    <header className="sticky top-0 z-20 border-b-4 border-sun bg-teal-dark text-white shadow">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <span className="font-display text-xl font-extrabold">Smart Oshxona <span className="ml-1 text-sm font-semibold text-white/60">maktab oshxonasi</span></span>
        <nav className="order-3 flex w-full gap-1 sm:order-none sm:w-auto">
          {items.map(([id, label]) => (
            <button key={id} onClick={() => setPage(id)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${current === id ? 'bg-sun text-ink' : 'hover:bg-white/10'}`}>
              {label}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <span className="text-white/75">
            {profile.full_name}{profile.role === 'student' && profile.grade ? ` · ${profile.grade}-sinf` : ''}
            {' '}({profile.role === 'head_cook' ? 'bosh oshpaz' : isCook ? 'oshpaz' : "o'quvchi"})
          </span>
          <button onClick={onLogout} className="font-semibold text-sun hover:underline">Chiqish</button>
        </div>
      </div>
    </header>
  )
}
