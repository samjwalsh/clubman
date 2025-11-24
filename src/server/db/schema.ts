import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  pgEnum,
  integer,
  jsonb,
  decimal,
  date,
  time,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  admin: boolean().default(false)
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const userRelations = relations(user, ({ many }) => ({
  account: many(account),
  session: many(session),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

// Enums
export const roleEnum = pgEnum("role", ["owner", "admin", "coach", "member"]);
export const membershipStatusEnum = pgEnum("membership_status", [
  "active",
  "suspended",
  "pending",
]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "booked",
  "attended",
  "cancelled",
  "no_show",
]);
export const bookingTypeEnum = pgEnum("booking_type", [
  "user_booking",
  "coaching_session",
  "maintenance",
  "block",
]);
export const ruleTypeEnum = pgEnum("rule_type", [
  "max_duration",
  "cancellation_window",
  "guest_fee",
]);
export const participantStatusEnum = pgEnum("participant_status", [
  "registered",
  "waitlist",
  "cancelled",
]);
export const dayOfWeekEnum = pgEnum("day_of_week", [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

// Tables

export const club = pgTable("club", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const membership = pgTable("membership", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  clubId: text("club_id")
    .notNull()
    .references(() => club.id, { onDelete: "cascade" }),
  role: roleEnum("role").notNull(),
  status: membershipStatusEnum("status").notNull().default("active"),
  joinedAt: timestamp("joined_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const facilityType = pgTable("facility_type", {
  id: text("id").primaryKey(),
  clubId: text("club_id")
    .notNull()
    .references(() => club.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  bookingIntervalMinutes: integer("booking_interval_minutes")
    .default(30)
    .notNull(),
});

export const facility = pgTable("facility", {
  id: text("id").primaryKey(),
  clubId: text("club_id")
    .notNull()
    .references(() => club.id, { onDelete: "cascade" }),
  facilityTypeId: text("facility_type_id")
    .notNull()
    .references(() => facilityType.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  capacity: integer("capacity").default(1).notNull(),
  metadata: jsonb("metadata"),
});

export const facilityOpeningHours = pgTable("facility_opening_hours", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  facilityTypeId: text("facility_type_id")
    .references(() => facilityType.id, { onDelete: "cascade" }),
  facilityId: text("facility_id")
    .references(() => facility.id, { onDelete: "cascade" }),
  dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
});

export const facilityClosure = pgTable("facility_closure", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  clubId: text("club_id")
    .notNull()
    .references(() => club.id, { onDelete: "cascade" }),
  facilityTypeId: text("facility_type_id")
    .references(() => facilityType.id, { onDelete: "cascade" }),
  facilityId: text("facility_id")
    .references(() => facility.id, { onDelete: "cascade" }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason"),
});

export const booking = pgTable("booking", {
  id: text("id").primaryKey(),
  clubId: text("club_id")
    .notNull()
    .references(() => club.id, { onDelete: "cascade" }),
  facilityId: text("facility_id")
    .notNull()
    .references(() => facility.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: bookingStatusEnum("status").notNull(),
  type: bookingTypeEnum("type").notNull(),
  checkInAt: timestamp("check_in_at"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const bookingParticipant = pgTable("booking_participant", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookingId: text("booking_id")
    .notNull()
    .references(() => booking.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "set null" }),
  guestName: text("guest_name"),
  guestEmail: text("guest_email"),
  isGuest: boolean("is_guest").default(false).notNull(),
});

export const bookingRule = pgTable("booking_rule", {
  id: text("id").primaryKey(),
  clubId: text("club_id")
    .notNull()
    .references(() => club.id, { onDelete: "cascade" }),
  facilityTypeId: text("facility_type_id").references(() => facilityType.id, {
    onDelete: "cascade",
  }),
  type: ruleTypeEnum("type").notNull(),
  value: jsonb("value").notNull(),
});

export const waitlist = pgTable("waitlist", {
  id: text("id").primaryKey(),
  clubId: text("club_id")
    .notNull()
    .references(() => club.id, { onDelete: "cascade" }),
  facilityId: text("facility_id")
    .notNull()
    .references(() => facility.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const coachingTemplate = pgTable("coaching_template", {
  id: text("id").primaryKey(),
  clubId: text("club_id")
    .notNull()
    .references(() => club.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  defaultDurationMinutes: integer("default_duration_minutes").notNull(),
  defaultCapacity: integer("default_capacity").notNull(),
  defaultPrice: decimal("default_price").notNull(),
});

export const coachingSession = pgTable("coaching_session", {
  id: text("id").primaryKey(),
  clubId: text("club_id")
    .notNull()
    .references(() => club.id, { onDelete: "cascade" }),
  templateId: text("template_id")
    .notNull()
    .references(() => coachingTemplate.id, { onDelete: "cascade" }),
  coachId: text("coach_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  capacity: integer("capacity").notNull(),
  price: decimal("price").notNull(),
});

export const sessionParticipant = pgTable("session_participant", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => coachingSession.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: participantStatusEnum("status").notNull(),
  checkInAt: timestamp("check_in_at"),
  joinedAt: timestamp("joined_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Relations

export const clubRelations = relations(club, ({ many }) => ({
  memberships: many(membership),
  facilities: many(facility),
  facilityTypes: many(facilityType),
  bookings: many(booking),
  bookingRules: many(bookingRule),
  coachingTemplates: many(coachingTemplate),
  coachingSessions: many(coachingSession),
}));

export const membershipRelations = relations(membership, ({ one }) => ({
  user: one(user, { fields: [membership.userId], references: [user.id] }),
  club: one(club, { fields: [membership.clubId], references: [club.id] }),
}));

export const facilityTypeRelations = relations(facilityType, ({ one, many }) => ({
  club: one(club, { fields: [facilityType.clubId], references: [club.id] }),
  facilities: many(facility),
  rules: many(bookingRule),
  openingHours: many(facilityOpeningHours),
  closures: many(facilityClosure),
}));

export const facilityRelations = relations(facility, ({ one, many }) => ({
  club: one(club, { fields: [facility.clubId], references: [club.id] }),
  type: one(facilityType, {
    fields: [facility.facilityTypeId],
    references: [facilityType.id],
  }),
  bookings: many(booking),
  waitlist: many(waitlist),
  openingHours: many(facilityOpeningHours),
  closures: many(facilityClosure),
}));

export const bookingRelations = relations(booking, ({ one, many }) => ({
  club: one(club, { fields: [booking.clubId], references: [club.id] }),
  facility: one(facility, {
    fields: [booking.facilityId],
    references: [facility.id],
  }),
  user: one(user, { fields: [booking.userId], references: [user.id] }),
  participants: many(bookingParticipant),
}));

export const facilityOpeningHoursRelations = relations(facilityOpeningHours, ({ one }) => ({
  facilityType: one(facilityType, {
    fields: [facilityOpeningHours.facilityTypeId],
    references: [facilityType.id],
  }),
  facility: one(facility, {
    fields: [facilityOpeningHours.facilityId],
    references: [facility.id],
  }),
}));

export const facilityClosureRelations = relations(facilityClosure, ({ one }) => ({
  club: one(club, { fields: [facilityClosure.clubId], references: [club.id] }),
  facilityType: one(facilityType, {
    fields: [facilityClosure.facilityTypeId],
    references: [facilityType.id],
  }),
  facility: one(facility, {
    fields: [facilityClosure.facilityId],
    references: [facility.id],
  }),
}));

export const bookingParticipantRelations = relations(bookingParticipant, ({ one }) => ({
  booking: one(booking, {
    fields: [bookingParticipant.bookingId],
    references: [booking.id],
  }),
  user: one(user, {
    fields: [bookingParticipant.userId],
    references: [user.id],
  }),
}));

export const bookingRuleRelations = relations(bookingRule, ({ one }) => ({
  club: one(club, { fields: [bookingRule.clubId], references: [club.id] }),
  facilityType: one(facilityType, {
    fields: [bookingRule.facilityTypeId],
    references: [facilityType.id],
  }),
}));

export const waitlistRelations = relations(waitlist, ({ one }) => ({
  club: one(club, { fields: [waitlist.clubId], references: [club.id] }),
  facility: one(facility, {
    fields: [waitlist.facilityId],
    references: [facility.id],
  }),
  user: one(user, { fields: [waitlist.userId], references: [user.id] }),
}));

export const coachingTemplateRelations = relations(
  coachingTemplate,
  ({ one, many }) => ({
    club: one(club, { fields: [coachingTemplate.clubId], references: [club.id] }),
    sessions: many(coachingSession),
  }),
);

export const coachingSessionRelations = relations(
  coachingSession,
  ({ one, many }) => ({
    club: one(club, { fields: [coachingSession.clubId], references: [club.id] }),
    template: one(coachingTemplate, {
      fields: [coachingSession.templateId],
      references: [coachingTemplate.id],
    }),
    coach: one(user, { fields: [coachingSession.coachId], references: [user.id] }),
    participants: many(sessionParticipant),
  }),
);

export const sessionParticipantRelations = relations(
  sessionParticipant,
  ({ one }) => ({
    session: one(coachingSession, {
      fields: [sessionParticipant.sessionId],
      references: [coachingSession.id],
    }),
    user: one(user, {
      fields: [sessionParticipant.userId],
      references: [user.id],
    }),
  }),
);
