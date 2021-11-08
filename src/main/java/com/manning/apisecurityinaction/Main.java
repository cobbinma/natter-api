package com.manning.apisecurityinaction;

import java.nio.file.*;

import com.google.common.util.concurrent.*;
import com.manning.apisecurityinaction.controller.*;
import org.dalesbred.Database;
import org.dalesbred.result.EmptyResultException;
import org.h2.jdbcx.JdbcConnectionPool;
import org.json.*;
import spark.*;

import static spark.Spark.*;

public class Main {
    public static void main(String... args) throws Exception {
        var datasource = JdbcConnectionPool.create(
                "jdbc:h2:mem:natter", "natter", "password");
        var database = Database.forDataSource(datasource);
        createTables(database);
        datasource = JdbcConnectionPool.create(
                "jdbc:h2:mem:natter", "natter_api_user", "password");
        database = Database.forDataSource(datasource);

        var spaceController = new SpaceController(database);

        var userController = new UserController(database);
        post("/users", userController::registerUser);

        before(userController::authenticate);

        var rateLimiter = RateLimiter.create(2.0d);

        before((request, response) -> {
            if (!rateLimiter.tryAcquire()) {
                response.header("Retry-After", "2");
                halt(429);
            }
        });

        before(((request, response) -> {
                if (request.requestMethod().equals("POST") &&
                        !"application/json".equals(request.contentType())) {
                    halt(415, new JSONObject().put(
                            "error", "Only application/json supported"
                    ).toString());
                }
        }));

        afterAfter((request, response) -> {
            response.type("application/json;charset=utf-8");
            response.header("X-Content-Type-Options", "nosniff");
            response.header("X-Frame-Options", "DENY");
            response.header("X-XSS-Protection", "0");
            response.header("Cache-Control", "no-store");
            response.header("Content-Security-Policy",
                    "default-src 'none'; frame-ancestors 'none'; sandbox");
            response.header("Server", "");
        });

        post("/spaces", spaceController::createSpace);

        post("/spaces/:spaceId/messages", spaceController::postMessage);

        internalServerError(new JSONObject()
                .put("error", "internal server error").toString());
        notFound(new JSONObject()
                .put("error", "not found").toString());

        exception(IllegalArgumentException.class, Main::badRequest);
        exception(JSONException.class, Main::badRequest);
        exception(EmptyResultException.class,
                (e, request, response) -> response.status(404));
    }

    private static void badRequest(Exception ex,
                                   Request request, Response response) {
        response.status(400);
        response.body(new JSONObject().put("error", ex.getMessage()).toString());
    }

    public static void createTables(Database database) throws Exception {
        var path = Paths.get(
                Main.class.getResource("/schema.sql").toURI());
        database.update(Files.readString(path));
    }
}
