package org.hackastone.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

/**
 * 启动时自动创建 hackastone 库（若不存在），并幂等执行 db/init-tables.sql。
 */
@Component
public class DatabaseSchemaInitializer {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSchemaInitializer.class);

    private final DataSource dataSource;

    @Value("${spring.datasource.url}")
    private String jdbcUrl;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Value("${hackastone.db.auto-init:true}")
    private boolean autoInit;

    @Value("${hackastone.db.auto-create-database:true}")
    private boolean autoCreateDatabase;

    public DatabaseSchemaInitializer(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initializeSchema() {
        if (!autoInit) {
            log.info("数据库自动初始化已关闭 (hackastone.db.auto-init=false)");
            return;
        }
        try {
            if (autoCreateDatabase) {
                ensureDatabaseExists();
            }
            ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
            populator.addScript(new ClassPathResource("db/init-tables.sql"));
            populator.setContinueOnError(true);
            populator.setSeparator(";");
            populator.execute(dataSource);
            migrateUserTableColumns();
            log.info("数据库表结构检查/初始化完成 (db/init-tables.sql)");
        } catch (Exception e) {
            log.error("数据库自动初始化失败，请确认 MySQL 已启动且账号密码正确: {}", e.getMessage());
        }
    }

    /** 为已存在的 ha_user 表补充 email / 昵称唯一索引（幂等） */
    private void migrateUserTableColumns() {
        try (Connection conn = dataSource.getConnection();
             Statement st = conn.createStatement()) {
            if (!tableExists(st, "ha_user")) {
                return;
            }
            if (!columnExists(st, "ha_user", "email")) {
                st.executeUpdate(
                        "ALTER TABLE ha_user ADD COLUMN email VARCHAR(100) NULL COMMENT '邮箱' AFTER username");
                log.info("已为 ha_user 添加 email 列");
            }
            if (!indexExists(st, "ha_user", "uk_email")) {
                st.executeUpdate("ALTER TABLE ha_user ADD UNIQUE KEY uk_email (email)");
            }
            if (!indexExists(st, "ha_user", "uk_nickname")) {
                st.executeUpdate("ALTER TABLE ha_user ADD UNIQUE KEY uk_nickname (nickname)");
            }
        } catch (Exception e) {
            log.warn("ha_user 表结构迁移跳过或失败: {}", e.getMessage());
        }
    }

    private boolean tableExists(Statement st, String table) throws Exception {
        try (ResultSet rs = st.executeQuery(
                "SELECT COUNT(*) AS c FROM information_schema.tables "
                        + "WHERE table_schema = DATABASE() AND table_name = '" + table + "'")) {
            return rs.next() && rs.getInt("c") > 0;
        }
    }

    private boolean columnExists(Statement st, String table, String column) throws Exception {
        try (ResultSet rs = st.executeQuery(
                "SELECT COUNT(*) AS c FROM information_schema.columns "
                        + "WHERE table_schema = DATABASE() AND table_name = '" + table
                        + "' AND column_name = '" + column + "'")) {
            return rs.next() && rs.getInt("c") > 0;
        }
    }

    private boolean indexExists(Statement st, String table, String indexName) throws Exception {
        try (ResultSet rs = st.executeQuery(
                "SELECT COUNT(*) AS c FROM information_schema.statistics "
                        + "WHERE table_schema = DATABASE() AND table_name = '" + table
                        + "' AND index_name = '" + indexName + "'")) {
            return rs.next() && rs.getInt("c") > 0;
        }
    }

    private void ensureDatabaseExists() throws Exception {
        String dbName = extractDatabaseName(jdbcUrl);
        String serverUrl = buildServerJdbcUrl(jdbcUrl);
        try (Connection conn = DriverManager.getConnection(serverUrl, username, password);
             Statement st = conn.createStatement()) {
            st.executeUpdate(
                    "CREATE DATABASE IF NOT EXISTS `" + dbName
                            + "` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            log.info("已确保数据库 {} 存在", dbName);
        }
    }

    /** 从 jdbc:mysql://host:port/dbname?... 解析库名 */
    static String extractDatabaseName(String url) {
        int hostStart = url.indexOf("//");
        if (hostStart < 0) {
            throw new IllegalArgumentException("无效的 JDBC URL: " + url);
        }
        int pathStart = url.indexOf('/', hostStart + 2);
        if (pathStart < 0) {
            throw new IllegalArgumentException("JDBC URL 未指定数据库名: " + url);
        }
        int queryStart = url.indexOf('?', pathStart);
        String dbName = queryStart > 0
                ? url.substring(pathStart + 1, queryStart)
                : url.substring(pathStart + 1);
        if (dbName.isEmpty()) {
            throw new IllegalArgumentException("JDBC URL 未指定数据库名: " + url);
        }
        return dbName;
    }

    /** 去掉库名段，连接到 MySQL 实例本身 */
    static String buildServerJdbcUrl(String url) {
        int hostStart = url.indexOf("//");
        int pathStart = url.indexOf('/', hostStart + 2);
        if (pathStart < 0) {
            return url;
        }
        int queryStart = url.indexOf('?', pathStart);
        String prefix = url.substring(0, pathStart);
        String query = queryStart > 0 ? url.substring(queryStart) : "";
        return prefix + "/" + query;
    }
}
