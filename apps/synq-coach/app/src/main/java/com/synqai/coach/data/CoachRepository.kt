package com.synqai.coach.data

import com.synqai.coach.data.local.ExerciseSlotEntity
import com.synqai.coach.data.local.LeagueEntity
import com.synqai.coach.data.local.MatchEntity
import com.synqai.coach.data.local.MicrocycleEntity
import com.synqai.coach.data.local.PlayerEntity
import com.synqai.coach.data.local.SynqDatabase
import com.synqai.coach.data.local.TeamProfileEntity
import com.synqai.coach.domain.ExerciseSheetCodec
import com.synqai.coach.domain.LeagueRules
import com.synqai.coach.domain.MicrocycleRules
import com.synqai.coach.domain.PitchType
import com.synqai.coach.domain.SlotType

class CoachRepository(private val db: SynqDatabase) {
    private val teamDao get() = db.teamDao()
    private val microDao get() = db.microcycleDao()
    private val leagueDao get() = db.leagueDao()

    suspend fun ensureTeam(name: String, pitchType: PitchType) {
        if (teamDao.getProfile() == null) {
            teamDao.upsertProfile(TeamProfileEntity(name = name, pitchType = pitchType.name))
        }
    }

    suspend fun getPitchType(): PitchType {
        val profile = teamDao.getProfile()
        return if (profile != null) PitchType.fromKey(profile.pitchType) else PitchType.FOOTBALL_7
    }

    suspend fun updatePitchType(pitchType: PitchType) {
        val profile = teamDao.getProfile() ?: TeamProfileEntity(name = "My team", pitchType = pitchType.name)
        teamDao.upsertProfile(profile.copy(pitchType = pitchType.name))
    }

    suspend fun getPlayers(): List<PlayerEntity> = teamDao.getActivePlayers()

    suspend fun savePlayer(player: PlayerEntity) {
        teamDao.upsertPlayer(player)
    }

    suspend fun deletePlayer(id: Long) = teamDao.deletePlayer(id)

    suspend fun canAddMicrocycle(): Boolean = microDao.count() < MicrocycleRules.MAX_MICROCYCLES

    suspend fun getMicrocycles(): List<MicrocycleEntity> = microDao.getAll()

    suspend fun createMicrocycle(title: String, weekLabel: String): Result<Long> {
        if (!canAddMicrocycle()) return Result.failure(IllegalStateException("max_microcycles"))
        val id = microDao.insert(MicrocycleEntity(title = title, weekLabel = weekLabel))
        val slots = listOf(SlotType.WARMUP, SlotType.MAIN, SlotType.MAIN, SlotType.MAIN, SlotType.COOLDOWN)
        slots.forEachIndexed { index, type ->
            microDao.insertSlot(
                ExerciseSlotEntity(
                    microcycleId = id,
                    slotType = type.name,
                    title = "",
                    notes = "",
                    orderIndex = index,
                    sheetJson = ExerciseSheetCodec.toJson(ExerciseSheetCodec.emptyForSlotType(type)),
                ),
            )
        }
        return Result.success(id)
    }

    suspend fun getSlots(microcycleId: Long) = microDao.getSlots(microcycleId)

    suspend fun updateSlot(slot: ExerciseSlotEntity) = microDao.insertSlot(slot)

    suspend fun getActiveLeague(): LeagueEntity? = leagueDao.getActiveLeague()

    suspend fun createLeague(name: String, seasonLabel: String): Long {
        leagueDao.archiveActive()
        return leagueDao.insertLeague(LeagueEntity(name = name, seasonLabel = seasonLabel))
    }

    suspend fun resetSeason() = leagueDao.archiveActive()

    suspend fun getMatches(leagueId: Long) = leagueDao.getMatches(leagueId)

    suspend fun addMatch(leagueId: Long, opponent: String, isHome: Boolean, scheduledAt: Long): Long =
        leagueDao.insertMatch(
            MatchEntity(
                leagueId = leagueId,
                opponent = opponent,
                isHome = isHome,
                scheduledAt = scheduledAt,
                status = "DRAFT",
            ),
        )

    suspend fun finishMatch(id: Long, home: Int, away: Int) =
        leagueDao.updateResult(id, home, away, "FINISHED")

    suspend fun saveLineup(matchId: Long, playerIds: List<Long>) =
        leagueDao.updateLineup(matchId, playerIds.joinToString(","))
}
