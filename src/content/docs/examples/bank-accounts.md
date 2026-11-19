---
title: "bank_accounts.um"
description: "A bank simulation with a class that holds an array of structs: i64 balances, fees, frozen accounts and counting failures."
---

A bank simulation with a class that holds an array of structs: i64 balances, fees, frozen accounts and counting failures.

Source: [examples/bank_accounts.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/bank_accounts.um)

```um title="bank_accounts.um"
// 構造体の配列を持つ class の銀行シミュレーション。i64 の残高、手数料、凍結口座、失敗の集計。
// expect: 3
// expect: 4
// expect: 71
// expect: 15000
// expect: 5395
// expect: 783
// expect: 4700
// expect: 4000
// expect: 51
// expect: 2

struct Account {
  id: i32;
  balance: i64;
  frozen: bool;
  txCount: i32;
}

struct Tx {
  from: i32;
  to: i32;
  amount: i64;
}

class Bank {
  accounts: Account[] = [];
  failed: i32 = 0;
  fees: i64 = 0;

  open(initial: i64): i32 {
    const id = this.accounts.length as i32;
    this.accounts.push({ id, balance: initial, frozen: false, txCount: 0 });
    return id;
  }

  freeze(id: i32): void {
    this.accounts[id].frozen = true;
  }

  transfer(tx: Tx): bool {
    if (tx.from == tx.to) {
      this.failed++;
      return false;
    }
    const fee: i64 = tx.amount / 100;
    const total = tx.amount + fee;
    if (this.accounts[tx.from].frozen || this.accounts[tx.to].frozen) {
      this.failed++;
      return false;
    }
    if (this.accounts[tx.from].balance < total) {
      this.failed++;
      return false;
    }
    this.accounts[tx.from].balance -= total;
    this.accounts[tx.to].balance += tx.amount;
    this.accounts[tx.from].txCount++;
    this.accounts[tx.to].txCount++;
    this.fees += fee;
    return true;
  }

  totalBalance(): i64 {
    let t: i64 = 0;
    for (const a of this.accounts) {
      t += a.balance;
    }
    return t;
  }
}

export function main(): i32 {
  let bank = new Bank();
  for (let i = 0; i < 5; i++) {
    bank.open(1000 * (i + 1) as i64);
  }
  bank.freeze(3);
  const txs: Tx[] = [
    { from: 0, to: 1, amount: 500 },
    { from: 1, to: 2, amount: 1700 },
    { from: 2, to: 3, amount: 10 },
    { from: 4, to: 0, amount: 5000 },
    { from: 4, to: 0, amount: 4900 },
    { from: 2, to: 2, amount: 1 },
    { from: 3, to: 0, amount: 1 },
  ];
  let okCount = 0;
  for (const t of txs) {
    if (bank.transfer(t)) {
      okCount++;
    }
  }
  print(okCount);
  print(bank.failed);
  print(bank.fees);
  print(bank.totalBalance() + bank.fees);
  for (const a of bank.accounts) {
    print(a.balance);
  }
  print(bank.accounts[0].txCount);
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
3
4
71
15000
5395
783
4700
4000
51
2
```
