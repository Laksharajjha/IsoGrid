const API_URL = 'http://127.0.0.1:5001/api';

async function testActions() {
    try {
        // 1. Create a patient
        console.log('Creating patient...');
        const createRes = await fetch(`${API_URL}/patients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Patient',
                age: 30,
                condition: 'NON_INFECTIOUS',
                bedId: 1, // Assuming Bed 1 exists and is available
                userName: 'Tester'
            })
        });

        if (!createRes.ok) {
            const err = await createRes.text();
            throw new Error(`Create failed: ${err}`);
        }

        const patient = await createRes.json();
        const patientId = patient.id;
        console.log('Patient created:', patientId);

        // 2. Transfer Patient to Bed 2
        console.log('Transferring patient to Bed 2...');
        const transferRes = await fetch(`${API_URL}/patients/${patientId}/transfer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                targetBedId: 2,
                userName: 'Tester'
            })
        });

        if (!transferRes.ok) {
            const err = await transferRes.text();
            console.error('Transfer failed:', err);
        } else {
            console.log('Transfer successful');
        }

        // 3. Discharge Patient
        console.log('Discharging patient...');
        const dischargeRes = await fetch(`${API_URL}/patients/${patientId}/discharge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userName: 'Tester'
            })
        });

        if (!dischargeRes.ok) {
            const err = await dischargeRes.text();
            console.error('Discharge failed:', err);
        } else {
            console.log('Discharge successful');
        }

    } catch (error: any) {
        console.error('Test failed:', error.message);
    }
}

testActions();
