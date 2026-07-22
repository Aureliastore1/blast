import { renderTemplate } from "@/modules/template/template.service";

describe("renderTemplate", () => {
  it("replaces known variables", () => {
    const result = renderTemplate("Halo {nama}, nomor Anda {nomor}", { nama: "Budi", nomor: "6281234" });
    expect(result).toBe("Halo Budi, nomor Anda 6281234");
  });

  it("leaves unknown variables untouched", () => {
    const result = renderTemplate("Halo {nama}, {unknown}", { nama: "Budi" });
    expect(result).toBe("Halo Budi, {unknown}");
  });
});
