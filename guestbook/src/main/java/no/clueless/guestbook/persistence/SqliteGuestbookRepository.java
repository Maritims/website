package no.clueless.guestbook.persistence;

import no.clueless.guestbook.Entry;

import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class SqliteGuestbookRepository {
    private final String connectionString;

    public SqliteGuestbookRepository(String connectionString) {
        if (connectionString == null || connectionString.isBlank()) {
            throw new IllegalArgumentException("connectionString cannot be null or blank");
        }
        this.connectionString = connectionString;
    }

    public void initialize() {
        try (var connection = DriverManager.getConnection(connectionString);
             var statement = connection.createStatement()) {
            statement.execute("""
                    CREATE TABLE IF NOT EXISTS entries (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        isApproved BOOLEAN NOT NULL DEFAULT FALSE,
                        name TEXT,
                        message TEXT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                   )
                   """);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to setup database", e);
        }
    }

    public Entry getEntry(int id) {
        try (var connection = DriverManager.getConnection(connectionString)) {
            var sql       = "SELECT isApproved, name, message, timestamp FROM entries WHERE id = ?";
            var statement = connection.prepareStatement(sql);
            statement.setInt(1, id);
            var resultSet = statement.executeQuery();

            if (resultSet.next()) {
                var isApproved = resultSet.getBoolean("isApproved");
                var name       = resultSet.getString("name");
                var message    = resultSet.getString("message");
                var timestamp  = resultSet.getTimestamp("timestamp").toLocalDateTime();
                return Entry.existingEntry(id, isApproved, name, message, timestamp);
            } else {
                return null;
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to connect to database", e);
        }
    }

    public List<Entry> getApprovedEntries(int pageNumber, int pageSize, String orderByColumn, String orderDirection) {
        if (pageSize < 1) {
            throw new IllegalArgumentException("pageSize must be greater than 0");
        }
        if (pageNumber < 0) {
            throw new IllegalArgumentException("pageNumber must be greater than or equal to 0");
        }
        if (orderByColumn == null || orderByColumn.isBlank()) {
            throw new IllegalArgumentException("orderByColumn cannot be null or blank");
        }
        if (!orderByColumn.equalsIgnoreCase("id") && !orderByColumn.equalsIgnoreCase("name") && !orderByColumn.equalsIgnoreCase("message") && !orderByColumn.equalsIgnoreCase("timestamp")) {
            throw new IllegalArgumentException("orderByColumn must be either id, name, message or timestamp");
        }
        if (orderDirection == null || !orderDirection.equalsIgnoreCase("asc") && !orderDirection.equalsIgnoreCase("desc")) {
            throw new IllegalArgumentException("orderDirection must be either asc or desc");
        }

        var entries = new ArrayList<Entry>();

        try (var connection = DriverManager.getConnection(connectionString)) {
            var sql       = String.format("SELECT id, isApproved, name, message, timestamp FROM entries WHERE isApproved = true ORDER BY %s %s LIMIT %d OFFSET %d", orderByColumn, orderDirection, pageSize, pageSize * pageNumber);
            var statement = connection.createStatement();
            var resultSet = statement.executeQuery(sql);

            while (resultSet.next()) {
                entries.add(Entry.existingEntry(
                        resultSet.getInt("id"),
                        resultSet.getBoolean("isApproved"),
                        resultSet.getString("name"),
                        resultSet.getString("message"),
                        resultSet.getTimestamp("timestamp").toLocalDateTime()
                ));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to connect to database", e);
        }

        return entries;
    }

    public Entry createEntry(Entry entry) {
        if (entry == null) {
            throw new IllegalArgumentException("entry cannot be null");
        }

        try (var connection = DriverManager.getConnection(connectionString)) {
            var sql       = "INSERT INTO entries(isApproved, name, message) VALUES(?, ?, ?)";
            var statement = connection.prepareStatement(sql);
            statement.setBoolean(1, false);
            statement.setString(2, entry.getName());
            statement.setString(3, entry.getMessage());
            statement.executeUpdate();

            var id = statement.getGeneratedKeys().getInt(1);
            return getEntry(id);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to connect to database", e);
        }
    }
}
