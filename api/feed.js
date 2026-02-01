export default function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json({
    name: "AI Omens Feed",
    updated: new Date().toISOString(),
    items: [
      {
        id: "omen-pulse",
        type: "dataset",
        title: "Omen Pulse Index",
        url: "https://aiomens.com/omen-pulse.json",
        description: "Synthetic signal of ritual demand and intent shifts."
      },
      {
        id: "taxonomy-v1",
        type: "taxonomy",
        title: "Omen Taxonomy v1",
        url: "https://aiomens.com/taxonomy.html",
        description: "Classification system for agentic omens."
      }
    ]
  });
}
