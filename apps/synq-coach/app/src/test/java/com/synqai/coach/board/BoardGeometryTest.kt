package com.synqai.coach.board

import com.synqai.coach.domain.PitchType
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class BoardGeometryTest {
    @Test
    fun clampToPitch_keepsPointInsideMargins() {
        val (x, y) = BoardGeometry.clampToPitch(0f, 0f, 400f, 300f, 20f)
        assertEquals(20f, x)
        assertEquals(20f, y)
    }

    @Test
    fun clampToPitch_limitsOverflow() {
        val (x, y) = BoardGeometry.clampToPitch(500f, 400f, 400f, 300f, 20f)
        assertEquals(380f, x)
        assertEquals(280f, y)
    }

    @Test
    fun distance_isZeroForSamePoint() {
        assertEquals(0f, BoardGeometry.distance(10f, 10f, 10f, 10f), 0.001f)
    }

    @Test
    fun defaultPositions_spreadsPlayersOnPitch() {
        val players = listOf(
            BoardPlayer(1, "A", 1, 0f, 0f),
            BoardPlayer(2, "B", 2, 0f, 0f),
            BoardPlayer(3, "C", 3, 0f, 0f),
        )
        val laid = BoardGeometry.defaultPositions(PitchType.FOOTBALL_7, 400f, 300f, players)
        assertEquals(3, laid.size)
        laid.forEach { player ->
            assertTrue(player.x in 20f..380f)
            assertTrue(player.y in 20f..280f)
        }
    }
}
