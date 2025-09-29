
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Customerlogin from './Componets/Product/customer-login';
import Homepage from './Componets/Product/Homepage';
import Registratin from './Componets/Product/Registratin';
import ProductPage from './Componets/Product/productdetail';
import ProfileSettings from './Componets/Product/usersettings';
import PlumberListPage from './Componets/Product/vendorlist';
import ProductCard from './Componets/Product/Productcard';
import CategoryDashboard from './Componets/Product/catroegry';
import CartPage from './Componets/Product/cart';
import CheckoutForm from './Componets/Product/customerdetails';
import MyOrders from './Componets/Product/mycustomer';
import Services from './Componets/Product/cutomerservicedeatils';
import ForgetPassword from './Componets/Product/forgetpassword';
import ProfessionalServicePage from './Componets/Product/profesionalservicedeatil';
import ViewStore from './Componets/Product/viewstore';
import AboutUs from './Componets/Product/Aboutus'
function App() {
  return (
    <div className="App">
      <Router>
        <Routes>

          <Route path="/" element={<Homepage></Homepage>} />
          <Route path="/product" element={<ProductCard></ProductCard>} />
          <Route path="/login" element={<Customerlogin></Customerlogin>} />
          <Route path="/signup" element={<Registratin></Registratin>} />
          <Route path="/product/:id" element={<ProductPage></ProductPage>} />
          <Route path="/profile" element={<ProfileSettings></ProfileSettings>} />
          <Route path="/service" element={<PlumberListPage></PlumberListPage>} />
          <Route path="/Category" element={<CategoryDashboard></CategoryDashboard>} />
          <Route path="/Cart" element={<CartPage></CartPage>} />
          <Route path="/Cart/order" element={<CheckoutForm></CheckoutForm>} />
          <Route path="/myorder" element={<MyOrders></MyOrders>} />
                    <Route path="/viewstore" element={<ViewStore></ViewStore>} />

          <Route path="/myorder/service" element={<Services></Services>} />
          <Route path='/forgetpassword' element={<ForgetPassword></ForgetPassword>}/>
              <Route path='/service/details/:id' element={<ProfessionalServicePage></ProfessionalServicePage>}/>
                            <Route path='/aboutus' element={<AboutUs></AboutUs>}/>






















        </Routes>
      </Router>
    </div>
  );
}

export default App;
//add
