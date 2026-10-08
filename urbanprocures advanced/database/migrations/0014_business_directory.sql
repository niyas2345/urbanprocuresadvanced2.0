-- Public business names require explicit consent; no existing profile is opted in.
ALTER TABLE contractors ADD COLUMN directory_visible INTEGER NOT NULL DEFAULT 0 CHECK(directory_visible IN (0,1));
ALTER TABLE vendors ADD COLUMN directory_visible INTEGER NOT NULL DEFAULT 0 CHECK(directory_visible IN (0,1));
