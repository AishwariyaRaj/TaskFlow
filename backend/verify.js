const mongoose = require('mongoose');
mongoose.connect('***REMOVED***').then(async () => {
  const db = mongoose.connection.db;
  await db.collection('users').updateMany({}, { $set: { isEmailVerified: true } });
  console.log('Users updated');
  process.exit(0);
});
