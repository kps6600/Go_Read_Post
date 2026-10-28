import { connectDB } from '../db.js';
import Comment from '../models/Comment.js';

async function migrate() {
  await connectDB();
  const res = await Comment.updateMany(
    { $or: [{ contentType: { $exists: false } }, { contentType: null }] },
    { $set: { contentType: 'article' } }
  );
  console.log('Migrated comments without contentType to article:', res.modifiedCount);

  const total = await Comment.countDocuments();
  const articles = await Comment.countDocuments({ contentType: 'article' });
  const videos = await Comment.countDocuments({ contentType: 'video' });
  console.log(`Summary -> Total: ${total}, Articles: ${articles}, Videos: ${videos}`);
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
