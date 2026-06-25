package com.synqai.coach.domain

enum class PitchType(val playersOnField: Int, val labelKey: String) {
    FOOTBALL_11(11, "pitch_f11"),
    FOOTBALL_7(7, "pitch_f7"),
    FUTSAL(5, "pitch_futsal");

    companion object {
        fun fromKey(key: String): PitchType =
            entries.find { it.name == key } ?: FOOTBALL_7
    }
}

data class Player(
    val id: Long = 0,
    val name: String,
    val jerseyNumber: Int,
    val position: String,
    val active: Boolean = true,
)

enum class MatchStatus {
    DRAFT, LIVE, FINISHED
}

data class MatchResult(
    val homeScore: Int,
    val awayScore: Int,
    val status: MatchStatus,
)

enum class SlotType {
    WARMUP, MAIN, COOLDOWN
}

object MicrocycleRules {
    const val MAX_MICROCYCLES = 2
    const val WARMUP_COUNT = 1
    const val MAIN_COUNT = 3
    const val COOLDOWN_COUNT = 1

    fun isValidSlotCounts(warmup: Int, main: Int, cooldown: Int): Boolean =
        warmup == WARMUP_COUNT && main == MAIN_COUNT && cooldown == COOLDOWN_COUNT
}

object LeagueRules {
    const val MAX_ACTIVE_LEAGUES = 1
}
