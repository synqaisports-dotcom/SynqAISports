package com.synqai.coach.board

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View
import kotlin.math.min

/** Canvas simplificado para dibujo de ejercicios (conos, flechas). */
class ExerciseBoardView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
) : View(context, attrs) {

    private val strokes = mutableListOf<Path>()
    private var currentPath: Path? = null

    private val strokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#22C55E")
        style = Paint.Style.STROKE
        strokeWidth = 6f
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }

    fun clear() {
        strokes.clear()
        currentPath = null
        invalidate()
    }

    fun hasDrawing(): Boolean = strokes.isNotEmpty()

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        canvas.drawColor(Color.parseColor("#0F172A"))
        strokes.forEach { canvas.drawPath(it, strokePaint) }
        currentPath?.let { canvas.drawPath(it, strokePaint) }
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                currentPath = Path().apply { moveTo(event.x, event.y) }
                return true
            }
            MotionEvent.ACTION_MOVE -> {
                currentPath?.lineTo(event.x, event.y)
                invalidate()
                return true
            }
            MotionEvent.ACTION_UP -> {
                currentPath?.let { strokes.add(it) }
                currentPath = null
                invalidate()
                return true
            }
        }
        return super.onTouchEvent(event)
    }
}
