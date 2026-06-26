package com.synqai.coach.board

import com.synqai.coach.domain.PitchType
import kotlin.math.hypot

data class BoardPlayer(
    val id: Long,
    val name: String,
    val jerseyNumber: Int,
    var x: Float,
    var y: Float,
)

data class BoardArrow(
    val startX: Float,
    val startY: Float,
    val endX: Float,
    val endY: Float,
)

data class BoardState(
    val pitchType: PitchType = PitchType.FOOTBALL_7,
    val players: List<BoardPlayer> = emptyList(),
    val arrows: List<BoardArrow> = emptyList(),
)

object BoardGeometry {
    fun clampToPitch(x: Float, y: Float, width: Float, height: Float, margin: Float): Pair<Float, Float> {
        val left = margin
        val top = margin
        val right = width - margin
        val bottom = height - margin
        return x.coerceIn(left, right) to y.coerceIn(top, bottom)
    }

    fun distance(x1: Float, y1: Float, x2: Float, y2: Float): Float =
        hypot((x2 - x1).toDouble(), (y2 - y1).toDouble()).toFloat()

    fun defaultPositions(pitchType: PitchType, width: Float, height: Float, players: List<BoardPlayer>): List<BoardPlayer> {
        if (players.isEmpty()) return emptyList()
        val margin = minOf(width, height) * 0.08f
        val cols = when (pitchType) {
            PitchType.FOOTBALL_11 -> 4
            PitchType.FOOTBALL_7 -> 3
            PitchType.FUTSAL -> 2
        }
        val usableW = width - margin * 2
        val usableH = height - margin * 2
        return players.mapIndexed { index, player ->
            val row = index / cols
            val col = index % cols
            val x = margin + usableW * (col + 0.5f) / cols
            val y = margin + usableH * (0.25f + 0.5f * row / maxOf(1, (players.size - 1) / cols))
            player.copy(x = x, y = y)
        }
    }
}
