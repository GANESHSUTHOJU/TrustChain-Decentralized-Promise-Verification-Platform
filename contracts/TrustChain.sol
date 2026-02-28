// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TrustChain {
    struct Promise {
        uint id;
        string title;
        string description;
        string category;
        address creator;
        uint timestamp;
        bool fulfilled;
    }

    Promise[] public promises;
    uint public nextId;

    event PromiseCreated(uint id, string title, address creator);
    event PromiseFulfilled(uint id);

    function createPromise(string memory title, string memory description, string memory category) public {
        promises.push(Promise({
            id: nextId,
            title: title,
            description: description,
            category: category,
            creator: msg.sender,
            timestamp: block.timestamp,
            fulfilled: false
        }));
        emit PromiseCreated(nextId, title, msg.sender);
        nextId++;
    }

    function fulfillPromise(uint id) public {
        require(id < nextId, "Invalid promise ID");
        Promise storage p = promises[id];
        require(msg.sender == p.creator, "Only creator can fulfill the promise");
        require(!p.fulfilled, "Promise already fulfilled");
        p.fulfilled = true;
        emit PromiseFulfilled(id);
    }

    function getPromises() public view returns (Promise[] memory) {
        return promises;
    }

    function getPromise(uint id) public view returns (Promise memory) {
        require(id < nextId, "Invalid promise ID");
        return promises[id];
    }
}
