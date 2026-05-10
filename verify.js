const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://Aish:Aishwariya@cluster0.q9i565i.mongodb.net/Saas').then(async () => {
  const db = mongoose.connection.db;
  await db.collection('users').updateMany({}, { $set: { isEmailVerified: true } });
  console.log('Users updated');
  process.exit(0);
});
