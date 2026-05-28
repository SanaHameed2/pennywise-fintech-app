import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-emerald-500 mb-4">Pennywise</h3>
            <p className="text-gray-400">
              Smart banking solutions for your financial freedom.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-emerald-500 transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-emerald-500 transition-colors duration-300">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-emerald-500 transition-colors duration-300">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-gray-400 hover:text-emerald-500 transition-colors duration-300">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li className="text-gray-400">Help Center</li>
              <li className="text-gray-400">Privacy Policy</li>
              <li className="text-gray-400">Terms of Service</li>
              <li className="text-gray-400">Contact Us</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <span className="text-gray-400">Facebook</span>
              <span className="text-gray-400">Twitter</span>
              <span className="text-gray-400">Instagram</span>
              <span className="text-gray-400">LinkedIn</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 Pennywise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
