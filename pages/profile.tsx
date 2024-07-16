// pages/profile.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthContext } from '../contexts/AuthContext';
import withAuth from '../hoc/withAuth';

const ProfilePage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push('/login');
    } else {
      // Fetch user profile from Firestore
      const fetchUserProfile = async () => {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data()?.username || '');
          setEmail(user.email || '');
        }
      };
      fetchUserProfile();
    }
  }, [user, router]);

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { username }, { merge: true });
        setMessage('Username updated successfully');
      } catch (error: any) {
        console.error('Error updating username: ', error);
        setError(error.message);
      }
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (user) {
      try {
        const auth = getAuth();
        const credential = EmailAuthProvider.credential(user.email!, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updateEmail(user, email);
        setMessage('Email updated successfully');
      } catch (error: any) {
        console.error('Error updating email: ', error);
        setError(error.message);
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (user) {
      try {
        const auth = getAuth();
        const credential = EmailAuthProvider.credential(user.email!, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, password);
        setMessage('Password updated successfully');
      } catch (error: any) {
        console.error('Error updating password: ', error);
        setError(error.message);
      }
    }
  };

  if (user === null) {
    return null;
  }

  return (
    <div className='profile'>
      <h1>Profile</h1>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <section className='profile-inner'>
        <form onSubmit={handleUsernameChange} className='profile-username'>
          <div>
            <label htmlFor="username">ユーザー名</label>
            <div className='profile-input'>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <button type="submit">更新</button>
            </div>
          </div>
        </form>
        <form onSubmit={handleEmailChange} className='profile-email'>
          <div>
            <label htmlFor="email">メールアドレス</label>
            <div className='profile-input'>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                id="current-password-email"
                placeholder="現在のパスワード"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button type="submit">更新</button>
            </div>
          </div>
        </form>
        <form onSubmit={handlePasswordChange} className='profile-password'>
          <div>
            <label htmlFor="password">パスワード</label>
            <div className='profile-input'>
              <input
                type="password"
                id="password"
                placeholder="新しいパスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                type="password"
                id="current-password-password"
                placeholder="現在のパスワード"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button type="submit">更新</button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
};

export default withAuth(ProfilePage);
