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
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2 sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <span className="min-w-0 font-display text-lg font-extrabold sm:text-xl">
            Smart Oshxona <span className="hidden text-sm font-semibold text-white/60 min-[380px]:inline">maktab oshxonasi</span>
          </span>
          <button onClick={onLogout} className="min-h-11 shrink-0 rounded-lg px-2 text-sm font-semibold text-sun hover:bg-white/10 sm:hidden">Chiqish</button>
        </div>
        <nav className="mobile-nav -mx-3 flex w-auto gap-1 overflow-x-auto px-3 sm:mx-0 sm:w-auto sm:overflow-visible sm:px-0">
          {items.map(([id, label]) => (
            <button key={id} onClick={() => setPage(id)} className={`min-h-11 shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition ${current === id ? 'bg-sun text-ink' : 'hover:bg-white/10'}`}>
              {label}
            </button>
          ))}
        </nav>
        <div className="flex min-w-0 items-center justify-between gap-3 text-xs sm:ml-auto sm:justify-start sm:text-sm">
          <span className="min-w-0 truncate text-white/75">
            {profile.full_name}{profile.role === 'student' && profile.grade ? ` · ${profile.grade}-sinf` : ''}
            {' '}({profile.role === 'head_cook' ? 'bosh oshpaz' : isCook ? 'oshpaz' : "o'quvchi"})
          </span>
          <button onClick={onLogout} className="hidden shrink-0 font-semibold text-sun hover:underline sm:inline">Chiqish</button>
        </div>
      </div>
    </header>
  )
}
