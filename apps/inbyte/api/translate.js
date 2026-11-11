// Serverless translation endpoint for InnBite
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        let text = '';
        let from = 'en';
        let to = 'ml';

        if (req.method === 'POST') {
            const body = req.body || {};
            text = body.text || '';
            from = body.from || 'en';
            to = body.to || 'ml';
        } else {
            // GET query parameters
            const url = new URL(req.url, 'http://localhost');
            text = url.searchParams.get('text') || '';
            from = url.searchParams.get('from') || 'en';
            to = url.searchParams.get('to') || 'ml';
        }

        if (!text || typeof text !== 'string' || text.trim() === '') {
            return res.status(400).json({ success: false, error: 'Text is required for translation.' });
        }

        const trimmed = text.trim();

        // 1. Primary: Google Translate GTX endpoint
        try {
            const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(trimmed)}`;
            const response = await fetch(gtxUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && Array.isArray(data[0])) {
                    const translation = data[0].map(item => item[0]).filter(Boolean).join('');
                    if (translation) {
                        return res.status(200).json({ success: true, translation });
                    }
                }
            }
        } catch (gtxErr) {
            console.warn('[Translate API] GTX fetch warning:', gtxErr.message);
        }

        // 2. Fallback: MyMemory Translation API
        try {
            const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${from}|${to}`;
            const mmRes = await fetch(myMemoryUrl);
            if (mmRes.ok) {
                const mmData = await mmRes.json();
                const trans = mmData?.responseData?.translatedText;
                if (trans && trans !== trimmed) {
                    return res.status(200).json({ success: true, translation: trans });
                }
            }
        } catch (mmErr) {
            console.warn('[Translate API] MyMemory fetch warning:', mmErr.message);
        }

        // 3. Fallback: return original text if remote services are unreachable
        return res.status(200).json({ success: false, translation: trimmed, message: 'Fallback to original text' });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message || 'Translation failed.' });
    }
}

