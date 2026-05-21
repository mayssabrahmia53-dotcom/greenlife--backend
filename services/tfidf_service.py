# services/tfidf_service.py

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# =========================================================
# BASE DE RECOMMANDATIONS
# =========================================================
RECOMMENDATION_BASE = [

    {
        "text": "Réduire le chauffage pendant la nuit pour économiser l’énergie",
        "category": "chauffage"
    },

    {
        "text": "Utiliser le lave-linge uniquement lorsqu’il est plein",
        "category": "lavage"
    },

    {
        "text": "Éviter d’utiliser plusieurs appareils énergivores simultanément",
        "category": "consommation"
    },

    {
        "text": "Programmer les appareils pendant les heures creuses",
        "category": "optimisation"
    },

    {
        "text": "Nettoyer régulièrement le réfrigérateur pour améliorer son efficacité",
        "category": "réfrigérateur"
    },

    {
        "text": "Réduire la température du chauffe-eau",
        "category": "eau"
    },

    {
        "text": "Utiliser les rideaux pour conserver la chaleur intérieure",
        "category": "isolation"
    },

    {
        "text": "Limiter l’utilisation du chauffage dans les pièces inoccupées",
        "category": "chauffage"
    },

    {
        "text": "Utiliser les modes économie d’énergie des appareils électroménagers",
        "category": "appareils"
    },

    {
        "text": "Optimiser l’utilisation de la climatisation pendant les fortes chaleurs",
        "category": "climatisation"
    }
]


# =========================================================
# TF-IDF SEARCH ENGINE
# =========================================================
def retrieve_recommendations(user_context, top_k=3):

    try:

        documents = [
            item["text"]
            for item in RECOMMENDATION_BASE
        ]

        # ajouter contexte utilisateur
        all_texts = documents + [user_context]

        vectorizer = TfidfVectorizer()

        tfidf_matrix = vectorizer.fit_transform(all_texts)

        # dernier vecteur = user context
        user_vector = tfidf_matrix[-1]

        # recommandations
        recommendation_vectors = tfidf_matrix[:-1]

        similarities = cosine_similarity(
            user_vector,
            recommendation_vectors
        )[0]

        # tri décroissant
        ranked = similarities.argsort()[::-1]

        results = []

        for idx in ranked[:top_k]:

            results.append({
                "text": RECOMMENDATION_BASE[idx]["text"],
                "category": RECOMMENDATION_BASE[idx]["category"],
                "score": round(float(similarities[idx]), 3)
            })

        return results

    except Exception as e:

        print("TFIDF ERROR:", e)

        return []


# =========================================================
# TEST
# =========================================================
if __name__ == "__main__":

    context = """
    consommation élevée chauffage
    pic énergétique la nuit
    utilisation machine à laver fréquente
    """

    results = retrieve_recommendations(context)

    for r in results:
        print(r)