package com.synqai.coach.domain

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class MicrocycleRulesTest {
    @Test
    fun validSlotCounts_matchesFreeTierTemplate() {
        assertTrue(
            MicrocycleRules.isValidSlotCounts(
                MicrocycleRules.WARMUP_COUNT,
                MicrocycleRules.MAIN_COUNT,
                MicrocycleRules.COOLDOWN_COUNT,
            ),
        )
    }

    @Test
    fun validSlotCounts_rejectsExtraMainSlot() {
        assertFalse(
            MicrocycleRules.isValidSlotCounts(
                MicrocycleRules.WARMUP_COUNT,
                MicrocycleRules.MAIN_COUNT + 1,
                MicrocycleRules.COOLDOWN_COUNT,
            ),
        )
    }

    @Test
    fun maxMicrocycles_isTwoForFreeTier() {
        assertEquals(2, MicrocycleRules.MAX_MICROCYCLES)
    }
}
