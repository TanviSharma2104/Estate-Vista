import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import About from './pages/about';
import Header from './componenets/Header';
import PrivateRoute from './componenets/PrivateRoute';
import CreateListing from './pages/CreateListing';


export default function App() {
  return <BrowserRouter>
  <Header />
  <Routes>
    <Route path='/' element={<Home />} />
    <Route path='/sign-in' element={<SignIn />} />
    <Route path='/sign-up' element={<SignUp />} />
    <Route path='/about' element={<About />} />
    
    <Route element={<PrivateRoute />} >
      <Route path='/profile' element={<Profile />} />
      <Route path='/create-listing' element={<CreateListing />} />
    </Route>
  </Routes>
  </BrowserRouter>
}
