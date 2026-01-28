// api/ai-compatibility-numerology.js
import { applyCors } from "../lib/cors.js";
import OpenAI from "openai";
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
  const { personA, personB } = body;
  if (!personA?.date || !personA?.name || !personB?.date || !personB?.name) {
    return res.status(400).json({ ok:false, error:"Both persons data required" });
  }

  const na = calcNumerologyFull({ dateStr: personA.date, name: personA.name });
  const nb = calcNumerologyFull({ dateStr: personB.date, name: personB.name });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `
数秘術による相性診断レポート（日本語）を作成してください。
A: ${personA.name} (${personA.date}) => LP:${na.lifePath}, S:${na.soul}, P:${na.personality}
B: ${personB.name} (${personB.date}) => LP:${nb.lifePath}, S:${nb.soul}, P:${nb.personality}

以下を含めて：
- 総合相性（A⇄B）
- 価値観／内面／外面の一致度
- 相性ポジティブ・課題
`;

  try {
    const r = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role:"user", content:prompt }],
    });
    res.status(200).json({ ok:true, text: r.choices?.[0]?.message?.content });
  } catch(err) {
    res.status(500).json({ ok:false, error:err.message });
  }
}
