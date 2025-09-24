import React, { Suspense, Fragment, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Loader from './components/Loader/Loader';
import AdminLayout from './layouts/AdminLayout';
import Cookies from 'js-cookie';

import { BASE_URL } from './config/constant';




const isAuthenticated = () => {
  // Replace 'auth_token' with your actual cookie name
  return Cookies.get('token') ? true : false;
};
const PrivateRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return children;
};

export const renderRoutes = (routes = []) => (
  <Suspense fallback={<Loader />}>
    <Routes>
      {routes.map((route, i) => {
        const Guard = route.guard || Fragment;
        const Layout = route.layout || Fragment;
        const Element = route.element;

        // If the route is private, wrap it in the PrivateRoute component
        const RouteElement = route.isPrivate ? (
          <PrivateRoute>
            <Layout>{route.routes ? renderRoutes(route.routes) : <Element />}</Layout>
          </PrivateRoute>
        ) : (
          <Layout>{route.routes ? renderRoutes(route.routes) : <Element />}</Layout>
        );

        return <Route key={i} path={route.path} element={<Guard>{RouteElement}</Guard>} />;
      })}
    </Routes>
  </Suspense>
);

const routes = [
  {
    exact: 'true',
    path: '/login',
    element: lazy(() => import('./views/auth/login'))
  },
    {
      exact: 'true',
      path: '/error/:code',
      element: lazy(() => import('./views/Error/Error'))
    },
  {
    path: '*',
    layout: AdminLayout,
    routes: [
      {
        exact: 'true',
        path: '/dashboard',
        element: lazy(() => import('./views/dashboard')),
        isPrivate: true
      },
      {
        exact: 'true',
        path: '/api-integration',
        element: lazy(() => import('./views/api-management/ApiIntegration')),
        isPrivate: true
      },
      {
        exact: 'true',
        path: '/api-list',
        element: lazy(() => import('./views/api-management/ApiconfigList')),
        isPrivate: true
      },
      {
        exact: 'true',
        path: '/api-detail/:id',
        element: lazy(() => import('./views/api-management/APIDetail')),
        isPrivate: true
      },
      {
        exact: 'true',
        path: '/api-detail/:id/key-detail/:key/:domain',
        element: lazy(() => import('./views/api-management/APILogsDetail')),
        isPrivate: true
      },
      {
        exact: 'true',
        path: '/setting/role',
        element: lazy(() => import('./views/management/role'))
      },
      {
        exact: 'true',
        path: '/setting/user',
        element: lazy(() => import('./views/management/user'))
      },
      {
        path: '*',
        exact: 'true',
        element: () => <Navigate to={BASE_URL} />
      }
    ]
  }
];

export default routes;
