package com.synqai.coach.data.local;

import androidx.annotation.NonNull;
import androidx.room.DatabaseConfiguration;
import androidx.room.InvalidationTracker;
import androidx.room.RoomDatabase;
import androidx.room.RoomOpenHelper;
import androidx.room.migration.AutoMigrationSpec;
import androidx.room.migration.Migration;
import androidx.room.util.DBUtil;
import androidx.room.util.TableInfo;
import androidx.sqlite.db.SupportSQLiteDatabase;
import androidx.sqlite.db.SupportSQLiteOpenHelper;
import java.lang.Class;
import java.lang.Override;
import java.lang.String;
import java.lang.SuppressWarnings;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.annotation.processing.Generated;

@Generated("androidx.room.RoomProcessor")
@SuppressWarnings({"unchecked", "deprecation"})
public final class SynqDatabase_Impl extends SynqDatabase {
  private volatile TeamDao _teamDao;

  private volatile MicrocycleDao _microcycleDao;

  private volatile LeagueDao _leagueDao;

  @Override
  @NonNull
  protected SupportSQLiteOpenHelper createOpenHelper(@NonNull final DatabaseConfiguration config) {
    final SupportSQLiteOpenHelper.Callback _openCallback = new RoomOpenHelper(config, new RoomOpenHelper.Delegate(1) {
      @Override
      public void createAllTables(@NonNull final SupportSQLiteDatabase db) {
        db.execSQL("CREATE TABLE IF NOT EXISTS `team_profile` (`id` INTEGER NOT NULL, `name` TEXT NOT NULL, `pitchType` TEXT NOT NULL, PRIMARY KEY(`id`))");
        db.execSQL("CREATE TABLE IF NOT EXISTS `players` (`id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, `name` TEXT NOT NULL, `jerseyNumber` INTEGER NOT NULL, `position` TEXT NOT NULL, `active` INTEGER NOT NULL)");
        db.execSQL("CREATE TABLE IF NOT EXISTS `microcycles` (`id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, `title` TEXT NOT NULL, `weekLabel` TEXT NOT NULL, `createdAt` INTEGER NOT NULL)");
        db.execSQL("CREATE TABLE IF NOT EXISTS `exercise_slots` (`id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, `microcycleId` INTEGER NOT NULL, `slotType` TEXT NOT NULL, `title` TEXT NOT NULL, `notes` TEXT NOT NULL, `orderIndex` INTEGER NOT NULL)");
        db.execSQL("CREATE TABLE IF NOT EXISTS `leagues` (`id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, `name` TEXT NOT NULL, `seasonLabel` TEXT NOT NULL, `archived` INTEGER NOT NULL)");
        db.execSQL("CREATE TABLE IF NOT EXISTS `matches` (`id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, `leagueId` INTEGER NOT NULL, `opponent` TEXT NOT NULL, `isHome` INTEGER NOT NULL, `scheduledAt` INTEGER NOT NULL, `homeScore` INTEGER NOT NULL, `awayScore` INTEGER NOT NULL, `status` TEXT NOT NULL, `lineupPlayerIds` TEXT NOT NULL)");
        db.execSQL("CREATE TABLE IF NOT EXISTS room_master_table (id INTEGER PRIMARY KEY,identity_hash TEXT)");
        db.execSQL("INSERT OR REPLACE INTO room_master_table (id,identity_hash) VALUES(42, 'b69af3256aab5e674b9b1f371c8f2c64')");
      }

      @Override
      public void dropAllTables(@NonNull final SupportSQLiteDatabase db) {
        db.execSQL("DROP TABLE IF EXISTS `team_profile`");
        db.execSQL("DROP TABLE IF EXISTS `players`");
        db.execSQL("DROP TABLE IF EXISTS `microcycles`");
        db.execSQL("DROP TABLE IF EXISTS `exercise_slots`");
        db.execSQL("DROP TABLE IF EXISTS `leagues`");
        db.execSQL("DROP TABLE IF EXISTS `matches`");
        final List<? extends RoomDatabase.Callback> _callbacks = mCallbacks;
        if (_callbacks != null) {
          for (RoomDatabase.Callback _callback : _callbacks) {
            _callback.onDestructiveMigration(db);
          }
        }
      }

      @Override
      public void onCreate(@NonNull final SupportSQLiteDatabase db) {
        final List<? extends RoomDatabase.Callback> _callbacks = mCallbacks;
        if (_callbacks != null) {
          for (RoomDatabase.Callback _callback : _callbacks) {
            _callback.onCreate(db);
          }
        }
      }

      @Override
      public void onOpen(@NonNull final SupportSQLiteDatabase db) {
        mDatabase = db;
        internalInitInvalidationTracker(db);
        final List<? extends RoomDatabase.Callback> _callbacks = mCallbacks;
        if (_callbacks != null) {
          for (RoomDatabase.Callback _callback : _callbacks) {
            _callback.onOpen(db);
          }
        }
      }

      @Override
      public void onPreMigrate(@NonNull final SupportSQLiteDatabase db) {
        DBUtil.dropFtsSyncTriggers(db);
      }

      @Override
      public void onPostMigrate(@NonNull final SupportSQLiteDatabase db) {
      }

      @Override
      @NonNull
      public RoomOpenHelper.ValidationResult onValidateSchema(
          @NonNull final SupportSQLiteDatabase db) {
        final HashMap<String, TableInfo.Column> _columnsTeamProfile = new HashMap<String, TableInfo.Column>(3);
        _columnsTeamProfile.put("id", new TableInfo.Column("id", "INTEGER", true, 1, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsTeamProfile.put("name", new TableInfo.Column("name", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsTeamProfile.put("pitchType", new TableInfo.Column("pitchType", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        final HashSet<TableInfo.ForeignKey> _foreignKeysTeamProfile = new HashSet<TableInfo.ForeignKey>(0);
        final HashSet<TableInfo.Index> _indicesTeamProfile = new HashSet<TableInfo.Index>(0);
        final TableInfo _infoTeamProfile = new TableInfo("team_profile", _columnsTeamProfile, _foreignKeysTeamProfile, _indicesTeamProfile);
        final TableInfo _existingTeamProfile = TableInfo.read(db, "team_profile");
        if (!_infoTeamProfile.equals(_existingTeamProfile)) {
          return new RoomOpenHelper.ValidationResult(false, "team_profile(com.synqai.coach.data.local.TeamProfileEntity).\n"
                  + " Expected:\n" + _infoTeamProfile + "\n"
                  + " Found:\n" + _existingTeamProfile);
        }
        final HashMap<String, TableInfo.Column> _columnsPlayers = new HashMap<String, TableInfo.Column>(5);
        _columnsPlayers.put("id", new TableInfo.Column("id", "INTEGER", true, 1, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsPlayers.put("name", new TableInfo.Column("name", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsPlayers.put("jerseyNumber", new TableInfo.Column("jerseyNumber", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsPlayers.put("position", new TableInfo.Column("position", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsPlayers.put("active", new TableInfo.Column("active", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        final HashSet<TableInfo.ForeignKey> _foreignKeysPlayers = new HashSet<TableInfo.ForeignKey>(0);
        final HashSet<TableInfo.Index> _indicesPlayers = new HashSet<TableInfo.Index>(0);
        final TableInfo _infoPlayers = new TableInfo("players", _columnsPlayers, _foreignKeysPlayers, _indicesPlayers);
        final TableInfo _existingPlayers = TableInfo.read(db, "players");
        if (!_infoPlayers.equals(_existingPlayers)) {
          return new RoomOpenHelper.ValidationResult(false, "players(com.synqai.coach.data.local.PlayerEntity).\n"
                  + " Expected:\n" + _infoPlayers + "\n"
                  + " Found:\n" + _existingPlayers);
        }
        final HashMap<String, TableInfo.Column> _columnsMicrocycles = new HashMap<String, TableInfo.Column>(4);
        _columnsMicrocycles.put("id", new TableInfo.Column("id", "INTEGER", true, 1, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsMicrocycles.put("title", new TableInfo.Column("title", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsMicrocycles.put("weekLabel", new TableInfo.Column("weekLabel", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsMicrocycles.put("createdAt", new TableInfo.Column("createdAt", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        final HashSet<TableInfo.ForeignKey> _foreignKeysMicrocycles = new HashSet<TableInfo.ForeignKey>(0);
        final HashSet<TableInfo.Index> _indicesMicrocycles = new HashSet<TableInfo.Index>(0);
        final TableInfo _infoMicrocycles = new TableInfo("microcycles", _columnsMicrocycles, _foreignKeysMicrocycles, _indicesMicrocycles);
        final TableInfo _existingMicrocycles = TableInfo.read(db, "microcycles");
        if (!_infoMicrocycles.equals(_existingMicrocycles)) {
          return new RoomOpenHelper.ValidationResult(false, "microcycles(com.synqai.coach.data.local.MicrocycleEntity).\n"
                  + " Expected:\n" + _infoMicrocycles + "\n"
                  + " Found:\n" + _existingMicrocycles);
        }
        final HashMap<String, TableInfo.Column> _columnsExerciseSlots = new HashMap<String, TableInfo.Column>(6);
        _columnsExerciseSlots.put("id", new TableInfo.Column("id", "INTEGER", true, 1, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsExerciseSlots.put("microcycleId", new TableInfo.Column("microcycleId", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsExerciseSlots.put("slotType", new TableInfo.Column("slotType", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsExerciseSlots.put("title", new TableInfo.Column("title", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsExerciseSlots.put("notes", new TableInfo.Column("notes", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsExerciseSlots.put("orderIndex", new TableInfo.Column("orderIndex", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        final HashSet<TableInfo.ForeignKey> _foreignKeysExerciseSlots = new HashSet<TableInfo.ForeignKey>(0);
        final HashSet<TableInfo.Index> _indicesExerciseSlots = new HashSet<TableInfo.Index>(0);
        final TableInfo _infoExerciseSlots = new TableInfo("exercise_slots", _columnsExerciseSlots, _foreignKeysExerciseSlots, _indicesExerciseSlots);
        final TableInfo _existingExerciseSlots = TableInfo.read(db, "exercise_slots");
        if (!_infoExerciseSlots.equals(_existingExerciseSlots)) {
          return new RoomOpenHelper.ValidationResult(false, "exercise_slots(com.synqai.coach.data.local.ExerciseSlotEntity).\n"
                  + " Expected:\n" + _infoExerciseSlots + "\n"
                  + " Found:\n" + _existingExerciseSlots);
        }
        final HashMap<String, TableInfo.Column> _columnsLeagues = new HashMap<String, TableInfo.Column>(4);
        _columnsLeagues.put("id", new TableInfo.Column("id", "INTEGER", true, 1, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsLeagues.put("name", new TableInfo.Column("name", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsLeagues.put("seasonLabel", new TableInfo.Column("seasonLabel", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsLeagues.put("archived", new TableInfo.Column("archived", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        final HashSet<TableInfo.ForeignKey> _foreignKeysLeagues = new HashSet<TableInfo.ForeignKey>(0);
        final HashSet<TableInfo.Index> _indicesLeagues = new HashSet<TableInfo.Index>(0);
        final TableInfo _infoLeagues = new TableInfo("leagues", _columnsLeagues, _foreignKeysLeagues, _indicesLeagues);
        final TableInfo _existingLeagues = TableInfo.read(db, "leagues");
        if (!_infoLeagues.equals(_existingLeagues)) {
          return new RoomOpenHelper.ValidationResult(false, "leagues(com.synqai.coach.data.local.LeagueEntity).\n"
                  + " Expected:\n" + _infoLeagues + "\n"
                  + " Found:\n" + _existingLeagues);
        }
        final HashMap<String, TableInfo.Column> _columnsMatches = new HashMap<String, TableInfo.Column>(9);
        _columnsMatches.put("id", new TableInfo.Column("id", "INTEGER", true, 1, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsMatches.put("leagueId", new TableInfo.Column("leagueId", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsMatches.put("opponent", new TableInfo.Column("opponent", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsMatches.put("isHome", new TableInfo.Column("isHome", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsMatches.put("scheduledAt", new TableInfo.Column("scheduledAt", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsMatches.put("homeScore", new TableInfo.Column("homeScore", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsMatches.put("awayScore", new TableInfo.Column("awayScore", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsMatches.put("status", new TableInfo.Column("status", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsMatches.put("lineupPlayerIds", new TableInfo.Column("lineupPlayerIds", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        final HashSet<TableInfo.ForeignKey> _foreignKeysMatches = new HashSet<TableInfo.ForeignKey>(0);
        final HashSet<TableInfo.Index> _indicesMatches = new HashSet<TableInfo.Index>(0);
        final TableInfo _infoMatches = new TableInfo("matches", _columnsMatches, _foreignKeysMatches, _indicesMatches);
        final TableInfo _existingMatches = TableInfo.read(db, "matches");
        if (!_infoMatches.equals(_existingMatches)) {
          return new RoomOpenHelper.ValidationResult(false, "matches(com.synqai.coach.data.local.MatchEntity).\n"
                  + " Expected:\n" + _infoMatches + "\n"
                  + " Found:\n" + _existingMatches);
        }
        return new RoomOpenHelper.ValidationResult(true, null);
      }
    }, "b69af3256aab5e674b9b1f371c8f2c64", "6c946df2a6c61a989adb45b27b8b4f2e");
    final SupportSQLiteOpenHelper.Configuration _sqliteConfig = SupportSQLiteOpenHelper.Configuration.builder(config.context).name(config.name).callback(_openCallback).build();
    final SupportSQLiteOpenHelper _helper = config.sqliteOpenHelperFactory.create(_sqliteConfig);
    return _helper;
  }

  @Override
  @NonNull
  protected InvalidationTracker createInvalidationTracker() {
    final HashMap<String, String> _shadowTablesMap = new HashMap<String, String>(0);
    final HashMap<String, Set<String>> _viewTables = new HashMap<String, Set<String>>(0);
    return new InvalidationTracker(this, _shadowTablesMap, _viewTables, "team_profile","players","microcycles","exercise_slots","leagues","matches");
  }

  @Override
  public void clearAllTables() {
    super.assertNotMainThread();
    final SupportSQLiteDatabase _db = super.getOpenHelper().getWritableDatabase();
    try {
      super.beginTransaction();
      _db.execSQL("DELETE FROM `team_profile`");
      _db.execSQL("DELETE FROM `players`");
      _db.execSQL("DELETE FROM `microcycles`");
      _db.execSQL("DELETE FROM `exercise_slots`");
      _db.execSQL("DELETE FROM `leagues`");
      _db.execSQL("DELETE FROM `matches`");
      super.setTransactionSuccessful();
    } finally {
      super.endTransaction();
      _db.query("PRAGMA wal_checkpoint(FULL)").close();
      if (!_db.inTransaction()) {
        _db.execSQL("VACUUM");
      }
    }
  }

  @Override
  @NonNull
  protected Map<Class<?>, List<Class<?>>> getRequiredTypeConverters() {
    final HashMap<Class<?>, List<Class<?>>> _typeConvertersMap = new HashMap<Class<?>, List<Class<?>>>();
    _typeConvertersMap.put(TeamDao.class, TeamDao_Impl.getRequiredConverters());
    _typeConvertersMap.put(MicrocycleDao.class, MicrocycleDao_Impl.getRequiredConverters());
    _typeConvertersMap.put(LeagueDao.class, LeagueDao_Impl.getRequiredConverters());
    return _typeConvertersMap;
  }

  @Override
  @NonNull
  public Set<Class<? extends AutoMigrationSpec>> getRequiredAutoMigrationSpecs() {
    final HashSet<Class<? extends AutoMigrationSpec>> _autoMigrationSpecsSet = new HashSet<Class<? extends AutoMigrationSpec>>();
    return _autoMigrationSpecsSet;
  }

  @Override
  @NonNull
  public List<Migration> getAutoMigrations(
      @NonNull final Map<Class<? extends AutoMigrationSpec>, AutoMigrationSpec> autoMigrationSpecs) {
    final List<Migration> _autoMigrations = new ArrayList<Migration>();
    return _autoMigrations;
  }

  @Override
  public TeamDao teamDao() {
    if (_teamDao != null) {
      return _teamDao;
    } else {
      synchronized(this) {
        if(_teamDao == null) {
          _teamDao = new TeamDao_Impl(this);
        }
        return _teamDao;
      }
    }
  }

  @Override
  public MicrocycleDao microcycleDao() {
    if (_microcycleDao != null) {
      return _microcycleDao;
    } else {
      synchronized(this) {
        if(_microcycleDao == null) {
          _microcycleDao = new MicrocycleDao_Impl(this);
        }
        return _microcycleDao;
      }
    }
  }

  @Override
  public LeagueDao leagueDao() {
    if (_leagueDao != null) {
      return _leagueDao;
    } else {
      synchronized(this) {
        if(_leagueDao == null) {
          _leagueDao = new LeagueDao_Impl(this);
        }
        return _leagueDao;
      }
    }
  }
}
