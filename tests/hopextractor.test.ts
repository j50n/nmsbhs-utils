import test from "tape";
import { Platform, Wealth } from "../src/bh/coordinates";
import { extractHop } from "../src/bh/hopextractor";

test("hop parse", t => {
  const testrow: string[] = [
    "PS4",
    "01 Euclid",
    "Beykova Nebula",
    "Ekielis XI",
    "0C6F:007B:0EFD:0079",
    "3183",
    "123",
    "3837",
    "Delta",
    "Yellow",
    "Korvax",
    "3",
    "2",
    "  848,155 ",
    "Travels to:",
    "Mopdorf",
    "Unecho",
    "0BAF:0080:0F5A:0004",
    "2991",
    "128",
    "3930",
    "Delta",
    "Yellow",
    "Vy'keen",
    "2",
    "1",
    "  842,493 ",
    "  (5,662)",
    "Hermit-5",
    ""
  ];

  const hop = extractHop(testrow);

  t.equal(hop.platform, Platform.PS4, "platform matches");
  t.equal(hop.galaxy, "01 Euclid", "galaxy matches");

  t.equal(hop.blackhole.region, "Beykova Nebula", "black hole region matches");
  t.equal(
    hop.blackhole.coords.toString(),
    "0C6F:007B:0EFD:0079",
    "black hole coordinates match"
  );
  t.equal(hop.blackhole.system, "Ekielis XI", "black hole system matches");
  t.equal(hop.blackhole.economy, Wealth.Middle, "black hole wealth matches");

  t.equal(hop.exit.region, "Mopdorf", "exit region matches");
  t.equal(
    hop.exit.coords.toString(),
    "0BAF:0080:0F5A:0004",
    "exit coordinates match"
  );
  t.equal(hop.exit.system, "Unecho", "exit system matches");
  t.equal(hop.exit.economy, Wealth.Low, "exit economy matches");

  console.error(JSON.stringify(hop));

  t.end();
});
