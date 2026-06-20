require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  await db.collection('users').updateMany({}, { $set: { isEmailVerified: true } });
  console.log('Users updated');
  process.exit(0);
});
