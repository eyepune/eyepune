import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    const testimonials = [
        {
            customer_name: 'Deepa Vishwakarma',
            customer_company: 'Ikigai Edutech Pvt Limited',
            customer_title: 'Founder',
            content: 'Saransh is very co operative, great knowledge and experienced. With good touch he has beautifully crafted a website for me for my venture. Included his own thoughts, shared his viewpoint so the business can grow. The communication bridge between us was very easy. I just happened to give him a fair idea of what I wanted and he excelled in it. Will continue my future work with him. Thank you Saransh and Team.',
            rating: 5,
            status: 'approved',
            featured: true,
            service: 'web_app',
        },
        {
            customer_name: 'Steve L',
            customer_company: 'Tally K Services',
            customer_title: 'Managing Director',
            content: 'EyE Pune has proven to be a reliable and strategic delivery partner. Their ability to develop custom tools, implement automation, and support complex client ecosystems has strengthened our service offerings and accelerated results for our clients. Professional, accountable, and highly capable.',
            rating: 5,
            status: 'approved',
            featured: true,
            service: 'ai_automation',
        },
        {
            customer_name: 'Karry Lisle',
            customer_company: 'Karry Lisle Coaching',
            customer_title: 'Strategic Coach',
            content: 'EyE Pune has been exceptional. Their team brings clarity, structure, and technical precision to every build, enabling us to deliver seamless digital experiences that support coaching programs at scale. They are responsive, solutions-oriented, and deeply aligned with outcomes—not just execution.',
            rating: 5,
            status: 'approved',
            featured: true,
            service: 'full_service',
        },
        {
            customer_name: 'Vinoth Kumar',
            customer_company: 'Dance Moksha',
            customer_title: 'Founder',
            content: 'Exceptional! Working for our brand for more than 3 years and lending their best in all possible spectrums, from web / meta / google….',
            rating: 5,
            status: 'approved',
            featured: true,
            service: 'full_service',
        },
    ];
    
    // First check if testimonials already exist
    const { data: existing } = await supabase
        .from('testimonials')
        .select('customer_name');
    
    const existingNames = (existing || []).map(t => t.customer_name);
    const newTestimonials = testimonials.filter(t => !existingNames.includes(t.customer_name));
    
    if (newTestimonials.length === 0) {
        return NextResponse.json({ message: 'All testimonials already exist', count: existingNames.length });
    }
    
    const { data, error } = await supabase
        .from('testimonials')
        .insert(newTestimonials)
        .select();
    
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Testimonials seeded successfully', count: data.length, data });
}
