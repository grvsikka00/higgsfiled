const { getHiggsfieldClient } = require('../src/higgsfieldClient');

async function main() {
  const client = getHiggsfieldClient();

  const motions = await client.getMotions();
  console.log(`Connected to Higgsfield. ${motions.length} motion(s) available.`);
}

main().catch((error) => {
  console.error('Higgsfield connection test failed:', error.message);
  process.exitCode = 1;
});
