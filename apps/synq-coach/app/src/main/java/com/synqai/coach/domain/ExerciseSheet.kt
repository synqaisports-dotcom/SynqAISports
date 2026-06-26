package com.synqai.coach.domain

import org.json.JSONObject

/** Plantilla UEFA / ABR — misma estructura que web `exercise-sheet.ts`. */
data class ExerciseConditionalGrid(
    val conditionalContent: String = "",
    val time: String = "",
    val space: String = "",
    val gameSituation: String = "",
    val coordination: String = "",
)

data class ExerciseSheet(
    val templateVersion: Int = 1,
    val taskType: String = "main",
    val title: String = "",
    val didacticStrategy: String = "",
    val objectives: String = "",
    val conditionalGrid: ExerciseConditionalGrid = ExerciseConditionalGrid(),
    val technicalAction: String = "",
    val tacticalAction: String = "",
    val collectiveContent: String = "",
    val description: String = "",
    val rules: String = "",
    val coachingCues: String = "",
) {
    fun toLegacyTitle(): String = title
    fun toLegacyNotes(): String = description
}

object ExerciseSheetCodec {
    fun emptyForSlotType(slotType: SlotType): ExerciseSheet {
        val taskType = when (slotType) {
            SlotType.WARMUP -> "warmup"
            SlotType.MAIN -> "main"
            SlotType.COOLDOWN -> "cooldown"
        }
        return ExerciseSheet(taskType = taskType)
    }

    fun fromJson(raw: String): ExerciseSheet {
        if (raw.isBlank() || raw == "{}") return ExerciseSheet()
        return try {
            val o = JSONObject(raw)
            val grid = o.optJSONObject("conditionalGrid") ?: JSONObject()
            ExerciseSheet(
                templateVersion = o.optInt("templateVersion", 1),
                taskType = o.optString("taskType", "main"),
                title = o.optString("title", ""),
                didacticStrategy = o.optString("didacticStrategy", ""),
                objectives = o.optString("objectives", ""),
                conditionalGrid = ExerciseConditionalGrid(
                    conditionalContent = grid.optString("conditionalContent", ""),
                    time = grid.optString("time", ""),
                    space = grid.optString("space", ""),
                    gameSituation = grid.optString("gameSituation", ""),
                    coordination = grid.optString("coordination", ""),
                ),
                technicalAction = o.optString("technicalAction", ""),
                tacticalAction = o.optString("tacticalAction", ""),
                collectiveContent = o.optString("collectiveContent", ""),
                description = o.optString("description", ""),
                rules = o.optString("rules", ""),
                coachingCues = o.optString("coachingCues", ""),
            )
        } catch (_: Exception) {
            ExerciseSheet()
        }
    }

    fun toJson(sheet: ExerciseSheet): String {
        val grid = JSONObject().apply {
            put("conditionalContent", sheet.conditionalGrid.conditionalContent)
            put("time", sheet.conditionalGrid.time)
            put("space", sheet.conditionalGrid.space)
            put("gameSituation", sheet.conditionalGrid.gameSituation)
            put("coordination", sheet.conditionalGrid.coordination)
        }
        return JSONObject().apply {
            put("templateVersion", sheet.templateVersion)
            put("taskType", sheet.taskType)
            put("title", sheet.title)
            put("didacticStrategy", sheet.didacticStrategy)
            put("objectives", sheet.objectives)
            put("conditionalGrid", grid)
            put("technicalAction", sheet.technicalAction)
            put("tacticalAction", sheet.tacticalAction)
            put("collectiveContent", sheet.collectiveContent)
            put("description", sheet.description)
            put("rules", sheet.rules)
            put("coachingCues", sheet.coachingCues)
        }.toString()
    }

    fun legacyFromSlot(title: String, notes: String, slotType: SlotType): ExerciseSheet {
        val sheet = emptyForSlotType(slotType)
        return sheet.copy(title = title, description = notes)
    }
}
