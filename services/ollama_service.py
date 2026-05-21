# services/ollama_service.py
import requests
import json
import re

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.2"

def clean_text(text):
    if not text:
        return ""
    text = str(text)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"[^\w\sÀ-ÿ°-]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def analyze(values):
    if not values:
        return {"trend": "stable", "avg": 0, "peak": False}
    avg = sum(values) / len(values)
    last = values[-1]
    trend = "stable"
    if len(values) > 1:
        if last > values[-2]:
            trend = "augmentation"
        elif last < values[-2]:
            trend = "diminution"
    peak = last > avg * 1.2
    return {"trend": trend, "avg": round(avg, 2), "last": last, "peak": peak}

def energy_score(current, prediction):
    if prediction == 0:
        return 0.5
    ratio = current / prediction
    if ratio <= 0.9:
        return 0.95
    elif ratio <= 1:
        return 0.85
    elif ratio <= 1.2:
        return 0.7
    else:
        return 0.5

def is_bad(text):
    t = text.lower()
    banned = ["éteindre les appareils non utilisés", "remplacer les ampoules", "débrancher les chargeurs"]
    return any(b in t for b in banned)

def build_prompt(current, prediction, diff, analysis):
    return f"""
Tu es une intelligence artificielle avancée spécialisée en énergie domestique.

# CONTEXTE UTILISATEUR
- consommation actuelle: {current}
- prévision: {prediction}
- différence: {diff}

# ANALYSE
- tendance: {analysis['trend']}
- moyenne: {analysis['avg']}
- pic détecté: {"oui" if analysis['peak'] else "non"}

# PROFIL
- maison réelle
- appareils: TV, machine, frigo, chauffage
- objectif: réduire consommation intelligemment

# OBJECTIF
1. Donner une analyse intelligente (1 phrase)
2. Générer 3 recommandations ULTRA concrètes

# RÈGLES STRICTES
- PAS de répétition
- PAS: éteindre appareils / LED / chargeurs
- actions réelles: cuisine, chauffage, lavage, habitudes
- conseils personnalisés selon tendance

# FORMAT JSON STRICT
{{
  "insight": "",
  "recommendations": [
    {{"title": "", "action": "", "description": "", "priority": "haute|moyenne|faible"}},
    {{"title": "", "action": "", "description": "", "priority": ""}},
    {{"title": "", "action": "", "description": "", "priority": ""}}
  ]
}}
"""

def parse_json(text):
    try:
        return json.loads(text)
    except:
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            try:
                return json.loads(match.group())
            except:
                return None
    return None

def ask_ollama(values, prediction, current):
    diff = round(current - prediction, 2)
    analysis = analyze(values)
    prompt = build_prompt(current, prediction, diff, analysis)

    try:
        res = requests.post(OLLAMA_URL, json={
            "model": "llama3.2",
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.5, "top_p": 0.9, "repeat_penalty": 1.5}
        }, timeout=480)
        res.raise_for_status()
        text = res.json().get("response", "")
        data = parse_json(text)

        if not data or "recommendations" not in data:
            return {"insight": "", "recommendations": []}

        clean_recs = []
        for r in data["recommendations"]:
            title = clean_text(r.get("title"))
            action = clean_text(r.get("action"))
            desc = clean_text(r.get("description"))
            if not title or is_bad(action):
                continue
            clean_recs.append({
                "title": title,
                "action": action,
                "description": desc,
                "priority": r.get("priority", "moyenne")
            })
            if len(clean_recs) == 3:
                break

        if len(clean_recs) < 3:
            return {"insight": clean_text(data.get("insight", "")), "recommendations": []}

        return {
            "score": round(energy_score(current, prediction), 2),
            "insight": clean_text(data.get("insight")),
            "recommendations": clean_recs,
            "trend": analysis['trend'],
            "peak": analysis['peak']
        }
    except Exception as e:
        print("ERROR ask_ollama:", e)
        return {"insight": "", "recommendations": []}

def generate_reference_recommendations(values, prediction, current):
    diff = round(current - prediction, 2)
    analysis = analyze(values)
    prompt_ref = f"""
Tu es un expert énergie de très haut niveau.
Voici la situation :
- consommation actuelle : {current}
- prévision : {prediction}
- écart : {diff}
- tendance : {analysis['trend']}
- pic : {analysis['peak']}

Génère UNIQUEMENT 3 recommandations **parfaites, idéales, dignes d'un expert**.
Elles seront utilisées comme vérité terrain pour évaluer d'autres recommandations.

Règles :
- actions très précises, réalisables immédiatement
- pas de phrases génériques
- chaque recommandation : une courte action (max 10 mots)

RÉPONDS STRICTEMENT EN JSON (sans texte avant ou après) :
{{
  "references": [
    "action parfaite 1",
    "action parfaite 2",
    "action parfaite 3"
  ]
}}
"""
    try:
        res = requests.post(OLLAMA_URL, json={
            "model": "llama3.2",
            "prompt": prompt_ref,
            "stream": False,
            "options": {"temperature": 0.3, "repeat_penalty": 1.2}
        }, timeout=480)
        res.raise_for_status()
        text = res.json().get("response", "")
        data = parse_json(text)
        if data and "references" in data:
            return data["references"][:3]
        else:
            return []  # pas de fallback codé
    except Exception as e:
        print("ERROR generate_reference_recommendations:", e)
        return []