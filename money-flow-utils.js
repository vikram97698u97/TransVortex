(function() {
    if (typeof window.firebase !== 'undefined' && window.firebase.apps.length === 0 && window.FIREBASE_CONFIG) {
        try {
            window.firebase.initializeApp(window.FIREBASE_CONFIG);
            console.log('[MoneyFlow] Autopatched Firebase compat SDK initialization');
        } catch (e) {
            console.warn('[MoneyFlow] Compat SDK auto-init failed:', e);
        }
    }

    window.MoneyFlow = {
        waitForAuth: function() {
            return new Promise((resolve) => {
                const checkAndSubscribe = () => {
                    if (typeof window.firebase === 'undefined' || !window.firebase.apps || window.firebase.apps.length === 0) {
                        setTimeout(checkAndSubscribe, 50);
                        return;
                    }
                    try {
                        const auth = window.firebase.auth();
                        if (auth.currentUser) {
                            return resolve(auth.currentUser);
                        }
                        const unsubscribe = auth.onAuthStateChanged((user) => {
                            unsubscribe();
                            resolve(user);
                        });
                    } catch (err) {
                        console.warn('[MoneyFlow] Error in waitForAuth check:', err);
                        resolve(null);
                    }
                };
                checkAndSubscribe();
            });
        },

        getCoreAccountId: async function() {
            if (window.MoneyFlow.coreAccountId) return window.MoneyFlow.coreAccountId;
            await this.waitForAuth();
            if (window.AuthManager) {
                try {
                    const ctx = await window.AuthManager.getCurrentUserContext();
                    if (ctx && ctx.coreAccountId) return ctx.coreAccountId;
                } catch (e) {
                    console.warn('[MoneyFlow] Context fetch failed, falling back to auth state:', e);
                }
            }
            const user = window.firebase.auth().currentUser;
            if (!user) return null;
            const snap = await window.firebase.database().ref(`users/${user.uid}`).once('value');
            return snap.val()?.coreAccountId || user.uid;
        },

        getUserName: async function() {
            if (window.MoneyFlow.recordedBy) return window.MoneyFlow.recordedBy;
            await this.waitForAuth();
            if (window.AuthManager) {
                try {
                    const ctx = await window.AuthManager.getCurrentUserContext();
                    if (ctx && ctx.name) return ctx.name;
                } catch (e) {}
            }
            const user = window.firebase.auth().currentUser;
            return user ? (user.displayName || user.email) : 'System';
        },

        getAccounts: async function() {
            await this.waitForAuth();
            const coreId = await this.getCoreAccountId();
            if (!coreId) return {};
            const snap = await window.firebase.database().ref(`users/${coreId}/money_accounts`).once('value');
            return snap.val() || {};
        },

        // Atomic transaction mapping: handles Creation, Update, and Deletion automatically
        recordPayment: async function({ refId, category, amount, type, accountId, note, date }) {
            const coreId = await this.getCoreAccountId();
            if (!coreId) {
                console.error('[MoneyFlow] Core account ID not found, transaction skipped.');
                return;
            }

            const db = window.firebase.database();
            const username = await this.getUserName();

            // 1. Find any existing transactions with this refId
            const transRef = db.ref(`users/${coreId}/money_transactions`);
            const existingSnap = await transRef.orderByChild('refId').equalTo(refId).once('value');
            const existingTrans = existingSnap.val() || {};

            const updates = {};

            // 2. Reverse previous transactions to restore balances
            for (const [key, trans] of Object.entries(existingTrans)) {
                const oldAccId = trans.accountId;
                const oldAmount = parseFloat(trans.amount) || 0;
                const oldType = trans.type; // 'credit' or 'debit'

                const accRef = db.ref(`users/${coreId}/money_accounts/${oldAccId}`);
                const accSnap = await accRef.once('value');
                if (accSnap.exists()) {
                    const curBalance = parseFloat(accSnap.val().balance) || 0;
                    const revertedBalance = oldType === 'credit' ? (curBalance - oldAmount) : (curBalance + oldAmount);
                    updates[`users/${coreId}/money_accounts/${oldAccId}/balance`] = revertedBalance;
                }
                // Delete old transaction record
                updates[`users/${coreId}/money_transactions/${key}`] = null;
            }

            // 3. Apply new transaction if amount > 0 and accountId is selected
            if (amount > 0 && accountId) {
                const accRef = db.ref(`users/${coreId}/money_accounts/${accountId}`);
                const accSnap = await accRef.once('value');
                if (accSnap.exists()) {
                    const acc = accSnap.val();
                    const curBalance = parseFloat(acc.balance) || 0;

                    const baseBalance = (updates[`users/${coreId}/money_accounts/${accountId}/balance`] !== undefined)
                        ? updates[`users/${coreId}/money_accounts/${accountId}/balance`]
                        : curBalance;

                    const newBalance = type === 'credit' ? (baseBalance + amount) : (baseBalance - amount);
                    updates[`users/${coreId}/money_accounts/${accountId}/balance`] = newBalance;

                    const newTransKey = db.ref().push().key;
                    updates[`users/${coreId}/money_transactions/${newTransKey}`] = {
                        date: date || new Date().toISOString().split('T')[0],
                        timestamp: Date.now(),
                        type,
                        amount,
                        category,
                        accountId,
                        accountName: acc.name,
                        refId,
                        note: note || '',
                        recordedBy: username
                    };
                }
            }

            // 4. Perform atomic update in Firebase
            if (Object.keys(updates).length > 0) {
                await db.ref().update(updates);
                console.log(`[MoneyFlow] Transaction successfully updated for refId: ${refId}`);
            }
        },

        deletePayment: async function(refId) {
            return this.recordPayment({ refId, amount: 0 });
        }
    };
})();
