const fs = require('fs');
const path = require('path');

const testFile = path.join(__dirname, 'test_secure_store.json');
// Make payload somewhat large to simulate disk I/O cost more clearly, though even small files block.
const payload = JSON.stringify({ refreshToken: "x".repeat(1000000) });

function measureEventLoopLagSync() {
  return new Promise((resolve) => {
    let start = performance.now();

    // Simulate other operations in the event loop that would be delayed
    let timeoutRanAt = 0;
    setTimeout(() => {
        timeoutRanAt = performance.now();
    }, 10);

    // Run blocking code
    for (let i = 0; i < 50; i++) {
      fs.writeFileSync(testFile, payload, 'utf8');
    }

    let end = performance.now();

    // Wait for the timeout to actually run
    setTimeout(() => {
        resolve({
            duration: end - start,
            timeoutDelay: timeoutRanAt - start - 10
        });
    }, 50);
  });
}

async function measureEventLoopLagAsync() {
  return new Promise(async (resolve) => {
    let start = performance.now();

    // Simulate other operations in the event loop that would be delayed
    let timeoutRanAt = 0;
    setTimeout(() => {
        timeoutRanAt = performance.now();
    }, 10);

    // Run non-blocking code
    for (let i = 0; i < 50; i++) {
      await fs.promises.writeFile(testFile, payload, 'utf8');
    }

    let end = performance.now();

    resolve({
        duration: end - start,
        timeoutDelay: timeoutRanAt - start - 10
    });
  });
}

async function runBenchmark() {
  console.log('Testing Sync Write...');
  const syncResult = await measureEventLoopLagSync();

  console.log('Testing Async Write...');
  const asyncResult = await measureEventLoopLagAsync();

  console.log('\n--- Results ---');
  console.log(`Sync write - Total time: ${syncResult.duration.toFixed(2)} ms, Event Loop Blocked Delay: ${syncResult.timeoutDelay.toFixed(2)} ms`);
  console.log(`Async write - Total time: ${asyncResult.duration.toFixed(2)} ms, Event Loop Blocked Delay: ${asyncResult.timeoutDelay.toFixed(2)} ms`);

  try { fs.unlinkSync(testFile); } catch (e) {}
}

runBenchmark();
