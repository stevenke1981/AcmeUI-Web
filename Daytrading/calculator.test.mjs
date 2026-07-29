import assert from "node:assert/strict";
import calc from "./calculator.js";

const {
  calculateBreakEvenPrice,
  calculateSellPriceForTargetReturn,
  calculateBuyPriceForTargetReturn,
  formatPrice,
  calculateIntradayPnL,
  DEFAULTS,
} = calc;

function assertMoney(value, expected, label = "value") {
  assert.equal(value, expected, `${label} ${value} != ${expected}`);
}

const baseArgs = {
  side: DEFAULTS.side,
  buyPrice: 100,
  sellPrice: 101,
  shareCount: 1000,
  commissionRatePercent: 0.1425,
  commissionDiscount: 2.8,
  minimumFee: 20,
  applyMinimumFee: true,
  taxRatePercent: 0.15,
  targetReturnPercent: 1,
};

const baseline = calculateIntradayPnL(baseArgs);
assert.equal(baseline.valid, true);
assertMoney(baseline.data.buyFee, 40, "buyFee");
assertMoney(baseline.data.sellFee, 40, "sellFee");
assertMoney(baseline.data.tax, 152, "tax");
assertMoney(baseline.data.totalCost, 232, "totalCost");
assertMoney(baseline.data.netProfit, 768, "netProfit");
assert.equal(baseline.data.netReturnRate > 0, true, "positive return rate");

const lossCase = calculateIntradayPnL({ ...baseArgs, sellPrice: 99 });
assertMoney(lossCase.data.netProfit, -1229, "lossNetProfit");
assert.equal(lossCase.data.status, "negative", "loss status");
assert.equal(lossCase.data.summary.includes("預估淨虧"), true, "loss summary direction");

const minFeeCase = calculateIntradayPnL({
  ...baseArgs,
  buyPrice: 1,
  sellPrice: 1.1,
  shareCount: 1,
  minimumFee: 20.5,
  applyMinimumFee: true,
  taxRatePercent: 0,
});
assert.equal(minFeeCase.data.buyFee, 21, "min fee buy rounded");
assert.equal(minFeeCase.data.sellFee, 21, "min fee sell rounded");

const noMinFeeCase = calculateIntradayPnL({
  ...baseArgs,
  buyPrice: 1,
  sellPrice: 2,
  shareCount: 1,
  minimumFee: 20,
  applyMinimumFee: false,
  taxRatePercent: 0.15,
});
assertMoney(noMinFeeCase.data.buyFee, 0, "noMin buyFee");
assertMoney(noMinFeeCase.data.sellFee, 0, "noMin sellFee");

assert.equal(
  /\.?(\d+)\.\d{2}$/.test(formatPrice(100.24)),
  true,
  "formatPrice supports two-decimal breakeven values"
);

const invalidInput = calculateIntradayPnL({
  ...baseArgs,
  buyPrice: 0,
  sellPrice: 101,
  shareCount: 1000,
});
assert.equal(invalidInput.valid, false, "invalid buyPrice");
assert.equal(Boolean(invalidInput.errors.buyPrice), true, "invalid error");

const invalidShareInput = [
  calculateIntradayPnL({ ...baseArgs, shareCount: -1 }),
  calculateIntradayPnL({ ...baseArgs, shareCount: 0 }),
  calculateIntradayPnL({ ...baseArgs, shareCount: 1000.5 }),
  calculateIntradayPnL({ ...baseArgs, shareCount: NaN }),
];
assert.equal(invalidShareInput.every((entry) => !entry.valid), true, "invalid share count cases");
assert.equal(
  invalidShareInput.every((entry) => entry.errors.shareCount.length > 0),
  true,
  "share count error message"
);

const invalidAdvanced = [
  calculateIntradayPnL({ ...baseArgs, commissionRatePercent: "" }),
  calculateIntradayPnL({ ...baseArgs, commissionRatePercent: -1 }),
  calculateIntradayPnL({ ...baseArgs, commissionDiscount: 0 }),
  calculateIntradayPnL({ ...baseArgs, commissionDiscount: 10.1 }),
  calculateIntradayPnL({ ...baseArgs, minimumFee: -0.01 }),
  calculateIntradayPnL({ ...baseArgs, taxRatePercent: -1 }),
];
assert.equal(invalidAdvanced.every((entry) => !entry.valid), true, "invalid advanced inputs");
assert.equal(
  invalidAdvanced[0].errors.commissionRatePercent,
  "券商手續費率必須為大於等於 0 的數字。",
  "invalid commission rate error text"
);
assert.equal(
  invalidAdvanced[2].errors.commissionDiscount,
  "電子下單折扣必須介於 1 到 10 折。",
  "invalid commission discount low error text"
);
assert.equal(
  invalidAdvanced[3].errors.commissionDiscount,
  "電子下單折扣必須介於 1 到 10 折。",
  "invalid commission discount high error text"
);
assert.equal(
  invalidAdvanced[4].errors.minimumFee,
  "每筆最低手續費必須為大於等於 0 的數字。",
  "invalid minimum fee error text"
);
assert.equal(
  invalidAdvanced[5].errors.taxRatePercent,
  "當沖證交稅率必須為大於等於 0 的數字。",
  "invalid tax rate error text"
);

const emptyAdvanced = calculateIntradayPnL({
  ...baseArgs,
  commissionRatePercent: NaN,
});
assert.equal(emptyAdvanced.valid, false, "commission empty invalid");
assert.equal(Boolean(emptyAdvanced.errors.commissionRatePercent), true, "commission empty error");

const reverseDirection = calculateIntradayPnL({ ...baseArgs, side: "sellThenBuy" });
assert.equal(
  reverseDirection.data.netProfit,
  baseline.data.netProfit,
  "reverse direction math same"
);
assert.equal(
  reverseDirection.data.summary.includes("先賣後買"),
  true,
  "reverse direction summary phrase"
);
assert.equal(
  reverseDirection.data.summary.includes("預估淨賺"),
  true,
  "reverse direction summary direction"
);

const targetSellPrice = calculateSellPriceForTargetReturn({
  ...baseArgs,
  sellPrice: undefined,
});
assert.equal(targetSellPrice, 101.24, "default 1% target sell price");
const targetSellResult = calculateIntradayPnL({
  ...baseArgs,
  sellPrice: targetSellPrice,
});
const targetSellPrevious = calculateIntradayPnL({
  ...baseArgs,
  sellPrice: Number((targetSellPrice - 0.01).toFixed(2)),
});
assert.equal(targetSellResult.data.netReturnRate >= 1, true, "target sell reaches 1%");
assert.equal(targetSellPrevious.data.netReturnRate < 1, true, "target sell is cent-minimal");

const targetBuyPrice = calculateBuyPriceForTargetReturn({
  ...baseArgs,
  buyPrice: undefined,
  sellPrice: targetSellPrice,
});
assert.equal(targetBuyPrice, 100, "reverse target buy price");
const targetBuyResult = calculateIntradayPnL({
  ...baseArgs,
  buyPrice: targetBuyPrice,
  sellPrice: targetSellPrice,
});
const targetBuyNext = calculateIntradayPnL({
  ...baseArgs,
  buyPrice: Number((targetBuyPrice + 0.01).toFixed(2)),
  sellPrice: targetSellPrice,
});
assert.equal(targetBuyResult.data.netReturnRate >= 1, true, "target buy reaches 1%");
assert.equal(targetBuyNext.data.netReturnRate < 1, true, "target buy is cent-maximal");

const invalidTarget = calculateIntradayPnL({
  ...baseArgs,
  targetReturnPercent: 0.9,
});
assert.equal(invalidTarget.valid, false, "target below 1% invalid");
assert.equal(
  invalidTarget.errors.targetReturnPercent,
  "目標淨報酬率必須至少為 1%。",
  "target return validation message"
);

const breakeven = calculateBreakEvenPrice(baseArgs);
assert.equal(typeof breakeven === "number", true, "breakeven number");
assert.equal(
  calculateIntradayPnL({ ...baseArgs, sellPrice: breakeven }).data.netProfit >= 0,
  true,
  "breakeven net>=0"
);
assert.equal(
  calculateIntradayPnL({
    ...baseArgs,
    sellPrice: Math.max(0, Number((breakeven - 0.01).toFixed(2))),
  }).data.netProfit <= 0,
  true,
  "breakeven minimality"
);

console.log("calculator.test.mjs passed");
