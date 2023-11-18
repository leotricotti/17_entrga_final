import passport from "passport";
import jwt from "passport-jwt";
import local from "passport-local";
import config from "./config.js";
import GitHubStrategy from "passport-github2";
import { sessionsService, usersService } from "../repository/index.js";
import { createHash } from "../utils/index.js";

// Inicializar servicios
const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJwt = jwt.ExtractJwt;

// Inicializar variables
const ADMIN_ID = config.admin.EMAIL;
const JWT_SECRET = config.jwt.SECRET;
const ADMIN_PASSWORD = config.admin.PASSWORD;

/**
 * Inicializa la estrategia de autenticación JWT.
 */
const initializeJwtStrategy = () => {
  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: JWT_SECRET,
      },
      async (jwt_payload, done) => {
        try {
          const user = await usersService.getOneUser(jwt_payload.user.username);
          if (!user) {
            return done(error);
          } else {
            return done(null, jwt_payload);
          }
        } catch (error) {
          done(error);
        }
      }
    )
  );
};

/**
 * Inicializa la estrategia de registro de usuarios.
 */
const initializeRegisterStrategy = () => {
  passport.use(
    "register",
    new LocalStrategy(
      {
        session: false,
        passReqToCallback: true,
        usernameField: "email",
      },
      async (req, email, password, done) => {
        const { first_name, last_name } = req.body;
        const role =
          email === ADMIN_ID || password === ADMIN_PASSWORD ? "admin" : "user";
        try {
          const user = await usersService.getOneUser(email);
          if (!user.length === 0) {
            req.logger.error(
              `Error de autenticación. Usuario ya existe ${new Date().toLocaleString()}`
            );
            return done(null, false, {
              message: "Usuario ya existe",
            });
          } else {
            const newUser = {
              first_name,
              last_name,
              email,
              password: createHash(password),
              role,
            };
            const result = await sessionsService.signupUser(newUser);
            req.logger.info(
              `Usuario creado con éxito ${new Date().toLocaleString()}`
            );
            return done(null, result);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

/**
 * Serializa y deserializa usuarios.
 */
passport.serializeUser((user, done) => {
  done(null, user[0].email);
});

passport.deserializeUser(async (id, done) => {
  const user = await usersService.getOneUser(id);
  done(null, user);
});

/**
 * Configura passport para loguear usuarios con GitHub.
 */
const initializeGithubStrategy = () => {
  passport.use(
    "github",
    new GitHubStrategy(
      {
        session: false,
        clientID: "Iv1.7be0043c6885f5d1",
        clientSecret: "57564a13a31c648f5f04c19dbbf5d5dfaddb1208",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await usersService.getOneUser(profile?.emails[0]?.value);
          if (user.length === 0) {
            const newUser = {
              first_name: profile.displayName.split(" ")[0],
              last_name: profile.displayName.split(" ")[1],
              email: profile?.emails[0]?.value,
              password: createHash("123456"),
            };
            const result = await sessionsService.signupUser(newUser);
            return done(null, result);
          } else {
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

export {
  initializeJwtStrategy,
  initializeRegisterStrategy,
  initializeGithubStrategy,
};
