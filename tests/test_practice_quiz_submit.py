from engine.practice_quiz_submit import document_difficulty_to_level


def test_document_difficulty_to_level():
    assert document_difficulty_to_level(1) == 1
    assert document_difficulty_to_level(3) == 1
    assert document_difficulty_to_level(4) == 2
    assert document_difficulty_to_level(7) == 2
    assert document_difficulty_to_level(8) == 3
    assert document_difficulty_to_level(10) == 3
