// pages/tweet.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp, QuerySnapshot, DocumentData, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthContext } from '../contexts/AuthContext';
import withAuth from '../hoc/withAuth';

type Tweet = {
  id: string;
  content: string;
  createdAt: Timestamp;
  user: {
    email: string;
    username?: string;
  };
};

const TweetPage = () => {
  const [content, setContent] = useState('');
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    const tweetsCollection = collection(db, 'tweets');
    const q = query(tweetsCollection, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const tweetsData: Tweet[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Tweet));
      setTweets(tweetsData);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError('Content cannot be empty');
      return;
    }

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('User is not authenticated');
      }

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const username = userDoc.exists() ? userDoc.data()?.username : null;

      await addDoc(collection(db, 'tweets'), {
        content,
        createdAt: Timestamp.now(),
        user: {
          email: currentUser.email,
          username: username || null,
        },
      });

      setContent('');
    } catch (error: any) {
      console.error('Error adding document: ', error); // 詳細なエラーログ
      setError(error.message);
    }
  };

  if (user === null) {
    return null;
  }

  return (
    <div>
      <h1>Tweet</h1>
      <form onSubmit={handleSubmit} className='tweets-form'>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          required
        />
        <button type="submit">投稿する</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
      <div>
        <h2>タイムライン</h2>
        <section className='tweets'>
        {tweets.map((tweet) => (
          <div key={tweet.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <p>{tweet.content}</p>
            <small>
              Posted by {tweet.user.username ? tweet.user.username : tweet.user.email} on {tweet.createdAt.toDate().toLocaleString()}
            </small>
          </div>
        ))}
        </section>
      </div>
    </div>
  );
};

export default withAuth(TweetPage);
