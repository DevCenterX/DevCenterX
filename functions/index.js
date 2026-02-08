const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

/**
 * Callable function to link or create a `users/{uid}` Firestore doc by email.
 * Data: { email, provider, displayName, photoURL }
 * Only callable by authenticated users.
 */
exports.linkUserByEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Request has no valid auth context.');
  }
  const callerUid = context.auth.uid;
  const email = (data && data.email) ? String(data.email).toLowerCase().trim() : null;
  const provider = data && data.provider ? String(data.provider) : 'unknown';
  const displayName = data && data.displayName ? String(data.displayName) : '';
  const photoURL = data && data.photoURL ? String(data.photoURL) : '';

  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing email');
  }

  try {
    const usersQ = await db.collection('users').where('email', '==', email).limit(1).get();
    if (!usersQ.empty) {
      const doc = usersQ.docs[0];
      const uid = doc.id;
      const existing = doc.data() || {};
      let providers = existing.provider || [];
      if (typeof providers === 'string') providers = [providers];
      if (!Array.isArray(providers)) providers = [];
      if (!providers.includes(provider)) providers.push(provider);

      const updated = {
        displayName: existing.displayName || displayName || '',
        avatar: existing.avatar || photoURL || '',
        provider: providers,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('users').doc(uid).set(updated, { merge: true });
      return { uid, updated };
    }

    // If no existing user, create under caller's uid (caller should be the user signing in)
    const userDoc = {
      uid: callerUid,
      email,
      displayName: displayName || '',
      avatar: photoURL || '',
      provider: [provider],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(callerUid).set(userDoc, { merge: true });
    return { uid: callerUid, created: true };
  } catch (err) {
    console.error('linkUserByEmail error', err);
    throw new functions.https.HttpsError('internal', 'Server error');
  }
});
