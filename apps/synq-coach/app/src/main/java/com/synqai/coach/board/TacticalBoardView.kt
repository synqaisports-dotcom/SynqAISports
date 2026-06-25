package com.synqai.coach.board

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View
import com.synqai.coach.domain.PitchType
import kotlin.math.min

class TacticalBoardView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
) : View(context, attrs) {

    enum class Tool { MOVE, ARROW }

    var pitchType: PitchType = PitchType.FOOTBALL_7
        set(value) {
            field = value
            invalidate()
        }

    var tool: Tool = Tool.MOVE
    var onStateChanged: (() -> Unit)? = null

    private val players = mutableListOf<BoardPlayer>()
    private val arrows = mutableListOf<BoardArrow>()
    private val undoStack = mutableListOf<Pair<List<BoardPlayer>, List<BoardArrow>>>()

    private var dragIndex = -1
    private var arrowStartX = 0f
    private var arrowStartY = 0f
    private var drawingArrow = false

    private val pitchPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#2D6A4F")
        style = Paint.Style.FILL
    }
    private val linePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#95D5B2")
        style = Paint.Style.STROKE
        strokeWidth = 4f
    }
    private val playerPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#1B4332")
        style = Paint.Style.FILL
    }
    private val playerTextPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.WHITE
        textAlign = Paint.Align.CENTER
        textSize = 36f
    }
    private val arrowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#FBBF24")
        style = Paint.Style.STROKE
        strokeWidth = 8f
        strokeCap = Paint.Cap.ROUND
    }

    fun setPlayersFromRoster(roster: List<BoardPlayer>) {
        pushUndo()
        players.clear()
        players.addAll(roster)
        if (width > 0 && height > 0) {
            layoutPlayers()
        }
        invalidate()
        onStateChanged?.invoke()
    }

    fun getPlayers(): List<BoardPlayer> = players.toList()

    fun getArrows(): List<BoardArrow> = arrows.toList()

    fun clearDrawings() {
        pushUndo()
        arrows.clear()
        invalidate()
        onStateChanged?.invoke()
    }

    fun undo() {
        if (undoStack.isEmpty()) return
        val (p, a) = undoStack.removeAt(undoStack.lastIndex)
        players.clear()
        players.addAll(p)
        arrows.clear()
        arrows.addAll(a)
        invalidate()
        onStateChanged?.invoke()
    }

    private fun pushUndo() {
        undoStack.add(players.map { it.copy() } to arrows.map { it.copy() })
        if (undoStack.size > 30) undoStack.removeAt(0)
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        if (players.isNotEmpty()) layoutPlayers()
    }

    private fun layoutPlayers() {
        val laid = BoardGeometry.defaultPositions(pitchType, width.toFloat(), height.toFloat(), players)
        players.clear()
        players.addAll(laid)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val w = width.toFloat()
        val h = height.toFloat()
        val margin = min(w, h) * 0.04f

        canvas.drawRoundRect(margin, margin, w - margin, h - margin, 24f, 24f, pitchPaint)
        canvas.drawLine(w / 2, margin, w / 2, h - margin, linePaint)
        canvas.drawCircle(w / 2, h / 2, min(w, h) * 0.12f, linePaint)

        arrows.forEach { drawArrow(canvas, it.startX, it.startY, it.endX, it.endY) }
        if (drawingArrow) {
            drawArrow(canvas, arrowStartX, arrowStartY, previewEndX, previewEndY)
        }

        val radius = min(w, h) * 0.045f
        players.forEach { player ->
            canvas.drawCircle(player.x, player.y, radius, playerPaint)
            val label = if (player.jerseyNumber > 0) player.jerseyNumber.toString() else "?"
            playerTextPaint.textSize = radius * 1.1f
            canvas.drawText(label, player.x, player.y + radius * 0.35f, playerTextPaint)
        }
    }

    private var previewEndX = 0f
    private var previewEndY = 0f

    private fun drawArrow(canvas: Canvas, startX: Float, startY: Float, endX: Float, endY: Float) {
        val path = Path()
        path.moveTo(startX, startY)
        path.lineTo(endX, endY)
        canvas.drawPath(path, arrowPaint)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        val x = event.x
        val y = event.y
        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                if (tool == Tool.ARROW) {
                    arrowStartX = x
                    arrowStartY = y
                    previewEndX = x
                    previewEndY = y
                    drawingArrow = true
                    return true
                }
                dragIndex = players.indexOfFirst {
                    BoardGeometry.distance(it.x, it.y, x, y) < min(width, height) * 0.06f
                }
                if (dragIndex >= 0) pushUndo()
                return true
            }
            MotionEvent.ACTION_MOVE -> {
                if (tool == Tool.ARROW && drawingArrow) {
                    previewEndX = x
                    previewEndY = y
                    invalidate()
                    return true
                }
                if (dragIndex >= 0) {
                    val (cx, cy) = BoardGeometry.clampToPitch(x, y, width.toFloat(), height.toFloat(), min(width, height) * 0.06f)
                    val p = players[dragIndex]
                    players[dragIndex] = p.copy(x = cx, y = cy)
                    invalidate()
                    onStateChanged?.invoke()
                }
                return true
            }
            MotionEvent.ACTION_UP -> {
                if (tool == Tool.ARROW && drawingArrow) {
                    pushUndo()
                    arrows.add(BoardArrow(arrowStartX, arrowStartY, x, y))
                    drawingArrow = false
                    invalidate()
                    onStateChanged?.invoke()
                    return true
                }
                dragIndex = -1
                return true
            }
        }
        return super.onTouchEvent(event)
    }
}
