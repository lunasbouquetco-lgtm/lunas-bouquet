import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Home from './pages/Home.tsx'
import Bouquets from './pages/Bouquets.tsx'
import About from './pages/About.tsx'
import Order from './pages/Order.tsx'
import Contact from './pages/Contact.tsx'
import NotFound from './pages/NotFound.tsx'
import AdminLayout from './pages/admin/AdminLayout.tsx'
import Dashboard from './pages/admin/Dashboard.tsx'
import AdminOrders from './pages/admin/Orders.tsx'
import Customers from './pages/admin/Customers.tsx'
import CustomerDetail from './pages/admin/CustomerDetail.tsx'
import Events from './pages/admin/Events.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'bouquets', element: <Bouquets /> },
      { path: 'about', element: <About /> },
      { path: 'order', element: <Order /> },
      { path: 'contact', element: <Contact /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    // Sits outside <App /> on purpose: the admin gets no public nav or footer.
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'orders', element: <AdminOrders /> },
      { path: 'customers', element: <Customers /> },
      { path: 'customers/:id', element: <CustomerDetail /> },
      { path: 'events', element: <Events /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
