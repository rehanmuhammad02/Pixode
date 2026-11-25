import { mkdir, readFile, writeFile } from "node:fs/promises";
import { scryptSync } from "node:crypto";
const directory = ".browser-test-data";
await mkdir(directory, { recursive: true });
const content = JSON.parse(await readFile("database/content-defaults.json", "utf8"));
const salt = "isolated-browser-salt";
const hash = scryptSync("browser-owner-password-123", salt, 64).toString("hex");
await writeFile(
  `${directory}/studio.json`,
  JSON.stringify({
    content,
    users: [
      {
        id: "browser-owner",
        name: "Test Owner",
        username: "pixode",
        email: "owner@example.com",
        role: "owner",
        hash,
        salt,
        verificationExempt: true,
      },
    ],
  }),
);
