from bert_score import score

def calculer_bert_score(candidates, references):

    if not candidates or not references:
        return {
            "precision": 0,
            "recall": 0,
            "f1": 0
        }

    min_len = min(
        len(candidates),
        len(references)
    )

    candidates = candidates[:min_len]
    references = references[:min_len]

    P, R, F1 = score(
        candidates,
        references,
        lang="fr"
    )

    return {
        "precision":
            round(P.mean().item(), 3),

        "recall":
            round(R.mean().item(), 3),

        "f1":
            round(F1.mean().item(), 3)
    }