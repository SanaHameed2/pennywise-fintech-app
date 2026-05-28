import { Outlet } from 'react-router-dom';
import Navbar from '../../shared/components/layout/Navbar';
import Footer from '../../shared/components/layout/Footer';

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
