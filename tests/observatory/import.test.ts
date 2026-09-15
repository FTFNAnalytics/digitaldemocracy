import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { classifyRelativePath } from "../../scripts/import/classify";

describe("import and validation commands", () => {
  it("fails clearly when the Latin America zip is missing", () => {
    const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/import/cli.ts"], {
      cwd: path.join(import.meta.dirname, "../.."),
      encoding: "utf8",
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Latin_America_Races_and_Briefings.zip");
    expect(result.stderr).toContain("will not invent");
  });

  it("validates fixtures", () => {
    const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/validate/cli.ts", "--fixtures"], {
      cwd: path.join(import.meta.dirname, "../.."),
      encoding: "utf8",
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Fixture validation passed");
  });

  it("imports standalone country packages without the Latin America zip", () => {
    const result = spawnSync(
      process.execPath,
      ["--import", "tsx", "scripts/import/cli.ts", "--countries"],
      {
        cwd: path.join(import.meta.dirname, "../.."),
        encoding: "utf8",
      },
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("import:countries");
    expect(result.stdout).toContain("albania");
  });
});

describe("input classification", () => {
  it("does not treat every JSON file as a country record", () => {
    expect(classifyRelativePath("Data/Build_Status.json").documentType).toBe("build_status");
    expect(classifyRelativePath("Data/polling_context.json").documentType).toBe("polling_context");
    expect(classifyRelativePath("Data/Ecuador.json").documentType).toBe("country_record");
    expect(classifyRelativePath("Briefings/EC-P-1.html").documentType).toBe("office_briefing_html");
    expect(classifyRelativePath("Briefings/nested/EC-P-1.html").documentType).toBe(
      "office_briefing_html",
    );
  });
});
