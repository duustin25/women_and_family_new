/**
 * Trigger Coolify Deployment for Barangay 183 WFP System
 */
const isForce = process.argv.includes('--force');
const APP_UUID = process.env.COOLIFY_APP_UUID || '7o3r74ojoenr7lycetgid5h1';
const API_TOKEN = process.env.COOLIFY_API_TOKEN || '1|Y3vDBrcSNqDkG9fwfIkLmY3FUH56P4PasdJ9tZe9a1ffd280';
const DEPLOY_URL = `https://deploy.kaigroup.cc/api/v1/deploy?uuid=${APP_UUID}${isForce ? '&force=true' : ''}`;

console.log(`🚀 Triggering deployment on Coolify (deploy.kaigroup.cc)${isForce ? ' [FORCE REBUILD]' : ''}...`);
console.log('📦 Application UUID:', APP_UUID);

try {
    const res = await fetch(DEPLOY_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
        console.log('✅ Deployment queued successfully!');
        console.log(JSON.stringify(data, null, 2));
    } else {
        console.error(`❌ Deployment failed with status code ${res.status}:`, data);
        process.exit(1);
    }
} catch (err) {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
}
