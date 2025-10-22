-- CreateTable
CREATE TABLE "favorite_movies" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tmdb_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "poster_path" TEXT,
    "overview" TEXT,
    "rating" DOUBLE PRECISION,
    "release_date" TIMESTAMP(3),
    "vote_average" DOUBLE PRECISION,
    "vote_count" INTEGER,
    "share_uuid" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "favorite_movies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favorite_movies_user_id_tmdb_id_key" ON "favorite_movies"("user_id", "tmdb_id");

-- AddForeignKey
ALTER TABLE "favorite_movies" ADD CONSTRAINT "favorite_movies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

