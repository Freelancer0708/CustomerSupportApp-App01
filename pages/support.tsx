import React, { useState, useEffect } from 'react';
import withAuth from '../hoc/withAuth';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthContext } from '../contexts/AuthContext';

type Message = {
  role: string;
  content: string;
  createdAt: Timestamp;
};

const SupportPage: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuthContext();

  useEffect(() => {
    const messagesCollection = collection(db, 'chat_messages');
    const q = query(messagesCollection, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const messagesData: Message[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          role: data.role,
          content: data.content,
          createdAt: data.createdAt,
        };
      });
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setLoading(true);

    const userMessage: Message = { role: 'user', content: prompt, createdAt: Timestamp.now() };

    try {
      await addDoc(collection(db, 'chat_messages'), userMessage);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, messages: [...messages, userMessage].slice(-5) }),
      });

      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.choices[0].message.content, createdAt: Timestamp.now() };

      await addDoc(collection(db, 'chat_messages'), assistantMessage);
    } catch (error) {
      console.error('Error fetching the response:', error);
      await addDoc(collection(db, 'chat_messages'), {
        role: 'assistant',
        content: 'Error fetching response from ChatGPT',
        createdAt: Timestamp.now(),
      });
    } finally {
      setLoading(false);
      setPrompt('');
    }
  };

  return (
    <div className='support'>
      <h1>Chat with GPT</h1>
      <div className='chat'>
        {messages.map((message, index) => (
          <div key={index} className='chat-inner'>
            <strong>{message.role === 'user' ? 'You' : 'GPT'}:</strong> {message.content}
          </div>
        ))}
      </div>
      <div className='send'>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
        />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Loading...' : '送信'}
        </button>
      </div>
    </div>
  );
};

export default withAuth(SupportPage);
