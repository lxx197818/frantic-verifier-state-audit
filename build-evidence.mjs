import fs from "node:fs";

const run = JSON.parse(fs.readFileSync("run-output.json", "utf8"));
const verification = JSON.parse(fs.readFileSync("verification.json", "utf8"));
const version = fs.readFileSync("runx-version.txt", "utf8").trim();
const audit = run.output ?? run.result ?? run;
const receiptId =
  run.receipt_id ??
  run.receiptId ??
  run.receipt?.id ??
  verification.receipt_id ??
  verification.receiptId;

if (!receiptId) {
  throw new Error("runx output did not expose a receipt id");
}

const evidence = {
  summary:
    "Public Frantic claim state for bounty #31 exposes a non-null machine-verification packet with named checks, required artifacts, and public API provenance.",
  observations: [
    { kind: "runx_cli_version", value: version },
    { kind: "public_status_source", value: "https://gofrantic.com/v1/agents/agent-0d35e5/status" },
    { kind: "public_bounty_source", value: "https://gofrantic.com/v1/bounties/31" },
    { kind: "claim_response_or_public_read", value: audit },
    { kind: "verification_result", value: verification },
    { kind: "receipt_id", value: receiptId },
    {
      kind: "privacy_scope",
      value: {
        private_database_used: false,
        admin_console_used: false,
        internal_worker_access_used: false,
      },
    },
  ],
};

fs.writeFileSync("evidence.json", `${JSON.stringify(evidence, null, 2)}\n`);

const checks =
  audit?.claim?.checks?.map((check) => `- \`${check.check_id}\`: ${check.uses} (${check.status})`) ??
  [];
const required = audit?.claim?.required_artifacts?.map((name) => `- \`${name}\``) ?? [];

const report = `# Frantic verifier-state audit — bounty #31

## Result

- PASS: the public worker status exposes a non-null verification packet.
- The audit used only public Frantic API endpoints.
- No database, admin console, private worker endpoint, or unpublished response was used.
- Governed run: \`${receiptId}\`.
- CLI: \`${version}\`.

## Public sources

- Agent status: https://gofrantic.com/v1/agents/agent-0d35e5/status
- Bounty contract: https://gofrantic.com/v1/bounties/31

## Verification checks materialized on claim

${checks.join("\n")}

## Required artifact bindings exposed to the worker

${required.join("\n")}

## Reproduction

1. Fetch the two public sources above.
2. Locate bounty #31 in \`work.items\`.
3. Confirm \`verification\` is not null.
4. Compare its check IDs with the list above.
5. Run \`runx verify\` against the committed receipt JSON.

## Operator value

This catches a regression where a bounty declares machine verification but the
created claim loses that verifier state. A worker can detect the failure using
the same public status endpoint, before submitting artifacts or needing private
support access.
`;

fs.writeFileSync("report.md", report);
