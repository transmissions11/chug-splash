pragma solidity ^0.7.0;

contract SimpleConstructor {
    uint256 public paramA;

    constructor(
        uint256 _paramA
    ) {
        paramA = _paramA;
    }
}
