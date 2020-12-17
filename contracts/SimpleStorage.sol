pragma solidity ^0.7.0;

contract SimpleStorage {
    mapping (bytes32 => bytes32) db;

    function put(
        bytes32 _key,
        bytes32 _value
    )
        public
    {
        db[_key] = _value;
    }

    function get(
        bytes32 _key
    )
        public
        view
        returns (
            bytes32
        )
    {
        return db[_key];
    }
}
