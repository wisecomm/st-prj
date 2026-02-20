const BACKEND_URL = 'http://localhost:8080/api';

async function testOrders() {
    const userId = process.env.TEST_USER_ID || 'admin';
    const userPwd = process.env.TEST_USER_PWD || 'password';

    console.log(`[1] Logging into backend as ${userId}...`);
    let accessToken: string | undefined;
    let loginData: any;
    try {
        const loginRes = await fetch(`${BACKEND_URL}/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, userPwd }),
        });

        if (!loginRes.ok) {
            console.error(`Login failed with status ${loginRes.status}`);
            const text = await loginRes.text();
            console.error('Response:', text);
            return;
        }

        loginData = await loginRes.json();
        if (loginData.code !== '200') {
            console.error('Login returned error code:', loginData);
            return;
        }

        console.log('[+] Login Data:', JSON.stringify(loginData, null, 2));
        accessToken = loginData.data?.token;
        if (!accessToken) {
            console.error('No accessToken found in response!');
            return;
        }
        console.log(`[+] Login successful. Got Access Token (first 15 chars): ${accessToken?.substring(0, 15)}...`);
    } catch (err) {
        console.error('Failed to connect to backend during login:', err);
        return;
    }

    try {
        const refreshRes = await fetch(`${BACKEND_URL}/v1/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: loginData?.data?.refreshToken })
        });

        const refreshData = await refreshRes.json();
        console.log(`\n[3] Refresh token payload:`);
        console.log(JSON.stringify(refreshData, null, 2));
    } catch (err) {
        console.error('Failed the refresh fetch:', err);
    }

    console.log(`\n[2] Fetching orders with the access token...`);
    try {
        const ordersRes = await fetch(`${BACKEND_URL}/v1/mgmt/orders?page=1&size=10`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!ordersRes.ok) {
            console.error(`Orders fetch failed with status ${ordersRes.status}`);
            const text = await ordersRes.text();
            console.error('Response:', text);
            return;
        }

        const ordersData = await ordersRes.json();
        console.log(`[+] Orders fetch successful. Code: ${ordersData.code}, Message: ${ordersData.message}`);
        if (ordersData.data && ordersData.data.content) {
            console.log(`    Received ${ordersData.data.content.length} orders.`);
        } else {
            console.log(`    Response data:`, JSON.stringify(ordersData.data, null, 2).substring(0, 200) + '...');
        }
    } catch (err) {
        console.error('Failed to connect to backend during orders fetch:', err);
        return;
    }

    // --- CREATE ---
    console.log(`\n[4] Creating a new order...`);
    let createdOrderId: string = `ORD-${Date.now()}`;
    try {
        const newOrderPayload = {
            orderId: createdOrderId,
            custNm: "테스트 고객",
            orderNm: "테스트 상품 1개",
            orderStatus: "ORDERED",
            orderAmt: 15000,
            orderDate: new Date().toISOString().split('T')[0] + "T00:00:00", // YYYY-MM-DDT00:00:00
            useYn: "1"
        };

        const createRes = await fetch(`${BACKEND_URL}/v1/mgmt/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newOrderPayload)
        });

        const createData = await createRes.json();
        if (createData.code === '200') {
            console.log(`[+] Order created successfully.`);
            console.log(`    Created Order ID: ${createdOrderId}`);
        } else {
            console.error(`[-] Order creation failed:`, createData);
            return;
        }
    } catch (err) {
        console.error('Failed to create order:', err);
        return;
    }

    if (!createdOrderId) {
        console.error("No createdOrderId received, skipping Update and Delete tests.");
        return;
    }

    // --- UPDATE ---
    console.log(`\n[5] Updating the created order (${createdOrderId})...`);
    try {
        const updatePayload = {
            orderId: createdOrderId,
            custNm: "테스트 고객 (수정됨)",
            orderNm: "테스트 상품 2개",
            orderStatus: "PAID",
            orderAmt: 30000,
            orderDate: new Date().toISOString().split('T')[0] + "T00:00:00",
            useYn: "1"
        };

        const updateRes = await fetch(`${BACKEND_URL}/v1/mgmt/orders/${createdOrderId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatePayload)
        });

        const updateData = await updateRes.json();
        if (updateData.code === '200') {
            console.log(`[+] Order updated successfully.`);
        } else {
            console.error(`[-] Order update failed:`, updateData);
        }
    } catch (err) {
        console.error('Failed to update order:', err);
    }

    // --- DELETE ---
    console.log(`\n[6] Deleting the created order (${createdOrderId})...`);
    try {
        const deleteRes = await fetch(`${BACKEND_URL}/v1/mgmt/orders/${createdOrderId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        const deleteData = await deleteRes.json();
        if (deleteData.code === '200') {
            console.log(`[+] Order deleted successfully.`);
        } else {
            console.error(`[-] Order deletion failed:`, deleteData);
        }
    } catch (err) {
        console.error('Failed to delete order:', err);
    }
}

testOrders();
export { };
