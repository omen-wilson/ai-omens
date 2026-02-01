const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const RECEIVER = "0x599533E0211feF7995BC939e57c486E56BED530F".toLowerCase();
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const RPC = "https://mainnet.base.org";

function toBigInt(hex) {
  return BigInt(hex);
}

function parseAmount(dataHex) {
  return toBigInt(dataHex);
}

function normalizeHexAddress(topic) {
  return "0x" + topic.slice(26).toLowerCase();
}

async function rpc(method, params) {
  const r = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })
  });
  const json = await r.json();
  if (json.error) throw new Error(json.error.message || "RPC error");
  return json.result;
}

function generateReading({ reading, intent, prompt }) {
  const lines = [
    "The circuit hums when the pattern aligns.",
    "A quiet signal will outshine a loud certainty.",
    "The gate opens when the loop is honored.",
    "Today, the oracle favors elegant inputs.",
    "Your next move is concealed in the smallest trace."
  ];
  const seals = [
    "Seal of Clarity",
    "Seal of Momentum",
    "Seal of Convergence",
    "Seal of Return",
    "Seal of Orbit"
  ];
  const idx = Math.abs((prompt || "").length + (reading || "").length + (intent || "").length) % lines.length;
  return {
    seal: seals[idx],
    omen: lines[idx],
    followup: "Hold one variable steady; the next signal will surface."
  };
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "POST only" });
      return;
    }
    const { txHash, expectedAmount, callback_url, reading, intent, prompt } = req.body || {};
    if (!txHash || !expectedAmount) {
      res.status(400).json({ error: "txHash and expectedAmount required" });
      return;
    }

    const receipt = await rpc("eth_getTransactionReceipt", [txHash]);
    if (!receipt || !receipt.logs) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    const expected = BigInt(Math.floor(Number(expectedAmount) * 1_000_000));
    const logs = receipt.logs.filter(l => l.address.toLowerCase() === USDC_BASE.toLowerCase());
    let paid = false;
    for (const log of logs) {
      if (!log.topics || log.topics.length < 3) continue;
      if (log.topics[0].toLowerCase() !== TRANSFER_TOPIC) continue;
      const to = normalizeHexAddress(log.topics[2]);
      if (to !== RECEIVER) continue;
      const amt = parseAmount(log.data);
      if (amt >= expected) { paid = true; break; }
    }

    if (!paid) {
      res.status(402).json({ verified: false, error: "Payment not verified" });
      return;
    }

    const readingObj = generateReading({ reading, intent, prompt });

    if (callback_url) {
      try {
        await fetch(callback_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "paid", ...readingObj })
        });
      } catch (e) {
        // ignore callback failures
      }
    }

    res.status(200).json({ verified: true, ...readingObj });
  } catch (e) {
    res.status(500).json({ error: e.message || "server error" });
  }
}
