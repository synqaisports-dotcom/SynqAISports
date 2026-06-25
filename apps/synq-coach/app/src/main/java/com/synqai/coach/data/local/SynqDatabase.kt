package com.synqai.coach.data.local

import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.RoomDatabase
import android.content.Context
import androidx.room.Room

@Entity(tableName = "team_profile")
data class TeamProfileEntity(
    @PrimaryKey val id: Int = 1,
    val name: String,
    val pitchType: String,
)

@Entity(tableName = "players")
data class PlayerEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val jerseyNumber: Int,
    val position: String,
    val active: Boolean = true,
)

@Entity(tableName = "microcycles")
data class MicrocycleEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val weekLabel: String,
    val createdAt: Long = System.currentTimeMillis(),
)

@Entity(tableName = "exercise_slots")
data class ExerciseSlotEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val microcycleId: Long,
    val slotType: String,
    val title: String,
    val notes: String,
    val orderIndex: Int,
)

@Entity(tableName = "leagues")
data class LeagueEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val seasonLabel: String,
    val archived: Boolean = false,
)

@Entity(tableName = "matches")
data class MatchEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val leagueId: Long,
    val opponent: String,
    val isHome: Boolean,
    val scheduledAt: Long,
    val homeScore: Int = 0,
    val awayScore: Int = 0,
    val status: String,
    val lineupPlayerIds: String = "",
)

@Dao
interface TeamDao {
    @Query("SELECT * FROM team_profile WHERE id = 1")
    suspend fun getProfile(): TeamProfileEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertProfile(profile: TeamProfileEntity)

    @Query("SELECT * FROM players WHERE active = 1 ORDER BY jerseyNumber")
    suspend fun getActivePlayers(): List<PlayerEntity>

    @Query("SELECT * FROM players ORDER BY jerseyNumber")
    suspend fun getAllPlayers(): List<PlayerEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertPlayer(player: PlayerEntity): Long

    @Query("DELETE FROM players WHERE id = :id")
    suspend fun deletePlayer(id: Long)
}

@Dao
interface MicrocycleDao {
    @Query("SELECT COUNT(*) FROM microcycles")
    suspend fun count(): Int

    @Query("SELECT * FROM microcycles ORDER BY createdAt DESC")
    suspend fun getAll(): List<MicrocycleEntity>

    @Insert
    suspend fun insert(microcycle: MicrocycleEntity): Long

    @Query("DELETE FROM microcycles WHERE id = :id")
    suspend fun delete(id: Long)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSlot(slot: ExerciseSlotEntity)

    @Query("SELECT * FROM exercise_slots WHERE microcycleId = :id ORDER BY orderIndex")
    suspend fun getSlots(id: Long): List<ExerciseSlotEntity>
}

@Dao
interface LeagueDao {
    @Query("SELECT * FROM leagues WHERE archived = 0 LIMIT 1")
    suspend fun getActiveLeague(): LeagueEntity?

    @Insert
    suspend fun insertLeague(league: LeagueEntity): Long

    @Query("UPDATE leagues SET archived = 1 WHERE archived = 0")
    suspend fun archiveActive()

    @Query("SELECT * FROM matches WHERE leagueId = :leagueId ORDER BY scheduledAt")
    suspend fun getMatches(leagueId: Long): List<MatchEntity>

    @Insert
    suspend fun insertMatch(match: MatchEntity): Long

    @Query("UPDATE matches SET homeScore = :home, awayScore = :away, status = :status WHERE id = :id")
    suspend fun updateResult(id: Long, home: Int, away: Int, status: String)

    @Query("UPDATE matches SET lineupPlayerIds = :ids WHERE id = :id")
    suspend fun updateLineup(id: Long, ids: String)
}

@Database(
    entities = [
        TeamProfileEntity::class,
        PlayerEntity::class,
        MicrocycleEntity::class,
        ExerciseSlotEntity::class,
        LeagueEntity::class,
        MatchEntity::class,
    ],
    version = 1,
    exportSchema = false,
)
abstract class SynqDatabase : RoomDatabase() {
    abstract fun teamDao(): TeamDao
    abstract fun microcycleDao(): MicrocycleDao
    abstract fun leagueDao(): LeagueDao

    companion object {
        @Volatile private var instance: SynqDatabase? = null

        fun get(context: Context): SynqDatabase =
            instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context.applicationContext,
                    SynqDatabase::class.java,
                    "synq_coach.db",
                ).build().also { instance = it }
            }
    }
}
