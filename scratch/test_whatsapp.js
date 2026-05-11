async function testWhatsApp() {
    console.log('--- WHATSAPP CONNECTIVITY TEST ---');
    const adminPhone = '919511210191';
    
    try {
        const response = await fetch('http://localhost:3000/api/system/whatsapp/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: adminPhone })
        });
        
        const data = await response.json();
        console.log('Result:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Network Error:', error.message);
    }
}

testWhatsApp();
