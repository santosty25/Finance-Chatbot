import { integer, numeric, pgTable, serial, varchar} from "drizzle-orm/pg-core"
/*
This represents schemas for the database
*/

// budget schema
export const Budgets = pgTable("budgets", {
    id: serial("id").primaryKey(),
    name: varchar("name").notNull(),
    amount: varchar("amount").notNull(),
    icon: varchar("icon"),
    createdBy: varchar("createdBy").notNull(),
})

// income schema
export const Incomes = pgTable("incomes", {
    id: serial("id").primaryKey(),
    name: varchar("name").notNull(),
    amount: varchar("amount").notNull(),
    icon: varchar("icon"),
    createdBy: varchar("createdBy").notNull(),
})

// expenses schema
export const Expenses = pgTable("expenses", {
    id: serial("id").primaryKey(),
    name: varchar("name").notNull(),
    amount: varchar("amount").notNull(),
    budgetId: integer("budgetId").references(() => Budgets.id),
    createdAt: varchar("createdAt").notNull(),
})