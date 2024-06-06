import React from 'react';
import { useNavigate} from 'react-router-dom';
import logo from '../assets/UOS25_logo.png';

const Header = () => {
  const navigate = useNavigate();


  const handleLogoClick = () => {
      navigate('/main');
  };

  return (
    <header className="flex w-full justify-center items-center py-5 shadow-md">
      <img 
        src={logo} 
        alt="UOS25 Logo" 
        className="h-12 cursor-pointer" 
        onClick={handleLogoClick} 
      />
    </header>
  );
}

export default Header;
