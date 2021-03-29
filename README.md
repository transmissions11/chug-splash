# chugsplash

`chugsplash` is a smart contract deployment system that attempts to optimize for security and usibility.
At the core of `chugsplash` is the idea that a deployment or upgrade should take the form of a single atomic action.
This ideology asks that developers design their deployments carefully and deliberately.
The reward of doing so is a massive boost to both operational security and long-term maintainability.

## What makes chugsplash useful?
`chugsplash` is built around the `TransactionBundleExecutor`, a tiny (but special) smart contract.
The `TransactionBundleExecutor` allows an `owner` to "approve" a bundle of transactions for execution.
Approving the bundle takes the form of making a very simple contract call to:

```solidity
function approveTransactionBundle(
    bytes32 _transactionBundleHash
)
    public
    onlyOwner
{
    ...
}
```

`_transactionBundleHash` is a simple 32 byte hash onion commitment to a series of transactions.
We generate the hash onion from the bundle of transactions that you want to execute during the course of your deployment.
We'll get to the exact details of the hash onion in a second.
First we need to describe the basic `chugsplash` transaction structure.

The `TransactionBundleExecutor` can either *create a new contract* or *call an existing contract*.
Each "action" that you want to take is defined by:

```ts
{
    to: null | hex,
    data: hex,
    gasLimit: number
}
```

If `to` is null, then this action is a deployment.
Otherwise, this is a contract call.
Since we there's no such thing as `null` in solidity, we add an extra field `_isCreate`.
The final transaction structure is summed up well by the function used to execute them:

```solidity
function executeTransaction(
    bytes32 _nextTransactionHash, // one sec, we'll get to this!
    bool _isCreate, // are we creating or calling?
    address _target, // if calling, who to call?
    uint256 _gasLimit, // how much gas should we be using
    bytes memory _data // data to send to call or to deploy with
)
    public
{
    ...
}
```

You call this function over and over and the whole deployment happens.
But how does the contract know that the thing being executed was actually authenticated?
With the magic of ~hash onions~.

So let's actually explain hash onions.
Note first that when you want to execute a transaction via this function you have to pass the following check:

```solidity
require(
    keccak256(
        abi.encode(
            _nextTransactionHash,
            _isCreate,
            _target,
            _gasLimit,
            _data
        )
    ) == nextTransactionHash,
    "TransactionBundleExecutor: computed transaction hash does not match next transaction hash"
);
```

Pretty straightforward here, we're committing to the hash of the transaction.
As long as the hash matches up we'll know that this is exactly what the user wanted to execute.
Here's where that extra `nextTransactionHash` thing comes in.
The initial `transactionBundleHash` is a commitment to both the transaction and to a hash of the *next* transaction (+ a hash for the next next transaction, and so on).
Once a transaction passes the above check, we simply run:

```solidity
nextTransactionHash = _nextTransactionHash;
```

And repeat the process all over again!
Eventually some transaction will have a terminating hash (0x00000... is the recommended one).
At this point there's no way to generate a valid transaction to be executed and the bundle is finished.
Nice.
