import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favoriteTable } from "./db/schema.js";
import { and, eq } from "drizzle-orm";
import cronJob from "./config/cron.js";

const app = express();
const PORT = ENV.PORT;

// Start the cron job
if (process.env.NODE_ENV === "production") cronJob.start();

app.use(express.json());

app.get("/api/health",(req,res) => {
    return res.status(200).json({message: "OK"})
})

app.post ("/api/favorites", async (req, res) => {

    try {
        const {userId, recipeId, title, image, cookTime, servings} = req.body;

        if(!userId || !recipeId || !title) {
            return res.status(400).json({message: "Missing required fields"})
        }

        const newFavorite = await db.insert(favoriteTable).values({
            userId,
            recipeId,
            title,
            image,
            cookTime,
            servings
        }).returning();

        return res.status(201).json(newFavorite[0]);

    } catch (error) {
        console.error("Error adding favorite:", error);
        return res.status(500).json({message: "Internal server error"})
    }
})

app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
    try {
        const {userId, recipeId} = req.params;

        await db.delete(favoriteTable).where(
            and(
                eq(favoriteTable.userId, userId), 
                eq(favoriteTable.recipeId, parseInt(recipeId))
               )
            );

        return res.status(200).json({message: "Favorite deleted successfully"});
    } catch (error) {
        console.error("Error deleting favorite:", error);
        return res.status(500).json({message: "Internal server error"});
    }
})

app.get("/api/favorites/:userId", async (req, res) => {
    try {
        const {userId} = req.params;

        const favorites = await db.select()
        .from(favoriteTable)
        .where(
            eq(favoriteTable.userId, userId)
        );
    
        return res.status(200).json(favorites);
    } catch (error) {
        console.error("Error fetching favorites:", error);
        return res.status(500).json({message: "Internal server error"});
    }
})

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
