// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../libraries/IERC20Full.sol";
import "../balancer/BPool.sol";
import "./AbstractMarketFactoryV2.sol";
import "./FeePot.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/SignedSafeMath.sol";
import "../libraries/CalculateLinesToBPoolOdds.sol";

contract MMALinkMarketFactoryV2 is AbstractMarketFactoryV2, CalculateLinesToBPoolOdds {
    using SafeMath for uint256;
    using SignedSafeMath for int256;

    event MarketCreated(
        uint256 id,
        address creator,
        uint256 endTime,
        MarketType marketType,
        uint256 indexed eventId,
        string homeFighterName,
        uint256 homeFighterId,
        string awayFighterName,
        uint256 awayFighterId,
        uint256 estimatedStartTime
    );
    event MarketResolved(uint256 id, address winner);
    event LinkNodeChanged(address newLinkNode);

    enum MarketType {HeadToHead}
    enum HeadToHeadOutcome {
        NoContest, // 0
        Away, // 1
        Home // 2
    }

    struct MarketDetails {
        uint256 eventId;
        string homeFighterName;
        uint256 homeFighterId;
        string awayFighterName;
        uint256 awayFighterId;
        uint256 estimatedStartTime;
        MarketType marketType;
        EventStatus eventStatus;
    }
    // MarketId => MarketDetails
    mapping(uint256 => MarketDetails) internal marketDetails;

    enum EventStatus {Unknown, Scheduled, Final, Postponed, Canceled}
    struct EventDetails {
        uint256[1] markets;
        uint256 homeFighterId;
        uint256 awayFighterId;
        uint256 startTime;
        EventStatus eventStatus;
    }

    // EventId => EventDetails
    mapping(uint256 => EventDetails) public events;
    uint256[] public listOfEvents;

    address public linkNode;
    uint256 public sportId;

    constructor(
        address _owner,
        IERC20Full _collateral,
        uint256 _shareFactor,
        FeePot _feePot,
        uint256 _stakerFee,
        uint256 _settlementFee,
        address _protocol,
        uint256 _protocolFee,
        address _linkNode,
        uint256 _sportId
    )
        AbstractMarketFactoryV2(
            _owner,
            _collateral,
            _shareFactor,
            _feePot,
            _stakerFee,
            _settlementFee,
            _protocol,
            _protocolFee
        )
    {
        linkNode = _linkNode;
        sportId = _sportId;
    }

    function createMarket(
        uint256 _eventId,
        string memory _homeFighterName,
        uint256 _homeFighterId,
        string memory _awayFighterName,
        uint256 _awayFighterId,
        uint256 _startTimestamp,
        int256[2] memory _moneylines // [home,away]
    ) public {
        require(msg.sender == linkNode, "Only link node can create markets");

        address _creator = msg.sender;
        uint256 _endTime = _startTimestamp.add(60 * 8); // 8 hours

        uint256[1] memory _ids = events[_eventId].markets;
        // require(_ids[0] == 0, "This event was already used to create markets");

        _ids[0] = createHeadToHeadMarket(
            _creator,
            _endTime,
            _eventId,
            _homeFighterName,
            _homeFighterId,
            _awayFighterName,
            _awayFighterId,
            _startTimestamp,
            _moneylines
        );

        events[_eventId].markets = _ids;
        events[_eventId].homeFighterId = _homeFighterId;
        events[_eventId].awayFighterId = _awayFighterId;
        events[_eventId].startTime = _startTimestamp;
        events[_eventId].eventStatus = EventStatus.Scheduled;
        listOfEvents.push(_eventId);
    }

    function createHeadToHeadMarket(
        address _creator,
        uint256 _endTime,
        uint256 _eventId,
        string memory _homeTeamName,
        uint256 _homeFighterId,
        string memory _awayTeamName,
        uint256 _awayFighterId,
        uint256 _startTimestamp,
        int256[2] memory _moneylines // [home,away]
    ) internal returns (uint256) {
        string[] memory _outcomes = new string[](3);
        _outcomes[uint256(HeadToHeadOutcome.NoContest)] = "No Contest";
        _outcomes[uint256(HeadToHeadOutcome.Away)] = _awayTeamName;
        _outcomes[uint256(HeadToHeadOutcome.Home)] = _homeTeamName;

        uint256 _id = markets.length;
        // moneylines is [home,away] but the outcomes are listed [NC,away,home] so they must be reversed
        markets.push(
            makeMarket(_creator, _outcomes, _outcomes, _endTime, oddsFromLines(_moneylines[1], _moneylines[0]))
        );
        marketDetails[_id] = MarketDetails(
            _eventId,
            _homeTeamName,
            _homeFighterId,
            _awayTeamName,
            _awayFighterId,
            _startTimestamp,
            MarketType.HeadToHead,
            EventStatus.Scheduled
        );
        emit MarketCreated(
            _id,
            _creator,
            _endTime,
            MarketType.HeadToHead,
            _eventId,
            _homeTeamName,
            _homeFighterId,
            _awayTeamName,
            _awayFighterId,
            _startTimestamp
        );
        return _id;
    }

    enum WhoWon {Unknown, Home, Away, Draw}

    function trustedResolveMarkets(
        uint256 _eventId,
        EventStatus _eventStatus,
        uint256 _homeFighterId,
        uint256 _awayFighterId,
        WhoWon _whoWon
    ) public {
        require(msg.sender == linkNode, "Only link node can resolve markets");

        EventDetails memory _event = events[_eventId];
        require(_event.markets[0] != 0, "Cannot resolve markets that weren't created");
        require(EventStatus(_eventStatus) != EventStatus.Scheduled, "Cannot resolve SCHEDULED markets");

        if (eventIsNoContest(_event, _eventStatus, _homeFighterId, _awayFighterId, _whoWon)) {
            resolveMarketsAsNoContest(_eventId);
        } else {
            resolveHeadToHeadMarket(_event.markets[0], _whoWon);
        }

        events[_eventId].eventStatus = _eventStatus;
    }

    function eventIsNoContest(
        EventDetails memory _event,
        EventStatus _eventStatus,
        uint256 _homeFighterId,
        uint256 _awayFighterId,
        WhoWon _whoWon
    ) internal pure returns (bool) {
        bool _draw = _whoWon == WhoWon.Draw;
        bool _notFinal = _eventStatus != EventStatus.Final;
        bool _unstableHomeFighterId = _event.homeFighterId != _homeFighterId;
        bool _unstableAwayFighterId = _event.awayFighterId != _awayFighterId;
        return _draw || _notFinal || _unstableHomeFighterId || _unstableAwayFighterId;
    }

    function resolveMarketsAsNoContest(uint256 _eventId) internal {
        uint256[1] memory _marketIds = events[_eventId].markets;
        for (uint256 i = 0; i < _marketIds.length; i++) {
            uint256 _marketId = _marketIds[i];
            if (_marketId == 0) continue; // skip non-created markets
            OwnedERC20 _winner = markets[_marketId].shareTokens[0]; // 0th outcome is No Contest for all market types
            markets[_marketId].winner = _winner;
            emit MarketResolved(_marketId, address(_winner));
        }
    }

    function resolveHeadToHeadMarket(uint256 _marketId, WhoWon _whoWon) internal {
        OwnedERC20 _winner;
        if (WhoWon.Home == _whoWon) {
            _winner = markets[_marketId].shareTokens[uint256(HeadToHeadOutcome.Home)];
        } else if (WhoWon.Away == _whoWon) {
            _winner = markets[_marketId].shareTokens[uint256(HeadToHeadOutcome.Away)];
        } else {
            require(false, "Bad market resolution choice");
        }

        markets[_marketId].winner = _winner;
        emit MarketResolved(_marketId, address(_winner));
    }

    function getMarketDetails(uint256 _marketId) public view returns (MarketDetails memory) {
        return marketDetails[_marketId];
    }

    // Only usable off-chain. Gas cost can easily eclipse block limit.
    // Lists all events that could be resolved with a call to resolveEvent.
    // Not all will be resolvable because this does not ensure the game ended.
    function listResolvableEvents() external view returns (uint256[] memory) {
        uint256 _totalResolvable = countResolvableEvents();
        uint256[] memory _resolvableEvents = new uint256[](_totalResolvable);

        uint256 n = 0;
        for (uint256 i = 0; i < listOfEvents.length; i++) {
            if (n > _totalResolvable) break;
            uint256 _eventId = listOfEvents[i];
            if (isEventResolvable(_eventId)) {
                _resolvableEvents[n] = _eventId;
                n++;
            }
        }

        return _resolvableEvents;
    }

    function countResolvableEvents() internal view returns (uint256) {
        uint256 _totalResolvable = 0;
        for (uint256 i = 0; i < listOfEvents.length; i++) {
            uint256 _eventId = listOfEvents[i];
            if (isEventResolvable(_eventId)) {
                _totalResolvable++;
            }
        }
        return _totalResolvable;
    }

    // Returns true if a call to resolveEvent is potentially useful.
    function isEventResolvable(uint256 _eventId) internal view returns (bool) {
        EventDetails memory _event = events[_eventId];

        bool _unresolved = false; // default because non-existing markets aren't resolvable
        for (uint256 i = 0; i < _event.markets.length; i++) {
            uint256 _marketId = _event.markets[i];
            if (_marketId != 0 && !isMarketResolved(_marketId)) {
                _unresolved = true;
                break;
            }
        }

        return _unresolved;
    }

    function getEvent(uint256 _eventId) external view returns (EventDetails memory _event) {
        _event = events[_eventId];
    }

    function setLinkNode(address _newLinkNode) external onlyOwner {
        linkNode = _newLinkNode;
        emit LinkNodeChanged(_newLinkNode);
    }

    function resolveMarket(uint256) public pure override {
        require(false, "Only the link node can resolve the market, using trustedResolveMarkets");
    }
}
