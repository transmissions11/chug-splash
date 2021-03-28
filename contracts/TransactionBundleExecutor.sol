// SPDX-License-Identifier: MIT
pragma solidity >0.5.0 <0.8.0;

/**
 * @title TransactionBundleExecutor
 * This contract provides a way to execute a series of transactions in a safe manner. Users only
 * need to approve (i.e., sign) a single 32 byte hash in order to enable the execution of as
 * many transactions as they'd like. The hash that a user approves consists of:
 *  hash(nextTransactionHash, isCreate, target, gasLimit, data)
 * Where the (isCreate, target, gasLimit, data) describe the action to be taken and where
 * (nextTransactionHash) is the hash of the next transaction to be executed. It's a hash onion!
 */
contract TransactionBundleExecutor {
    // Address that can approve new transaction bundles.
    address public owner;

    // Hash of the next transaction/action that can be executed by this contract. See above
    // contract description for additional information.
    bytes32 public nextTransactionHash;

    /**
     * @param _owner Initial owner address.
     */
    constructor(
        address _owner
    ) {
        owner = _owner;
    }

    /**
     * Marks a function as only callable by the owner.
     */
    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "TransactionBundleExecutor: sender is not owner"
        );
        _;
    }

    /**
     * Changes the owner. Only callable by the current owner.
     * @param _owner New owner address.
     */
    function setOwner(
        address _owner
    )
        public
        onlyOwner
    {
        owner = _owner;
    }

    /**
     * Sets the parent transaction bundle hash. Will completely wipe any reference to any previous
     * transaction bundle hashes. Any transactions in previous bundles will no longer be executable
     * by this contract (unless you put the transactions into a new batch). Only callable by the
     * owner of this contract.
     * @param _transactionBundleHash Top level hash of the transasction bundle. See contract
     *  description for a more detailed explanation of this hash and its structure.
     */
    function approveTransactionBundle(
        bytes32 _transactionBundleHash
    )
        public
        onlyOwner
    {
        nextTransactionHash = _transactionBundleHash;
    }

    /**
     * Causes this contract to execute an action. Anyone can call this function. Only one
     * particular action can be taken at any given time. This action is determined by the
     * currently stored `nextTransactionHash` variable. See contract description for more detail.
     * @param _nextTransactionHash New value for `nextTransactionHash` once this action has been
     *  executed.
     * @param _isCreate Whether or not this action is a contract creation.
     * @param _target Address to call during this action. Field is ignored if `_isCreate` is true.
     * @param _gasLimit Gas provided to this action. User must provide at least this much gas.
     * @param _data Data to send to the contract or initcode to use during the contract creation.
     */
    function executeTransaction(
        bytes32 _nextTransactionHash,
        bool _isCreate,
        address _target,
        uint256 _gasLimit,
        bytes memory _data
    )
        public
    {
        // Make sure the user has provided enough gas to perform this action successfully.
        require(
            gasleft() > _gasLimit,
            "TransactionBundleExecutor: sender didn't supply enough gas"
        );

        // Make sure the action being executed is actually the next available action.
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

        // Perform the relevant action.
        if (_isCreate) {
            assembly {
                pop(create(0, add(_data, 0x20), mload(_data)))
            }
        } else {
            _target.call(_data);
        }

        // Update the commitment for the next available action.
        nextTransactionHash = _nextTransactionHash;
    }
}
