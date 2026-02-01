export default function handler(req, res) {
  const prices = {
    single: { amount: 3, label: "Single" },
    pack: { amount: 9, label: "3-Pack" },
    studio: { amount: 19, label: "Studio" }
  };
  res.setHeader("Content-Type", "application/json");
  res.status(200).json({
    chain: "base",
    token: "USDC",
    decimals: 6,
    wallet: "0x599533E0211feF7995BC939e57c486E56BED530F",
    prices
  });
}
