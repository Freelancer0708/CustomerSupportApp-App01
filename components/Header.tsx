import { useEffect, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useRouter } from 'next/router';

const Header = () => {
  const { user } = useAuthContext();
  const auth = getAuth();
  const [username, setUsername] = useState<string | null>(null);
  const [menuActive, setMenuActive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data()?.username || null);
        }
      }
    };
    fetchUsername();
  }, [user]);

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  const handleLinkClick = () => {
    setMenuActive(false);
  };

  return (
    <header>
      <nav>
        <div className='menu-toggle' onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <ul className={menuActive ? 'menu menu-active' : 'menu'}>
          <li><Link href="/" onClick={handleLinkClick}>Home</Link></li>
          {user ? (
            <>
              <li><Link href="/tweet" onClick={handleLinkClick}>Tweet</Link></li>
              <li><Link href="/support" onClick={handleLinkClick}>Support</Link></li>
              <li><Link href="/profile" onClick={handleLinkClick}>Profile</Link></li>
              <li className='header-right'>
                <div className=''>{username ? username : user.email}</div>
                <button onClick={() => { auth.signOut(); handleLinkClick(); }}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li><Link href="/login" onClick={handleLinkClick}>Login</Link></li>
              <li><Link href="/register" onClick={handleLinkClick}>Register</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
