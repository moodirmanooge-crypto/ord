import { lazy, Suspense } from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'
import { SiteProvider } from './lib/data'
import { Loading, ScrollManager } from './components/ui'
import Header from './components/Header'
import Footer from './components/Footer'
import Reveal from './components/Reveal'
import PageExtras from './components/PageExtras'
import Home from './pages/Home'
import About from './pages/About'
import Programs from './pages/Programs'
import WhereWeWork from './pages/WhereWeWork'
import Leadership from './pages/Leadership'
import Impact from './pages/Impact'
import Partner from './pages/Partner'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import CustomPage from './pages/CustomPage'
import NotFound from './pages/NotFound'

const AdminRoot = lazy(() => import('./admin/AdminRoot'))

function SiteLayout() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Outlet />
        <PageExtras />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <SiteProvider>
      <ScrollManager />
      <Reveal />
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<Loading />}>
              <AdminRoot />
            </Suspense>
          }
        />
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="programs" element={<Programs />} />
          <Route path="where-we-work" element={<WhereWeWork />} />
          <Route path="leadership" element={<Leadership />} />
          <Route path="impact" element={<Impact />} />
          <Route path="partner" element={<Partner />} />
          <Route path="news" element={<News />} />
          <Route path="news/:id" element={<NewsDetail />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="contact" element={<Contact />} />
          <Route path="p/:slug" element={<CustomPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </SiteProvider>
  )
}