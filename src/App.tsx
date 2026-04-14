import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAppStore } from './store';

const Layout = lazy(() => import('./components/Layout'));
const Home = lazy(() => import('./pages/Home'));
const UploadFlyer = lazy(() => import('./pages/UploadFlyer'));
const ShoppingList = lazy(() => import('./pages/ShoppingList'));
const Savings = lazy(() => import('./pages/Savings'));
const Search = lazy(() => import('./pages/Search'));
const FlyerHistory = lazy(() => import('./pages/FlyerHistory'));
const Community = lazy(() => import('./pages/Community'));
const Onboarding = lazy(() => import('./components/Onboarding'));

export default function App() {
  const syncOfflineDeals = useAppStore(state => state.syncOfflineDeals);
  const fetchDealsFromSupabase = useAppStore(state => state.fetchDealsFromSupabase);
  const initializeAuth = useAppStore(state => state.initializeAuth);
  const hasCompletedOnboarding = useAppStore(state => state.hasCompletedOnboarding);

  useEffect(() => {
    initializeAuth();
    
    const handleOnline = () => {
      console.log('App is back online. Synchronizing offline deals...');
      syncOfflineDeals();
    };

    window.addEventListener('online', handleOnline);
    
    // Also try to sync on initial load if we are online
    if (navigator.onLine) {
      syncOfflineDeals();
      fetchDealsFromSupabase();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncOfflineDeals, fetchDealsFromSupabase, initializeAuth]);

  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        {!hasCompletedOnboarding && <Onboarding />}

        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/community" element={<Community />} />
            <Route path="/upload" element={<UploadFlyer />} />
            <Route path="/list" element={<ShoppingList />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/history" element={<FlyerHistory />} />
          </Routes>
        </Layout>
      </Suspense>
    </BrowserRouter>
  );
}
