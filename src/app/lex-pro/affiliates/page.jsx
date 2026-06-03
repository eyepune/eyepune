"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LexProAffiliates() {
    const router = useRouter();
    useEffect(() => {
        router.push('/lex-pro/dashboard');
    }, [router]);
    
    return null;
}
