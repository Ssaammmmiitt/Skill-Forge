"""Tests for activity attribute calculations (study / sleep)."""

from engine.attributes import compute_sleep_effects, compute_study_effects


def test_sleep_optimal_window():
    effects = compute_sleep_effects(8, current_energy=0)
    assert effects["energy_gain"] == 80


def test_sleep_capped_by_energy_room():
    effects = compute_sleep_effects(8, current_energy=90)
    assert effects["energy_gain"] == 10


def test_sleep_poor_rate_under_six_hours():
    effects = compute_sleep_effects(5, current_energy=20)
    assert effects["energy_gain"] == 20


def test_sleep_near_rate_six_and_half_hours():
    effects = compute_sleep_effects(6.5, current_energy=0)
    assert effects["energy_gain"] == 45.5


def test_sleep_max_hours_cap():
    effects = compute_sleep_effects(14, current_energy=0)
    assert effects["energy_gain"] == 12 * 4


def test_study_daily_cap_preview_alignment():
    effects = compute_study_effects(60, energy=50, int_already_today=14)
    assert effects["int_gain"] == 1.0
