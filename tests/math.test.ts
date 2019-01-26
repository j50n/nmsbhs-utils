import test from "tape";

test("Math test", (t: test.Test) => {
  t.equal(4, 2 + 2);
  t.true(5 > 2 + 2);

  t.end();
});
