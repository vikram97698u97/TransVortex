const https = require('https');

const dbUrl = 'https://transport-dashboard-ad69a-default-rtdb.asia-southeast1.firebasedatabase.app/users.json';

https.get(dbUrl, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const users = JSON.parse(data);
            console.log('--- USER KEYS ---');
            for (const uid in users) {
                console.log(`UID: ${uid}`);
                console.log(`  Name: ${users[uid].username || users[uid].email}`);
                console.log(`  Core Account ID: ${users[uid].coreAccountId}`);
                const pumps = users[uid].petrolPumps;
                if (pumps) {
                    console.log(`  Pumps (${Object.keys(pumps).length}):`);
                    for (const pid in pumps) {
                        console.log(`    - ${pid}: ${pumps[pid].name} (${pumps[pid].place})`);
                    }
                } else {
                    console.log(`  Pumps: None`);
                }
            }
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
            console.log('Raw data length:', data.length);
            console.log('Snippet:', data.substring(0, 500));
        }
    });
}).on('error', (err) => {
    console.error('Error fetching database:', err.message);
});
