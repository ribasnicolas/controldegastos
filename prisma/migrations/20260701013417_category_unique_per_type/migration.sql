-- DropIndex
DROP INDEX IF EXISTS "Category_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_type_key" ON "Category"("name", "type");
