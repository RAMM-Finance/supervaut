// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../libraries/IERC20Full.sol";
import "../balancer/BPool.sol";
import "./AbstractMarketFactoryV3.sol";
import "./FeePot.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/SignedSafeMath.sol";
import "./MMAMarketFactoryV3.sol";
import "./AMMFactory.sol";
import "./CryptoMarketFactoryV3.sol";
import "./NBAMarketFactoryV3.sol";
import "../rewards/MasterChef.sol";
import "./CryptoCurrencyMarketFactoryV3.sol";
import "./TrustedMarketFactoryV3.sol";

// Helper contract for grabbing huge amounts of data without overloading multicall.
abstract contract Fetcher {
    using SafeMath for uint256;
    using SignedSafeMath for int256;

    struct CollateralBundle {
        address addr;
        string symbol;
        uint256 decimals;
    }

    struct MarketFactoryBundle {
        uint256 shareFactor;
        uint256 stakerFee;
        uint256 settlementFee;
        uint256 protocolFee;
        FeePot feePot;
        CollateralBundle collateral;
        uint256 marketCount;
    }

    struct PoolBundle {
        address addr;
        uint256[] tokenRatios;
        uint256[] balances;
        uint256[] weights;
        uint256 swapFee;
        uint256 totalSupply;
    }

    struct StaticMarketBundle {
        AbstractMarketFactoryV3 factory;
        uint256 marketId;
        PoolBundle pool;
        MasterChef.PoolStatusInfo rewards;
        OwnedERC20[] shareTokens;
        uint256 creationTimestamp;
        OwnedERC20 winner;
        uint256[] initialOdds;
    }

    struct DynamicMarketBundle {
        AbstractMarketFactoryV3 factory;
        uint256 marketId;
        PoolBundle pool;
        OwnedERC20 winner;
    }

    string public marketType;
    string public version;

    constructor(string memory _type, string memory _version) {
        marketType = _type;
        version = _version;
    }

    function buildCollateralBundle(IERC20Full _collateral) internal view returns (CollateralBundle memory _bundle) {
        _bundle.addr = address(_collateral);
        _bundle.symbol = _collateral.symbol();
        _bundle.decimals = _collateral.decimals();
    }

    function buildMarketFactoryBundle(AbstractMarketFactoryV3 _marketFactory)
        internal
        view
        returns (MarketFactoryBundle memory _bundle)
    {
        _bundle.shareFactor = _marketFactory.shareFactor();
        _bundle.stakerFee = _marketFactory.stakerFee();
        _bundle.settlementFee = _marketFactory.settlementFee();
        _bundle.protocolFee = _marketFactory.protocolFee();
        _bundle.feePot = _marketFactory.feePot();
        _bundle.collateral = buildCollateralBundle(_marketFactory.collateral());
        _bundle.marketCount = _marketFactory.marketCount();
    }

    function buildStaticMarketBundle(
        AbstractMarketFactoryV3 _marketFactory,
        AMMFactory _ammFactory,
        MasterChef _masterChef,
        uint256 _marketId
    ) internal view returns (StaticMarketBundle memory _bundle) {
        AbstractMarketFactoryV3.Market memory _market = _marketFactory.getMarket(_marketId);
        _bundle.factory = _marketFactory;
        _bundle.marketId = _marketId;
        _bundle.pool = buildPoolBundle(_marketFactory, _ammFactory, _marketId);
        _bundle.rewards = _masterChef.getPoolInfo(_ammFactory, _marketFactory, _marketId);
        _bundle.shareTokens = _market.shareTokens;
        _bundle.creationTimestamp = _market.creationTimestamp;
        _bundle.winner = _market.winner;
        _bundle.initialOdds = _market.initialOdds;
    }

    function buildDynamicMarketBundle(
        AbstractMarketFactoryV3 _marketFactory,
        AMMFactory _ammFactory,
        uint256 _marketId
    ) internal view returns (DynamicMarketBundle memory _bundle) {
        AbstractMarketFactoryV3.Market memory _market = _marketFactory.getMarket(_marketId);

        _bundle.factory = _marketFactory;
        _bundle.marketId = _marketId;
        _bundle.winner = _market.winner;
        _bundle.pool = buildPoolBundle(_marketFactory, _ammFactory, _marketId);
    }

    function buildPoolBundle(
        AbstractMarketFactoryV3 _marketFactory,
        AMMFactory _ammFactory,
        uint256 _marketId
    ) internal view returns (PoolBundle memory _bundle) {
        BPool _pool = _ammFactory.getPool(_marketFactory, _marketId);
        if (_pool == BPool(address(0))) return _bundle;

        _bundle.addr = address(_pool);
        _bundle.totalSupply = _pool.totalSupply();
        _bundle.swapFee = _ammFactory.getSwapFee(_marketFactory, _marketId);
        _bundle.balances = _ammFactory.getPoolBalances(_marketFactory, _marketId);
        _bundle.tokenRatios = _ammFactory.tokenRatios(_marketFactory, _marketId);
        _bundle.weights = _ammFactory.getPoolWeights(_marketFactory, _marketId);
    }

    function openOrHasWinningShares(AbstractMarketFactoryV3 _marketFactory, uint256 _marketId)
        internal
        view
        returns (bool)
    {
        AbstractMarketFactoryV3.Market memory _market = _marketFactory.getMarket(_marketId);
        if (_market.winner == OwnedERC20(address(0))) return true; // open
        return _market.winner.totalSupply() > 0; // has winning shares
    }
}

abstract contract SportsFetcher is Fetcher {
    struct SpecificMarketFactoryBundle {
        MarketFactoryBundle _super;
    }

    struct StaticEventBundle {
        uint256 id;
        StaticMarketBundle[] markets;
        int256[] lines;
        uint256 estimatedStartTime;
        uint256 homeTeamId;
        uint256 awayTeamId;
        string homeTeamName;
        string awayTeamName;
        // Dynamics
        Sport.SportsEventStatus status;
        uint256 homeScore;
        uint256 awayScore;
    }

    struct DynamicEventBundle {
        uint256 id;
        Sport.SportsEventStatus status;
        DynamicMarketBundle[] markets;
        uint256 homeScore;
        uint256 awayScore;
    }

    function buildSpecificMarketFactoryBundle(address _marketFactory)
        internal
        view
        returns (SpecificMarketFactoryBundle memory _bundle)
    {
        _bundle._super = buildMarketFactoryBundle(AbstractMarketFactoryV3(_marketFactory));
    }

    function fetchInitial(
        address _marketFactory,
        AMMFactory _ammFactory,
        MasterChef _masterChef,
        uint256 _offset,
        uint256 _total
    )
        public
        view
        returns (
            SpecificMarketFactoryBundle memory _marketFactoryBundle,
            StaticEventBundle[] memory _eventBundles,
            uint256 _lowestEventIndex,
            uint256 _timestamp
        )
    {
        _marketFactoryBundle = buildSpecificMarketFactoryBundle(_marketFactory);
        (_eventBundles, _lowestEventIndex) = buildStaticEventBundles(
            _marketFactory,
            _ammFactory,
            _masterChef,
            _offset,
            _total
        );
        _timestamp = block.timestamp;
    }

    function fetchDynamic(
        address _marketFactory,
        AMMFactory _ammFactory,
        uint256 _offset,
        uint256 _total
    )
        public
        view
        returns (
            DynamicEventBundle[] memory _bundles,
            uint256 _lowestEventIndex,
            uint256 _timestamp
        )
    {
        (_bundles, _lowestEventIndex) = buildDynamicEventBundles(_marketFactory, _ammFactory, _offset, _total);
        _timestamp = block.timestamp;
    }

    function buildStaticEventBundles(
        address _marketFactory,
        AMMFactory _ammFactory,
        MasterChef _masterChef,
        uint256 _offset,
        uint256 _total
    ) internal view returns (StaticEventBundle[] memory _bundles, uint256 _lowestEventIndex) {
        uint256[] memory _eventIds;
        (_eventIds, _lowestEventIndex) = listOfInterestingEvents(_marketFactory, _offset, _total);

        _total = _eventIds.length;
        _bundles = new StaticEventBundle[](_total);
        for (uint256 i; i < _total; i++) {
            _bundles[i] = buildStaticEventBundle(_marketFactory, _ammFactory, _masterChef, _eventIds[i]);
        }
    }

    function buildDynamicEventBundles(
        address _marketFactory,
        AMMFactory _ammFactory,
        uint256 _offset,
        uint256 _total
    ) internal view returns (DynamicEventBundle[] memory _bundles, uint256 _lowestEventIndex) {
        uint256[] memory _eventIds;
        (_eventIds, _lowestEventIndex) = listOfInterestingEvents(_marketFactory, _offset, _total);

        _total = _eventIds.length;
        _bundles = new DynamicEventBundle[](_total);
        for (uint256 i; i < _total; i++) {
            _bundles[i] = buildDynamicEventBundle(_marketFactory, _ammFactory, _eventIds[i]);
        }
    }

    function buildStaticEventBundle(
        address _marketFactory,
        AMMFactory _ammFactory,
        MasterChef _masterChef,
        uint256 _eventId
    ) internal view returns (StaticEventBundle memory _bundle) {
        Sport.SportsEvent memory _event = Sport(_marketFactory).getSportsEvent(_eventId);

        StaticMarketBundle[] memory _markets = new StaticMarketBundle[](_event.markets.length);
        for (uint256 i = 0; i < _markets.length; i++) {
            _markets[i] = buildStaticMarketBundle(
                AbstractMarketFactoryV3(_marketFactory),
                _ammFactory,
                _masterChef,
                _event.markets[i]
            );
        }

        _bundle.id = _eventId;
        _bundle.status = _event.status;
        _bundle.markets = _markets;
        _bundle.lines = _event.lines;
        _bundle.estimatedStartTime = _event.estimatedStartTime;
        _bundle.homeTeamId = _event.homeTeamId;
        _bundle.awayTeamId = _event.awayTeamId;
        _bundle.homeTeamName = _event.homeTeamName;
        _bundle.awayTeamName = _event.awayTeamName;
        _bundle.homeScore = _event.homeScore;
        _bundle.awayScore = _event.awayScore;
    }

    function buildDynamicEventBundle(
        address _marketFactory,
        AMMFactory _ammFactory,
        uint256 _eventId
    ) internal view returns (DynamicEventBundle memory _bundle) {
        Sport.SportsEvent memory _event = Sport(_marketFactory).getSportsEvent(_eventId);

        DynamicMarketBundle[] memory _markets = new DynamicMarketBundle[](_event.markets.length);
        for (uint256 i = 0; i < _markets.length; i++) {
            _markets[i] = buildDynamicMarketBundle(
                AbstractMarketFactoryV3(_marketFactory),
                _ammFactory,
                _event.markets[i]
            );
        }

        _bundle.id = _eventId;
        _bundle.markets = _markets;
        _bundle.status = _event.status;
        _bundle.homeScore = _event.homeScore;
        _bundle.awayScore = _event.awayScore;
    }

    // Starts from the end of the events list because newer events are more interesting.
    // _offset is skipping all events, not just interesting events
    function listOfInterestingEvents(
        address _marketFactory,
        uint256 _offset,
        uint256 _total
    ) internal view returns (uint256[] memory _interestingEventIds, uint256 _eventIndex) {
        _interestingEventIds = new uint256[](_total);

        uint256 _eventCount = Sport(_marketFactory).eventCount();

        // No events so return nothing. (needed to avoid integer underflow below)
        if (_eventCount == 0) {
            return (new uint256[](0), 0);
        }

        uint256 _max = _eventCount;

        // No remaining events so return nothing. (needed to avoid integer underflow below)
        if (_offset > _max) {
            return (new uint256[](0), 0);
        }

        uint256 _collectedEvents = 0;
        _eventIndex = _max - _offset;
        while (true) {
            if (_collectedEvents >= _total) break;
            if (_eventIndex == 0) break;

            _eventIndex--; // starts out one too high, so this works

            (Sport.SportsEvent memory _event, uint256 _eventId) =
                Sport(_marketFactory).getSportsEventByIndex(_eventIndex);

            if (isEventInteresting(_event, AbstractMarketFactoryV3(_marketFactory))) {
                _interestingEventIds[_collectedEvents] = _eventId;
                _collectedEvents++;
            }
        }

        if (_total > _collectedEvents) {
            assembly {
                // shortens array
                mstore(_interestingEventIds, _collectedEvents)
            }
        }
    }

    function isEventInteresting(Sport.SportsEvent memory _event, AbstractMarketFactoryV3 _marketFactory)
        private
        view
        returns (bool)
    {
        for (uint256 i = 0; i < _event.markets.length; i++) {
            uint256 _marketId = _event.markets[i];
            if (openOrHasWinningShares(_marketFactory, _marketId)) {
                return true;
            }
        }
        return false;
    }
}

contract NBAFetcher is SportsFetcher {
    constructor() Fetcher("NBA", "TBD") {}
}

contract MLBFetcher is SportsFetcher {
    constructor() Fetcher("MLB", "TBD") {}
}

contract MMAFetcher is SportsFetcher {
    constructor() Fetcher("MMA", "TBD") {}
}

contract NFLFetcher is SportsFetcher {
    constructor() Fetcher("NFL", "TBD") {}
}

contract CryptoFetcher is Fetcher {
    constructor() Fetcher("Crypto", "TBD") {}

    struct SpecificMarketFactoryBundle {
        MarketFactoryBundle _super;
    }

    struct SpecificStaticMarketBundle {
        StaticMarketBundle _super;
        uint8 marketType;
        uint256 coinIndex;
        uint256 creationPrice;
        uint256 resolutionTime;
        // Dynamics
        uint256 resolutionPrice;
    }

    struct SpecificDynamicMarketBundle {
        DynamicMarketBundle _super;
        uint256 resolutionPrice;
    }

    function buildSpecificMarketFactoryBundle(address _marketFactory)
        internal
        view
        returns (SpecificMarketFactoryBundle memory _bundle)
    {
        _bundle._super = buildMarketFactoryBundle(CryptoMarketFactoryV3(_marketFactory));
    }

    function buildSpecificStaticMarketBundle(
        address _marketFactory,
        AMMFactory _ammFactory,
        MasterChef _masterChef,
        uint256 _marketId
    ) internal view returns (SpecificStaticMarketBundle memory _bundle) {
        CryptoMarketFactoryV3.MarketDetails memory _details =
            CryptoMarketFactoryV3(_marketFactory).getMarketDetails(_marketId);
        _bundle._super = buildStaticMarketBundle(
            CryptoMarketFactoryV3(_marketFactory),
            _ammFactory,
            _masterChef,
            _marketId
        );
        _bundle.marketType = uint8(_details.marketType);
        _bundle.creationPrice = _details.creationPrice;
        _bundle.coinIndex = _details.coinIndex;
        _bundle.resolutionPrice = _details.resolutionPrice;
        _bundle.resolutionTime = _details.resolutionTime;
    }

    function buildSpecificDynamicMarketBundle(
        address _marketFactory,
        AMMFactory _ammFactory,
        uint256 _marketId
    ) internal view returns (SpecificDynamicMarketBundle memory _bundle) {
        CryptoMarketFactoryV3.MarketDetails memory _details =
            CryptoMarketFactoryV3(_marketFactory).getMarketDetails(_marketId);
        _bundle._super = buildDynamicMarketBundle(CryptoMarketFactoryV3(_marketFactory), _ammFactory, _marketId);
        _bundle.resolutionPrice = _details.resolutionPrice;
    }

    function fetchInitial(
        address _marketFactory,
        AMMFactory _ammFactory,
        MasterChef _masterChef,
        uint256 _offset,
        uint256 _total
    )
        public
        view
        returns (
            SpecificMarketFactoryBundle memory _marketFactoryBundle,
            SpecificStaticMarketBundle[] memory _marketBundles,
            uint256 _lowestMarketIndex,
            uint256 _timestamp
        )
    {
        _marketFactoryBundle = buildSpecificMarketFactoryBundle(_marketFactory);

        uint256[] memory _marketIds;
        (_marketIds, _lowestMarketIndex) = listOfInterestingMarkets(_marketFactory, _offset, _total);

        _total = _marketIds.length;
        _marketBundles = new SpecificStaticMarketBundle[](_total);
        for (uint256 i; i < _total; i++) {
            _marketBundles[i] = buildSpecificStaticMarketBundle(
                _marketFactory,
                _ammFactory,
                _masterChef,
                _marketIds[i]
            );
        }

        _timestamp = block.timestamp;
    }

    function fetchDynamic(
        address _marketFactory,
        AMMFactory _ammFactory,
        uint256 _offset,
        uint256 _total
    )
        public
        view
        returns (
            SpecificDynamicMarketBundle[] memory _bundles,
            uint256 _lowestMarketIndex,
            uint256 _timestamp
        )
    {
        uint256[] memory _marketIds;
        (_marketIds, _lowestMarketIndex) = listOfInterestingMarkets(_marketFactory, _offset, _total);

        _total = _marketIds.length;
        _bundles = new SpecificDynamicMarketBundle[](_total);
        for (uint256 i; i < _total; i++) {
            _bundles[i] = buildSpecificDynamicMarketBundle(_marketFactory, _ammFactory, _marketIds[i]);
        }

        _timestamp = block.timestamp;
    }

    // Starts from the end of the markets list because newer markets are more interesting.
    // _offset is skipping all markets, not just interesting markets
    function listOfInterestingMarkets(
        address _marketFactory,
        uint256 _offset,
        uint256 _total
    ) internal view returns (uint256[] memory _interestingMarketIds, uint256 _marketId) {
        _interestingMarketIds = new uint256[](_total);
        uint256 _max = AbstractMarketFactoryV3(_marketFactory).marketCount() - 1;

        // No markets so return nothing. (needed to prevent integer underflow below)
        if (_max == 0 || _offset >= _max) {
            return (new uint256[](0), 0);
        }

        // Starts at the end, less offset.
        // Stops before the 0th market since that market is always fake.
        uint256 _collectedMarkets = 0;
        _marketId = _max - _offset;

        while (true) {
            if (openOrHasWinningShares(AbstractMarketFactoryV3(_marketFactory), _marketId)) {
                _interestingMarketIds[_collectedMarkets] = _marketId;
                _collectedMarkets++;
            }

            if (_collectedMarkets >= _total) break;
            if (_marketId == 1) break; // skipping 0th market, which is fake
            _marketId--; // starts out oone too high, so this works
        }

        if (_total > _collectedMarkets) {
            assembly {
                // shortens array
                mstore(_interestingMarketIds, _collectedMarkets)
            }
        }
    }
}

contract CryptoCurrencyFetcher is Fetcher {
    constructor() Fetcher("CryptoCurrency", "TBD") {}

    struct SpecificMarketFactoryBundle {
        MarketFactoryBundle _super;
    }

    struct SpecificStaticMarketBundle {
        StaticMarketBundle _super;
        uint256 coinIndex;
        uint256 creationValue;
        uint256 resolutionTime;
        // Dynamics
        uint256 resolutionValue;
    }

    struct SpecificDynamicMarketBundle {
        DynamicMarketBundle _super;
        uint256 resolutionValue;
    }

    function buildSpecificMarketFactoryBundle(address _marketFactory)
        internal
        view
        returns (SpecificMarketFactoryBundle memory _bundle)
    {
        _bundle._super = buildMarketFactoryBundle(CryptoCurrencyMarketFactoryV3(_marketFactory));
    }

    function buildSpecificStaticMarketBundle(
        address _marketFactory,
        AMMFactory _ammFactory,
        MasterChef _masterChef,
        uint256 _marketId
    ) internal view returns (SpecificStaticMarketBundle memory _bundle) {
        CryptoCurrencyMarketFactoryV3.MarketDetails memory _details =
            CryptoCurrencyMarketFactoryV3(_marketFactory).getMarketDetails(_marketId);
        _bundle._super = buildStaticMarketBundle(
            CryptoCurrencyMarketFactoryV3(_marketFactory),
            _ammFactory,
            _masterChef,
            _marketId
        );
        _bundle.creationValue = _details.creationValue;
        _bundle.coinIndex = _details.coinIndex;
        _bundle.resolutionValue = _details.resolutionValue;
        _bundle.resolutionTime = _details.resolutionTime;
    }

    function buildSpecificDynamicMarketBundle(
        address _marketFactory,
        AMMFactory _ammFactory,
        uint256 _marketId
    ) internal view returns (SpecificDynamicMarketBundle memory _bundle) {
        CryptoCurrencyMarketFactoryV3.MarketDetails memory _details =
            CryptoCurrencyMarketFactoryV3(_marketFactory).getMarketDetails(_marketId);
        _bundle._super = buildDynamicMarketBundle(CryptoCurrencyMarketFactoryV3(_marketFactory), _ammFactory, _marketId);
        _bundle.resolutionValue = _details.resolutionValue;
    }

    function fetchInitial(
        address _marketFactory,
        AMMFactory _ammFactory,
        MasterChef _masterChef,
        uint256 _offset,
        uint256 _total
    )
        public
        view
        returns (
            SpecificMarketFactoryBundle memory _marketFactoryBundle,
            SpecificStaticMarketBundle[] memory _marketBundles,
            uint256 _lowestMarketIndex,
            uint256 _timestamp
        )
    {
        _marketFactoryBundle = buildSpecificMarketFactoryBundle(_marketFactory);

        uint256[] memory _marketIds;
        (_marketIds, _lowestMarketIndex) = listOfInterestingMarkets(_marketFactory, _offset, _total);

        _total = _marketIds.length;
        _marketBundles = new SpecificStaticMarketBundle[](_total);
        for (uint256 i; i < _total; i++) {
            _marketBundles[i] = buildSpecificStaticMarketBundle(
                _marketFactory,
                _ammFactory,
                _masterChef,
                _marketIds[i]
            );
        }

        _timestamp = block.timestamp;
    }

    function fetchDynamic(
        address _marketFactory,
        AMMFactory _ammFactory,
        uint256 _offset,
        uint256 _total
    )
        public
        view
        returns (
            SpecificDynamicMarketBundle[] memory _bundles,
            uint256 _lowestMarketIndex,
            uint256 _timestamp
        )
    {
        uint256[] memory _marketIds;
        (_marketIds, _lowestMarketIndex) = listOfInterestingMarkets(_marketFactory, _offset, _total);

        _total = _marketIds.length;
        _bundles = new SpecificDynamicMarketBundle[](_total);
        for (uint256 i; i < _total; i++) {
            _bundles[i] = buildSpecificDynamicMarketBundle(_marketFactory, _ammFactory, _marketIds[i]);
        }

        _timestamp = block.timestamp;
    }

    // Starts from the end of the markets list because newer markets are more interesting.
    // _offset is skipping all markets, not just interesting markets
    function listOfInterestingMarkets(
        address _marketFactory,
        uint256 _offset,
        uint256 _total
    ) internal view returns (uint256[] memory _interestingMarketIds, uint256 _marketId) {
        _interestingMarketIds = new uint256[](_total);
        uint256 _max = AbstractMarketFactoryV3(_marketFactory).marketCount() - 1;

        // No markets so return nothing. (needed to prevent integer underflow below)
        if (_max == 0 || _offset >= _max) {
            return (new uint256[](0), 0);
        }

        // Starts at the end, less offset.
        // Stops before the 0th market since that market is always fake.
        uint256 _collectedMarkets = 0;
        _marketId = _max - _offset;

        while (true) {
            if (openOrHasWinningShares(AbstractMarketFactoryV3(_marketFactory), _marketId)) {
                _interestingMarketIds[_collectedMarkets] = _marketId;
                _collectedMarkets++;
            }

            if (_collectedMarkets >= _total) break;
            if (_marketId == 1) break; // skipping 0th market, which is fake
            _marketId--; // starts out oone too high, so this works
        }

        if (_total > _collectedMarkets) {
            assembly {
                // shortens array
                mstore(_interestingMarketIds, _collectedMarkets)
            }
        }
    }
}


// contract TrustedFetcher is Fetcher {
//     constructor() Fetcher("Trusted", "TBD") {}

//     struct SpecificMarketFactoryBundle {
//         MarketFactoryBundle _super;
//     }

//     struct SpecificStaticMarketBundle {
//         StaticMarketBundle _super;
//         // uint256 coinIndex;
//         // uint256 creationValue;
//         // uint256 resolutionTime;
//         // // Dynamics
//         // uint256 resolutionValue;
//         string description;
//     }

//     struct SpecificDynamicMarketBundle {
//         DynamicMarketBundle _super;
//         //uint256 resolutionValue;
//         string description;

//     }

//     function getMarket(    address _marketFactory,
//         AMMFactory _ammFactory,
//         MasterChef _masterChef,
//         uint256 _marketId) public view returns(   SpecificStaticMarketBundle memory _bundle
// ){
//         TrustedMarketFactoryV3.MarketDetails memory _details =
//             TrustedMarketFactoryV3(_marketFactory).getMarketDetails(_marketId);
//         _bundle._super = buildStaticMarketBundle(
//             TrustedMarketFactoryV3(_marketFactory),
//             _ammFactory,
//             _masterChef,
//             _marketId
//         );
//         _bundle.description = _details.description;
//     }

//     function buildSpecificMarketFactoryBundle(address _marketFactory)
//         internal
//         view
//         returns (SpecificMarketFactoryBundle memory _bundle)
//     {
//         _bundle._super = buildMarketFactoryBundle(TrustedMarketFactoryV3(_marketFactory));
//     }

//     function buildSpecificStaticMarketBundle(
//         address _marketFactory,
//         AMMFactory _ammFactory,
//         MasterChef _masterChef,
//         uint256 _marketId
//     ) internal view returns (SpecificStaticMarketBundle memory _bundle) {
//         TrustedMarketFactoryV3.MarketDetails memory _details =
//             TrustedMarketFactoryV3(_marketFactory).getMarketDetails(_marketId);
//         _bundle._super = buildStaticMarketBundle(
//             TrustedMarketFactoryV3(_marketFactory),
//             _ammFactory,
//             _masterChef,
//             _marketId
//         );
//         _bundle.description = _details.description;
//         // _bundle.creationValue = _details.creationValue;
//         // _bundle.coinIndex = _details.coinIndex;
//         // _bundle.resolutionValue = _details.resolutionValue;
//         // _bundle.resolutionTime = _details.resolutionTime;
//     }

//     function buildSpecificDynamicMarketBundle(
//         address _marketFactory,
//         AMMFactory _ammFactory,
//         uint256 _marketId
//     ) internal view returns (SpecificDynamicMarketBundle memory _bundle) {
//         TrustedMarketFactoryV3.MarketDetails memory _details =
//             TrustedMarketFactoryV3(_marketFactory).getMarketDetails(_marketId);
//         _bundle._super = buildDynamicMarketBundle(TrustedMarketFactoryV3(_marketFactory), _ammFactory, _marketId);
//         _bundle.description = _details.description;
//     }

//     function fetchInitial(
//         address _marketFactory,
//         AMMFactory _ammFactory,
//         MasterChef _masterChef,
//         uint256 _offset,
//         uint256 _total
//     )
//         public
//         view
//         returns (
//             SpecificMarketFactoryBundle memory _marketFactoryBundle,
//             SpecificStaticMarketBundle[] memory _marketBundles,
//             uint256 _lowestMarketIndex,
//             uint256 _timestamp
//         )
//     {
//         _marketFactoryBundle = buildSpecificMarketFactoryBundle(_marketFactory);

//         uint256[] memory _marketIds;
//         (_marketIds, _lowestMarketIndex) = listOfInterestingMarkets(_marketFactory, _offset, _total);

//         _total = _marketIds.length;
//         _marketBundles = new SpecificStaticMarketBundle[](_total);
//         for (uint256 i; i < _total; i++) {
//             _marketBundles[i] = buildSpecificStaticMarketBundle(
//                 _marketFactory,
//                 _ammFactory,
//                 _masterChef,
//                 _marketIds[i]
//             );
//         }

//         _timestamp = block.timestamp;
//     }

//     function fetchDynamic(
//         address _marketFactory,
//         AMMFactory _ammFactory,
//         uint256 _offset,
//         uint256 _total
//     )
//         public
//         view
//         returns (
//             SpecificDynamicMarketBundle[] memory _bundles,
//             uint256 _lowestMarketIndex,
//             uint256 _timestamp
//         )
//     {
//         uint256[] memory _marketIds;
//         (_marketIds, _lowestMarketIndex) = listOfInterestingMarkets(_marketFactory, _offset, _total);

//         _total = _marketIds.length;
//         _bundles = new SpecificDynamicMarketBundle[](_total);
//         for (uint256 i; i < _total; i++) {
//             _bundles[i] = buildSpecificDynamicMarketBundle(_marketFactory, _ammFactory, _marketIds[i]);
//         }

//         _timestamp = block.timestamp;
//     }

//     // Starts from the end of the markets list because newer markets are more interesting.
//     // _offset is skipping all markets, not just interesting markets
//     function listOfInterestingMarkets(
//         address _marketFactory,
//         uint256 _offset,
//         uint256 _total
//     ) internal view returns (uint256[] memory _interestingMarketIds, uint256 _marketId) {
//         _interestingMarketIds = new uint256[](_total);
//         uint256 _max = AbstractMarketFactoryV3(_marketFactory).marketCount() - 1;

//         // No markets so return nothing. (needed to prevent integer underflow below)
//         if (_max == 0 || _offset >= _max) {
//             return (new uint256[](0), 0);
//         }

//         // Starts at the end, less offset.
//         // Stops before the 0th market since that market is always fake.
//         uint256 _collectedMarkets = 0;
//         _marketId = _max - _offset;

//         while (true) {
//             if (openOrHasWinningShares(AbstractMarketFactoryV3(_marketFactory), _marketId)) {
//                 _interestingMarketIds[_collectedMarkets] = _marketId;
//                 _collectedMarkets++;
//             }

//             if (_collectedMarkets >= _total) break;
//             if (_marketId == 1) break; // skipping 0th market, which is fake
//             _marketId--; // starts out oone too high, so this works
//         }

//         if (_total > _collectedMarkets) {
//             assembly {
//                 // shortens array
//                 mstore(_interestingMarketIds, _collectedMarkets)
//             }
//         }
//     }
// }
