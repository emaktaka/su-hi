// api/ai-user-advice-numerology.js
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
  const { date, name } = body;
  if (!date || !name) return res.status(400).json({ ok:false });

  const numerology = calcNumerologyFull({ dateStr: date, name });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `
日本語で丁寧かつわかりやすい数秘術鑑定結果を作成してください。
- 生年月日: ${date}
- 名前: ${name}
- ライフパス: ${numerology.lifePath}
- バースデイ: ${numerology.birthday}
- ソウル: ${numerology.soul}
- パーソナリティ: ${numerology.personality}
- ディスティニー: ${numerology.destiny}

日常生活に即したアドバイスと、
ポジティブ・課題両面の説明を含めてください。
`;

  try {
    const r = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_USER || process.env.OPENAI_MODEL,
      messages: [{ role:"user", content:prompt }],
    });
    const text = r.choices?.[0]?.message?.content || "";
    res.status(200).json({ ok:true, text });
  } catch(err) {
    res.status(500).json({ ok:false, error:err.message });
  }
}
