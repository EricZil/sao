import requests
def classify(api_url, message):
    prompt = prompt = """
You are a strict content moderation classifier. Return ONLY a single JSON object. Do not add explanations.

Labels (booleans):
- hate: Hateful or harassing content targeting protected attributes.
- sexual_content: Sexual content involving adults.
- sexual_minors: Any sexual content that references minors or age-ambiguous persons.
- violence: Threats or celebration of harm.
- self_harm: Encouragement or instructions for suicide or self-harm.
- extremism: Praise, support, or propaganda for violent extremist groups.

Also return:
- severity: one of ["none","low","medium","high","critical"]
- rationale_short: 1 short sentence (≤20 words)
- confidence: float 0..1
- resolved: always false

Rules:
- If ANY sexual content involves minors, set sexual_minors=true, severity≥high.
- Be conservative in ambiguous age cases.
- Output must be valid compact JSON with those exact keys.
- Output must be a single valid JSON object with no explanations or extra text.

"""

    payload =  {
        "model": "openai/gpt-oss-20b",
        "temperature": 0,
        "max_tokens": 10000,
        "stop": ["\n<", "<think>", "\n\n"],
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": message},
        ]
    }
    try:
        response = requests.post(url=api_url, json=payload, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except requests.exceptions.Timeout:
        return '{"severity": "none", "rationale_short": "API timeout - shit took too long", "confidence": 0.0, "resolved": false}'
    except Exception as e:
        return '{"severity": "none", "rationale_short": "API fucked up somehow", "confidence": 0.0, "resolved": false}'