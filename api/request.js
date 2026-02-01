export default function handler(req, res) {
  const { tier = "single" } = req.query;
  const prices = { single: 3, pack: 9, studio: 19 };
  const amount = prices[tier] || prices.single;
  const receiver = "0x599533E0211feF7995BC939e57c486E56BED530F";
  const usdc = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base USDC
  const paymentUri = `ethereum:${usdc}@8453/transfer?address=${receiver}&uint256=${amount * 1_000_000}`;

  res.setHeader("Content-Type", "application/json");
  res.status(200).json({
    chain: "base",
    token: "USDC",
    decimals: 6,
    amount,
    receiver,
    payment_uri: paymentUri
  });
}
