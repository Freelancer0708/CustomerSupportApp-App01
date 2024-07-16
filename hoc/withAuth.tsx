// hoc/withAuth.tsx
import { useAuthContext } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const withAuth = (WrappedComponent: React.ComponentType) => {
    const ComponentWithAuth = (props: any) => {
        const { user } = useAuthContext();
        const router = useRouter();
        useEffect(() => {
            if (user === undefined) return; // 初期状態では何もせず、ユーザー状態が確定するまで待つ
            if (user === null) {
                router.push('/login'); // ログインページのパスに置き換えてください
            }
        }, [user, router]);
        if (user === undefined) {
            return <div>Loading...</div>; // ローディングスピナーなどを表示
        }
        if (user === null) {
            return null; // ユーザーがいない間は何も表示しない
        }
        return <WrappedComponent {...props} />;
    };
    return ComponentWithAuth;
};
export default withAuth;