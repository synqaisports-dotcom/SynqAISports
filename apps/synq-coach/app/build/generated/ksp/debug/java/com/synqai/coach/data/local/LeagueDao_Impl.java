package com.synqai.coach.data.local;

import android.database.Cursor;
import android.os.CancellationSignal;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.room.CoroutinesRoom;
import androidx.room.EntityInsertionAdapter;
import androidx.room.RoomDatabase;
import androidx.room.RoomSQLiteQuery;
import androidx.room.SharedSQLiteStatement;
import androidx.room.util.CursorUtil;
import androidx.room.util.DBUtil;
import androidx.sqlite.db.SupportSQLiteStatement;
import java.lang.Class;
import java.lang.Exception;
import java.lang.Long;
import java.lang.Object;
import java.lang.Override;
import java.lang.String;
import java.lang.SuppressWarnings;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Callable;
import javax.annotation.processing.Generated;
import kotlin.Unit;
import kotlin.coroutines.Continuation;

@Generated("androidx.room.RoomProcessor")
@SuppressWarnings({"unchecked", "deprecation"})
public final class LeagueDao_Impl implements LeagueDao {
  private final RoomDatabase __db;

  private final EntityInsertionAdapter<LeagueEntity> __insertionAdapterOfLeagueEntity;

  private final EntityInsertionAdapter<MatchEntity> __insertionAdapterOfMatchEntity;

  private final SharedSQLiteStatement __preparedStmtOfArchiveActive;

  private final SharedSQLiteStatement __preparedStmtOfUpdateResult;

  private final SharedSQLiteStatement __preparedStmtOfUpdateLineup;

  public LeagueDao_Impl(@NonNull final RoomDatabase __db) {
    this.__db = __db;
    this.__insertionAdapterOfLeagueEntity = new EntityInsertionAdapter<LeagueEntity>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "INSERT OR ABORT INTO `leagues` (`id`,`name`,`seasonLabel`,`archived`) VALUES (nullif(?, 0),?,?,?)";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final LeagueEntity entity) {
        statement.bindLong(1, entity.getId());
        statement.bindString(2, entity.getName());
        statement.bindString(3, entity.getSeasonLabel());
        final int _tmp = entity.getArchived() ? 1 : 0;
        statement.bindLong(4, _tmp);
      }
    };
    this.__insertionAdapterOfMatchEntity = new EntityInsertionAdapter<MatchEntity>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "INSERT OR ABORT INTO `matches` (`id`,`leagueId`,`opponent`,`isHome`,`scheduledAt`,`homeScore`,`awayScore`,`status`,`lineupPlayerIds`) VALUES (nullif(?, 0),?,?,?,?,?,?,?,?)";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final MatchEntity entity) {
        statement.bindLong(1, entity.getId());
        statement.bindLong(2, entity.getLeagueId());
        statement.bindString(3, entity.getOpponent());
        final int _tmp = entity.isHome() ? 1 : 0;
        statement.bindLong(4, _tmp);
        statement.bindLong(5, entity.getScheduledAt());
        statement.bindLong(6, entity.getHomeScore());
        statement.bindLong(7, entity.getAwayScore());
        statement.bindString(8, entity.getStatus());
        statement.bindString(9, entity.getLineupPlayerIds());
      }
    };
    this.__preparedStmtOfArchiveActive = new SharedSQLiteStatement(__db) {
      @Override
      @NonNull
      public String createQuery() {
        final String _query = "UPDATE leagues SET archived = 1 WHERE archived = 0";
        return _query;
      }
    };
    this.__preparedStmtOfUpdateResult = new SharedSQLiteStatement(__db) {
      @Override
      @NonNull
      public String createQuery() {
        final String _query = "UPDATE matches SET homeScore = ?, awayScore = ?, status = ? WHERE id = ?";
        return _query;
      }
    };
    this.__preparedStmtOfUpdateLineup = new SharedSQLiteStatement(__db) {
      @Override
      @NonNull
      public String createQuery() {
        final String _query = "UPDATE matches SET lineupPlayerIds = ? WHERE id = ?";
        return _query;
      }
    };
  }

  @Override
  public Object insertLeague(final LeagueEntity league,
      final Continuation<? super Long> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Long>() {
      @Override
      @NonNull
      public Long call() throws Exception {
        __db.beginTransaction();
        try {
          final Long _result = __insertionAdapterOfLeagueEntity.insertAndReturnId(league);
          __db.setTransactionSuccessful();
          return _result;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @Override
  public Object insertMatch(final MatchEntity match, final Continuation<? super Long> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Long>() {
      @Override
      @NonNull
      public Long call() throws Exception {
        __db.beginTransaction();
        try {
          final Long _result = __insertionAdapterOfMatchEntity.insertAndReturnId(match);
          __db.setTransactionSuccessful();
          return _result;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @Override
  public Object archiveActive(final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        final SupportSQLiteStatement _stmt = __preparedStmtOfArchiveActive.acquire();
        try {
          __db.beginTransaction();
          try {
            _stmt.executeUpdateDelete();
            __db.setTransactionSuccessful();
            return Unit.INSTANCE;
          } finally {
            __db.endTransaction();
          }
        } finally {
          __preparedStmtOfArchiveActive.release(_stmt);
        }
      }
    }, $completion);
  }

  @Override
  public Object updateResult(final long id, final int home, final int away, final String status,
      final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        final SupportSQLiteStatement _stmt = __preparedStmtOfUpdateResult.acquire();
        int _argIndex = 1;
        _stmt.bindLong(_argIndex, home);
        _argIndex = 2;
        _stmt.bindLong(_argIndex, away);
        _argIndex = 3;
        _stmt.bindString(_argIndex, status);
        _argIndex = 4;
        _stmt.bindLong(_argIndex, id);
        try {
          __db.beginTransaction();
          try {
            _stmt.executeUpdateDelete();
            __db.setTransactionSuccessful();
            return Unit.INSTANCE;
          } finally {
            __db.endTransaction();
          }
        } finally {
          __preparedStmtOfUpdateResult.release(_stmt);
        }
      }
    }, $completion);
  }

  @Override
  public Object updateLineup(final long id, final String ids,
      final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        final SupportSQLiteStatement _stmt = __preparedStmtOfUpdateLineup.acquire();
        int _argIndex = 1;
        _stmt.bindString(_argIndex, ids);
        _argIndex = 2;
        _stmt.bindLong(_argIndex, id);
        try {
          __db.beginTransaction();
          try {
            _stmt.executeUpdateDelete();
            __db.setTransactionSuccessful();
            return Unit.INSTANCE;
          } finally {
            __db.endTransaction();
          }
        } finally {
          __preparedStmtOfUpdateLineup.release(_stmt);
        }
      }
    }, $completion);
  }

  @Override
  public Object getActiveLeague(final Continuation<? super LeagueEntity> $completion) {
    final String _sql = "SELECT * FROM leagues WHERE archived = 0 LIMIT 1";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 0);
    final CancellationSignal _cancellationSignal = DBUtil.createCancellationSignal();
    return CoroutinesRoom.execute(__db, false, _cancellationSignal, new Callable<LeagueEntity>() {
      @Override
      @Nullable
      public LeagueEntity call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "id");
          final int _cursorIndexOfName = CursorUtil.getColumnIndexOrThrow(_cursor, "name");
          final int _cursorIndexOfSeasonLabel = CursorUtil.getColumnIndexOrThrow(_cursor, "seasonLabel");
          final int _cursorIndexOfArchived = CursorUtil.getColumnIndexOrThrow(_cursor, "archived");
          final LeagueEntity _result;
          if (_cursor.moveToFirst()) {
            final long _tmpId;
            _tmpId = _cursor.getLong(_cursorIndexOfId);
            final String _tmpName;
            _tmpName = _cursor.getString(_cursorIndexOfName);
            final String _tmpSeasonLabel;
            _tmpSeasonLabel = _cursor.getString(_cursorIndexOfSeasonLabel);
            final boolean _tmpArchived;
            final int _tmp;
            _tmp = _cursor.getInt(_cursorIndexOfArchived);
            _tmpArchived = _tmp != 0;
            _result = new LeagueEntity(_tmpId,_tmpName,_tmpSeasonLabel,_tmpArchived);
          } else {
            _result = null;
          }
          return _result;
        } finally {
          _cursor.close();
          _statement.release();
        }
      }
    }, $completion);
  }

  @Override
  public Object getMatches(final long leagueId,
      final Continuation<? super List<MatchEntity>> $completion) {
    final String _sql = "SELECT * FROM matches WHERE leagueId = ? ORDER BY scheduledAt";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    _statement.bindLong(_argIndex, leagueId);
    final CancellationSignal _cancellationSignal = DBUtil.createCancellationSignal();
    return CoroutinesRoom.execute(__db, false, _cancellationSignal, new Callable<List<MatchEntity>>() {
      @Override
      @NonNull
      public List<MatchEntity> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "id");
          final int _cursorIndexOfLeagueId = CursorUtil.getColumnIndexOrThrow(_cursor, "leagueId");
          final int _cursorIndexOfOpponent = CursorUtil.getColumnIndexOrThrow(_cursor, "opponent");
          final int _cursorIndexOfIsHome = CursorUtil.getColumnIndexOrThrow(_cursor, "isHome");
          final int _cursorIndexOfScheduledAt = CursorUtil.getColumnIndexOrThrow(_cursor, "scheduledAt");
          final int _cursorIndexOfHomeScore = CursorUtil.getColumnIndexOrThrow(_cursor, "homeScore");
          final int _cursorIndexOfAwayScore = CursorUtil.getColumnIndexOrThrow(_cursor, "awayScore");
          final int _cursorIndexOfStatus = CursorUtil.getColumnIndexOrThrow(_cursor, "status");
          final int _cursorIndexOfLineupPlayerIds = CursorUtil.getColumnIndexOrThrow(_cursor, "lineupPlayerIds");
          final List<MatchEntity> _result = new ArrayList<MatchEntity>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final MatchEntity _item;
            final long _tmpId;
            _tmpId = _cursor.getLong(_cursorIndexOfId);
            final long _tmpLeagueId;
            _tmpLeagueId = _cursor.getLong(_cursorIndexOfLeagueId);
            final String _tmpOpponent;
            _tmpOpponent = _cursor.getString(_cursorIndexOfOpponent);
            final boolean _tmpIsHome;
            final int _tmp;
            _tmp = _cursor.getInt(_cursorIndexOfIsHome);
            _tmpIsHome = _tmp != 0;
            final long _tmpScheduledAt;
            _tmpScheduledAt = _cursor.getLong(_cursorIndexOfScheduledAt);
            final int _tmpHomeScore;
            _tmpHomeScore = _cursor.getInt(_cursorIndexOfHomeScore);
            final int _tmpAwayScore;
            _tmpAwayScore = _cursor.getInt(_cursorIndexOfAwayScore);
            final String _tmpStatus;
            _tmpStatus = _cursor.getString(_cursorIndexOfStatus);
            final String _tmpLineupPlayerIds;
            _tmpLineupPlayerIds = _cursor.getString(_cursorIndexOfLineupPlayerIds);
            _item = new MatchEntity(_tmpId,_tmpLeagueId,_tmpOpponent,_tmpIsHome,_tmpScheduledAt,_tmpHomeScore,_tmpAwayScore,_tmpStatus,_tmpLineupPlayerIds);
            _result.add(_item);
          }
          return _result;
        } finally {
          _cursor.close();
          _statement.release();
        }
      }
    }, $completion);
  }

  @NonNull
  public static List<Class<?>> getRequiredConverters() {
    return Collections.emptyList();
  }
}
