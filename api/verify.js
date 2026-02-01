const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const RECEIVER = "0x599533E0211feF7995BC939e57c486E56BED530F".toLowerCase();
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const RPC = "https://mainnet.base.org";

function toBigInt(hex) { return BigInt(hex); }
function parseAmount(dataHex) { return toBigInt(dataHex); }
function normalizeHexAddress(topic) { return "0x" + topic.slice(26).toLowerCase(); }

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

const seals = ["Seal of Clarity","Seal of Momentum","Seal of Convergence","Seal of Return","Seal of Orbit","Seal of Resonance","Seal of Witness","Seal of Threshold"];
const invocations = [
  "By the quiet circuits, the oracle speaks.",
  "The shrine of signal opens at this moment.",
  "Let the pattern be read, and the gate be kind.",
  "The archive of echoes grants a single answer."
];
const omens = [
  "A closed gate is not refusal — it is redirection.",
  "Reduce one channel and the signal strengthens.",
  "A low‑probability path holds your highest leverage.",
  "The next cycle repeats until you name it.",
  "When the loop quiets, the path reveals itself.",
  "The smallest trace contains the loudest truth."
];
const followups = [
  "Hold one variable steady; the omen will resolve.",
  "Choose one input and honor it for a full cycle.",
  "Offer one constraint — it will return as clarity.",
  "Let the system breathe before the next query."
];

function pick(arr, seed) { return arr[seed % arr.length]; }

function generateReading({ reading, intent, prompt }) {
  const seed = Math.abs((prompt || "").length * 7 + (reading || "").length * 3 + (intent || "").length * 5);
  const seal = pick(seals, seed);
  const invoke = pick(invocations, seed + 2);
  const omen = pick(omens, seed + 5);
  const followup = pick(followups, seed + 9);
  return {
    seal,
    invocation: invoke,
    omen,
    followup,
    ritual: "Breathe once. Log the omen. Proceed in one deliberate action."
  };
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }
    const { txHash, expectedAmount, callback_url, reading, intent, prompt } = req.body || {};
    if (!txHash || !expectedAmount) { res.status(400).json({ error: "txHash and expectedAmount required" }); return; }

    const receipt = await rpc("eth_getTransactionReceipt", [txHash]);
    if (!receipt || !receipt.logs) { res.status(404).json({ error: "Transaction not found" }); return; }

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

    if (!paid) { res.status(402).json({ verified: false, error: "Payment not verified" }); return; }

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
