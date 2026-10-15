import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useLocalStorage } from './hooks/useLocalStorage'
import Header from './components/Header'
import { Loading } from './components/ui'
import AuthPage from './pages/AuthPage'
import CatalogPage from './pages/CatalogPage'
import DishDetailPage from './pages/DishDetailPage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import CookOrdersPage from './pages/CookOrdersPage'
import CookMenuPage from './pages/CookMenuPage'
import PendingCooksPage from './pages/PendingCooksPage'
import TableBookingPage from './pages/TableBookingPage'

export default function App() {
  const { profile, loading, signOut } = useAuth()
  if (loading) return <Loading />
  if (!profile) return <AuthPage />
  return <Main key={profile.id} profile={profile} onLogout={signOut} />
}

function Main({ profile, onLogout }) {
  const [page, setPage] = useState('')
  const [dishId, setDishId] = useState(null)
  const [notice, setNotice] = useState('')
  const [cart, setCart] = useLocalStorage(`cart:${profile.id}`, {}) // { dishId: soni }

  const isCook = profile.role === 'cook' || profile.role === 'head_cook'
  const allowed = profile.role === 'head_cook'
    ? ['corders', 'cmenu', 'cooks', 'tables']
    : isCook ? ['corders', 'cmenu', 'tables'] : ['catalog', 'detail', 'cart', 'orders', 'cooks', 'tables']
  const current = allowed.includes(page) ? page : allowed[0]
  const go = (p) => { setNotice(''); setPage(p) }

  const setQty = (id, qty) =>
    setCart((c) => {
      const n = { ...c }
      if (qty <= 0) delete n[id]; else n[id] = Math.min(qty, 20)
      return n
    })
  const add = (dish) => setQty(dish.id, Math.min((cart[dish.id] || 0) + 1, dish.stock))
  const cartCount = Object.values(cart).reduce((s, n) => s + n, 0)

  return (
    <>
      <Header profile={profile} page={current} setPage={go} cartCount={cartCount} onLogout={onLogout} />
      <main className="mx-auto max-w-5xl px-4 py-6">
        {current === 'catalog' && <CatalogPage cart={cart} onAdd={add} onOpen={(id) => { setDishId(id); go('detail') }} />}
        {current === 'detail' && <DishDetailPage dishId={dishId} cart={cart} setQty={setQty} onBack={() => go('catalog')} />}
        {current === 'cart' && <CartPage cart={cart} setQty={setQty} onBrowse={() => go('catalog')} onDone={() => { setCart({}); setPage('orders'); setNotice("Buyurtma yuborildi! Holatini shu yerda kuzatishingiz mumkin.") }} />}
        {current === 'orders' && <OrdersPage notice={notice} onBrowse={() => go('catalog')} />}
        {current === 'corders' && <CookOrdersPage />}
        {current === 'cmenu' && <CookMenuPage isHeadChef={profile.role === 'head_cook'} />}
        {current === 'cooks' && <PendingCooksPage />}
        {current === 'tables' && <TableBookingPage />}
      </main>
    </>
  )
}
