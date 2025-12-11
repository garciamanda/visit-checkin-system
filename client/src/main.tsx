import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Dashboard from './Pages/Dashboard.tsx'
import App from './App.tsx'
import VisitsActive from './Pages/VisitsActive.tsx'
import Checkin from './Pages/Checkin.tsx'
import History from './Pages/History.tsx'
import Index from './Pages/Index.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'


const router = createBrowserRouter ([
  {
      path: "/Login",
      element: <App />,
},
{
      path: "/Dashboard",
      element: <Dashboard />,
},
{
      path: "/VisitsActive",
      element: <VisitsActive />,
},
{
      path : "/Checkin",
      element: <Checkin />,
},
{
      path : "/History",
      element: <History />,
},
{      path : "/",
      element: <Index />,
},
])


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
