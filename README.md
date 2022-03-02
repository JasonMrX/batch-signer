# batch-signer

## Known Limits
- Step Functions Max State concurrency limit to 40 keys concurrently only.
- Potential of SQS duplicate messages => double signing
  - need to thes locks table to better resolve conflict if necessary.
- The performance bottleneck now seems to be at the Step Functions side (state transition per second)
  - The batch signer lambda take ~ 2 seconds on avg
  - We have 40 keys signing batches in parallel
  - We have 10000/20 = 500 batches to sign, which translate to 12.5 batches per key/signer
  - Should take only ~ 25 seconds to complete all in theory, however, each orchestrator run takes about 3 minutes
  - I am guessing we are throttled by Step Functions state transition rate
  - But I think this is fine as in reality it should take way more than 2 seconds to sign and broadcast to blockchain.