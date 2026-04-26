const { execSync } = require('child_process');
const path = require('path');

const files = [
  'js/app.js',
  'js/chat.js',
  'js/admin.js',
  'js/pastpapers.js',
  'js/knowledge.js',
  'models/PastPaper.js',
  'models/User.js',
  'models/Subscription.js',
  'controllers/PastPaperController.js',
  'controllers/SubscriptionController.js',
  'routes/admin.js',
  'routes/knowledge.js',
  'backend/models/Subscription.js',
];

const root = 'c:/Users/Rose/Downloads/ARIA_App_v2_devbuild_branch';
let allOk = true;

files.forEach(f => {
  const fullPath = path.join(root, f);
  try {
    execSync(`node --check "${fullPath}"`, { stdio: 'pipe' });
    console.log('✅ SYNTAX OK :', f);
  } catch (e) {
    console.log('❌ SYNTAX FAIL:', f);
    allOk = false;
  }
});

if (allOk) {
  console.log('\n🎉 All files passed syntax check.');
} else {
  console.log('\n⚠️ Some files have syntax issues.');
  process.exit(1);
}

