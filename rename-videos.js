const fs = require('fs');
const path = require('path');

const videosDir = path.join(__dirname, 'demo-output-visual-fixed/videos');
const videos = fs.readdirSync(videosDir)
  .filter(f => f.endsWith('.webm'))
  .map(f => ({
    name: f,
    path: path.join(videosDir, f),
    time: fs.statSync(path.join(videosDir, f)).mtime
  }))
  .sort((a, b) => b.time - a.time);

console.log('\n📹 Latest videos (newest first):');
videos.slice(0, 3).forEach((v, i) => {
  const features = ['Settings', 'UserManagement', 'Dashboard'];
  const newName = `${features[i]}-visual.webm`;
  const newPath = path.join(videosDir, newName);
  
  console.log(`\n${i + 1}. ${v.name}`);
  console.log(`   Created: ${v.time.toLocaleString()}`);
  console.log(`   Size: ${(fs.statSync(v.path).size / 1024 / 1024).toFixed(2)} MB`);
  
  if (!fs.existsSync(newPath)) {
    fs.renameSync(v.path, newPath);
    console.log(`   ✅ Renamed to: ${newName}`);
  } else {
    console.log(`   ℹ️  ${newName} already exists`);
  }
});

console.log('\n✨ Videos are ready to view!');
console.log('\nTo view them:');
console.log('   open demo-output-visual-fixed/videos/  # macOS');
console.log('   explorer demo-output-visual-fixed\\videos\\  # Windows');