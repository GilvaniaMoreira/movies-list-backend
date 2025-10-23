-- CreateTable
CREATE TABLE "FavoriteList" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "shareToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteListMovie" (
    "id" SERIAL NOT NULL,
    "favoriteListId" INTEGER NOT NULL,
    "tmdbMovieId" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteListMovie_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteList_userId_key" ON "FavoriteList"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteList_shareToken_key" ON "FavoriteList"("shareToken");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteListMovie_favoriteListId_tmdbMovieId_key" ON "FavoriteListMovie"("favoriteListId", "tmdbMovieId");

-- AddForeignKey
ALTER TABLE "FavoriteList" ADD CONSTRAINT "FavoriteList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteListMovie" ADD CONSTRAINT "FavoriteListMovie_favoriteListId_fkey" FOREIGN KEY ("favoriteListId") REFERENCES "FavoriteList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
