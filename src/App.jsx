import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import Dashboard from './pages/Dashboard'

const ErrorPage = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>Something went wrong</h1>
    <p>Please try refreshing the page</p>
  </div>
)

const router = createBrowserRouter([
  {
    path: "/signup",
    element: <Signup />,
    errorElement: <ErrorPage />
  },
  {
    path: "/signin",
    element: <Signin />,
    errorElement: <ErrorPage />
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    errorElement: <ErrorPage />
  },
  {
    path: "/",
    element: <Signup />,
    errorElement: <ErrorPage />
  }
])

const App = () => {
  return <RouterProvider router={router} />
}

export default App
