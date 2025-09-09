import { useState, useEffect, useContext } from 'react'
import './App.css'

import { Navbar, NavbarBrand, NavbarToggle, Button } from "flowbite-react";
import LoginScreen from './pages/Signin';
import Item from './pages/sales';
import { AccessContextProvider } from './pages/AccessContext';

export default function MainPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [headerColor, setHeaderColor] = useState('bg-orange-300');

  const handleLogout = () => {
    localStorage.removeItem('access');
    setAuthenticated(false);
  };

  // Show loading state while checking authentication
  if (!isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AccessContextProvider>
      {
        !authenticated ? (
          <LoginScreen setAuthenticated={setAuthenticated} />
        ) : (
          <div className="min-h-screen w-full">
            <Navbar fluid rounded className={`bg-white *py-6 text-white`}>
              <NavbarBrand href="/" className='bg-white'>
                <img src="public/logo.png" className='size-16' alt="" />

              </NavbarBrand>

              <div className="flex md:order-2">
                <Button onClick={handleLogout} style={{ background: 'rgba(0,0,0,0.7)' }}>Logout</Button>
                <NavbarToggle />
              </div>
            </Navbar>
            <Item />
          </div>
        )
      }
    </AccessContextProvider>
  )
}
