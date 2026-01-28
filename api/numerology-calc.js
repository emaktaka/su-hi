// api/numerology-calc.js
import { applyCors } from "../lib/cors.js";
import { calcNumerologyFull } from "../lib/numerology.js";

export default async function handler(req, res) {
  const { ended } = applyCors(req, res);
  if (ended) return;

  if (req.method !== "POST") return res.status(405).json({ ok:false });

  let body = req.body;
  if (typeof body !== "object") {
    body = JSON.parse(await new Promise(r => {
      let d=""; req.on("data",c=>d+=c); req.on("end",()=>r(d));
    }));
  }
  const { date, name } = body;
  if (!date || !name) {
    return res.status(400).json({ ok:false, error:"date & name required" });
  }

  try {
    const data = calcNumerologyFull({ dateStr: date, name });
    return res.status(200).json({ ok:true, data });
  } catch(err) {
    return res.status(500).json({ ok:false, error: err.message });
  }
}
