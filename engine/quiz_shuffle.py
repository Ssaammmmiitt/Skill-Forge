"""Shuffle multiple-choice options while preserving correct answers."""
import random


def shuffle_question_pool(questions: list[dict]) -> list[dict]:
    shuffled_qs = []
    for q in questions:
        copied_q = dict(q)
        options = list(copied_q["options"])
        correct_option = options[copied_q["correct_index"]]
        random.shuffle(options)
        copied_q["options"] = options
        copied_q["correct_index"] = options.index(correct_option)
        shuffled_qs.append(copied_q)
    return shuffled_qs
