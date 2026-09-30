import {
  Strategy as JwtStrategy,
  ExtractJwt,
} from "passport-jwt";
import passport from "passport";
import dotenv from "dotenv";
import { findByIdUserService } from "../services/user.service.js";
dotenv.config();

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  audience: ["user"],
  algorithms: ["HS256"],
};

passport.use(
  new JwtStrategy(options, async (payload, done) => {
    try {
      if (!payload.userId) {
        return done(null, false, { message: "Invalid token payload" });
      }

      const user = await findByIdUserService(payload.userId);
      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

export const passportAuthenticateJwt = passport.authenticate("jwt", {
  session: false,
});