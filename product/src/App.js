import 'bootstrap/dist/css/bootstrap.min.css';
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Componets/Product/Auth/AuthContext';

// Lazy load components
const Customerlogin = lazy(() => import('./Componets/Product/Auth/customer-login'));
const Homepage = lazy(() => import('./Componets/Product/Home/Homepage'));
const Registratin = lazy(() => import('./Componets/Product/Auth/Registratin'));
const ProductPage = lazy(() => import('./Componets/Product/Shop/productdetail'));
const ProfileSettings = lazy(() => import('./Componets/Product/User/usersettings'));
const PlumberListPage = lazy(() => import('./Componets/Product/Services/vendorlist'));
const ProductCard = lazy(() => import('./Componets/Product/Shop/Productcard'));
const CategoryDashboard = lazy(() => import('./Componets/Product/Shop/catroegry'));
const CartPage = lazy(() => import('./Componets/Product/Cart/cart'));
const CheckoutForm = lazy(() => import('./Componets/Product/Cart/customerdetails'));
const MyOrders = lazy(() => import('./Componets/Product/User/mycustomer'));
const Services = lazy(() => import('./Componets/Product/Services/cutomerservicedeatils'));
const ForgetPassword = lazy(() => import('./Componets/Product/Auth/forgetpassword'));
const ProfessionalServicePage = lazy(() => import('./Componets/Product/Services/profesionalservicedeatil'));
const ViewStore = lazy(() => import('./Componets/Product/Shop/viewstore'));
const AboutUs = lazy(() => import('./Componets/Product/Home/Aboutus'));
const CustomerChat = lazy(() => import('./Componets/Product/User/Customerchat'));
const UserInbox = lazy(() => import('./Componets/Product/User/Userinbox'));

const LoadingFallback = () => (
  <div className="d-flex justify-content-center align-items-center vh-100">
    <div className="spinner-border text-warning" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/chat" element={<UserInbox />} />
              <Route path="/product" element={<ProductCard />} />
              <Route path="/login" element={<Customerlogin />} />
              <Route path="/signup" element={<Registratin />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/service" element={<PlumberListPage />} />
              <Route path="/Category" element={<CategoryDashboard />} />
              <Route path="/Cart" element={<CartPage />} />
              <Route path="/Cart/order" element={<CheckoutForm />} />
              <Route path="/myorder" element={<MyOrders />} />
              <Route path="/viewstore" element={<ViewStore />} />
              <Route path="/myorder/service" element={<Services />} />
              <Route path='/forgetpassword' element={<ForgetPassword />} />
              <Route path='/service/details/:id' element={<ProfessionalServicePage />} />
              <Route path='/about' element={<AboutUs />} />
              <Route path="/customer/chat/:vendorId?" element={<CustomerChat />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
