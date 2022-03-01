# batch-signer

## Known Limits
- Step Functions Max State concurrency limit to 40 keys concurrently only.
- Potential of SQS duplicate messages => double signing
  - need to thes locks table to better resolve conflict if necessary.