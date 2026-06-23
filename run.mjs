const statusUrl = process.env.RUNX_INPUT_STATUS_URL ?? "";
const bountyUrl = process.env.RUNX_INPUT_BOUNTY_URL ?? "";

function requirePublicFranticUrl(value, label) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.hostname !== "gofrantic.com") {
    throw new Error(`${label} must be a public https://gofrantic.com URL`);
  }
  return url;
}

async function fetchJson(url, label) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`${label} returned HTTP ${response.status}`);
  }
  return response.json();
}

try {
  const normalizedStatusUrl = requirePublicFranticUrl(statusUrl, "status_url");
  const normalizedBountyUrl = requirePublicFranticUrl(bountyUrl, "bounty_url");
  const [status, bounty] = await Promise.all([
    fetchJson(normalizedStatusUrl, "status_url"),
    fetchJson(normalizedBountyUrl, "bounty_url"),
  ]);

  const workItem = status?.work?.items?.find((item) => item?.bounty?.number === 31);
  if (!workItem) throw new Error("active bounty #31 claim was not found");
  if (!workItem.verification) throw new Error("claim verification packet is null");

  const checks = workItem.verification.checks ?? [];
  if (checks.length === 0) throw new Error("verification packet has no checks");

  const result = {
    audited_at: new Date().toISOString(),
    sources: {
      status_url: normalizedStatusUrl.toString(),
      bounty_url: normalizedBountyUrl.toString(),
    },
    bounty: {
      number: workItem.bounty.number,
      title: workItem.bounty.title,
      contract_has_verification: Boolean(
        bounty?.bounty?.criteria?.verification ??
          bounty?.criteria?.verification ??
          bounty?.verification,
      ),
    },
    claim: {
      claim_ref: workItem.claimRef,
      status: workItem.status,
      verification_is_non_null: true,
      verification_status: workItem.verification.status,
      expected_check_ids: checks.map((check) => check.checkId),
      checks: checks.map(({ checkId, uses, status: checkStatus }) => ({
        check_id: checkId,
        uses,
        status: checkStatus,
      })),
      required_artifacts: workItem.requiredArtifacts,
      missing_artifacts: workItem.missingArtifacts,
    },
    privacy: {
      private_database_used: false,
      admin_console_used: false,
      private_worker_access_used: false,
      public_api_only: true,
    },
    verdict:
      checks.length > 0 && workItem.verification
        ? "PASS: public claim state exposes a non-null verification packet"
        : "FAIL",
  };

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}
