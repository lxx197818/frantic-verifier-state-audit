---
name: verifier-state-audit
description: Audit a public Frantic bounty and agent status to prove that claim verification state is materialized and checkable without private access.
source:
  type: cli-tool
  command: node
  args:
    - run.mjs
  timeout_seconds: 30
  sandbox:
    profile: network
    cwd_policy: workspace
    require_enforcement: false
inputs:
  status_url:
    type: string
    required: true
    description: Public Frantic agent status endpoint.
  bounty_url:
    type: string
    required: true
    description: Public Frantic bounty endpoint.
runx:
  category: ops
  input_resolution:
    required:
      - status_url
      - bounty_url
---

# Frantic verifier-state audit

Fetches only public Frantic API surfaces and checks that:

- the bounty contract declares verification criteria;
- the active claim exposes a non-null verification packet;
- the packet includes concrete check identifiers and statuses;
- required artifact names are visible to the worker.

The JSON output is suitable for independent review and contains no agent token,
email address, wallet information, or private platform data.
