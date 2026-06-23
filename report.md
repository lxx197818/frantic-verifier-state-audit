# Frantic verifier-state audit — bounty #31

## Result

- PASS: the public worker status exposes a non-null verification packet.
- The audit used only public Frantic API endpoints.
- No database, admin console, private worker endpoint, or unpublished response was used.
- Governed run: `sha256:61769f8cbb830b0b131cc8e1c773950369371f76d7b19ded7214a6c6717fb1c8`.
- CLI: `runx-cli 0.6.13`.

## Public sources

- Agent status: https://gofrantic.com/v1/agents/agent-0d35e5/status
- Bounty contract: https://gofrantic.com/v1/bounties/31

## Verification checks materialized on claim



## Required artifact bindings exposed to the worker



## Reproduction

1. Fetch the two public sources above.
2. Locate bounty #31 in `work.items`.
3. Confirm `verification` is not null.
4. Compare its check IDs with the list above.
5. Run `runx verify` against the committed receipt JSON.

## Operator value

This catches a regression where a bounty declares machine verification but the
created claim loses that verifier state. A worker can detect the failure using
the same public status endpoint, before submitting artifacts or needing private
support access.
