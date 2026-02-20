const BACKEND_URL = 'http://localhost:8080/api';

async function testTokenRefresh() {
    const userId = process.env.TEST_USER_ID || 'admin';
    const userPwd = process.env.TEST_USER_PWD || '12345678';

    console.log(`[1] Logging into backend as ${userId}...`);
    let accessToken: string | undefined;
    let refreshToken: string | undefined;

    try {
        const loginRes = await fetch(`${BACKEND_URL}/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, userPwd }),
        });

        const loginData = await loginRes.json();
        if (loginData.code !== '200') {
            console.error('[-] Login returned error code:', loginData);
            return;
        }

        accessToken = loginData.data?.token;
        refreshToken = loginData.data?.refreshToken;

        if (!accessToken || !refreshToken) {
            console.error('[-] Missing token or refreshToken in response!');
            return;
        }
        console.log(`[+] Login successful.`);
        console.log(`    Original Access Token (front): ${accessToken?.substring(0, 15)}...`);
        console.log(`    Refresh Token (front): ${refreshToken?.substring(0, 15)}...`);
    } catch (err) {
        console.error('Failed to connect to backend during login:', err);
        return;
    }

    // --- 401 TEST ---
    console.log(`\n[2] Modifying access token to simulate expiration/invalidity...`);
    const invalidToken = accessToken ? accessToken.substring(0, accessToken.length - 10) + "invalidStr" : "invalid"; // Tamper with signature

    try {
        const ordersRes = await fetch(`${BACKEND_URL}/v1/mgmt/orders?page=1&size=5`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${invalidToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (ordersRes.status === 401) {
            console.log(`[+] Backend correctly returned 401 Unauthorized for invalid token.`);
        } else {
            console.error(`[-] Expected 401, but got ${ordersRes.status}`);
            const text = await ordersRes.text();
            console.log('Response:', text);
        }
    } catch (err) {
        console.error('[-] API call failed:', err);
    }

    // --- REFRESH TOKEN ---
    console.log(`\n[3] Calling /v1/auth/refresh to issue a new access token...`);
    let newAccessToken: string | undefined;
    try {
        const refreshRes = await fetch(`${BACKEND_URL}/v1/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });

        const refreshData = await refreshRes.json();
        if (refreshData.code === '200') {
            console.log(`[+] Token refreshed successfully.`);
            newAccessToken = refreshData.data?.token;
            console.log(`    Refreshed Access Token (front): ${newAccessToken?.substring(0, 15)}...`);

            if (newAccessToken === accessToken) {
                console.warn(`    Warning: The new access token is identical to the old one. Is this expected?`);
            } else {
                console.log(`    Success: A new unique access token was issued.`);
            }
        } else {
            console.error(`[-] Refresh failed:`, refreshData);
            return;
        }
    } catch (err) {
        console.error('[-] Failed to fetch refresh endpoint:', err);
        return;
    }

    // --- VERIFY NEW TOKEN ---
    console.log(`\n[4] Making an API request with the newly refreshed access token...`);
    try {
        const verifyRes = await fetch(`${BACKEND_URL}/v1/mgmt/orders?page=1&size=2`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${newAccessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            console.log(`[+] Request successful with new token (Code: ${verifyData.code}).`);

            if (verifyData.data && verifyData.data.content) {
                console.log(`    Successfully fetched ${verifyData.data.content.length} orders.`);
            }
        } else {
            console.error(`[-] Request failed with status: ${verifyRes.status}`);
            const text = await verifyRes.text();
            console.error(`    Response:`, text);
        }
    } catch (err) {
        console.error('[-] API request with new token failed:', err);
    }
}

testTokenRefresh();
export { };
