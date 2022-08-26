// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Sport.sol";
import "./ManagedByLink.sol";

abstract contract ResolvesByScore is Sport, ManagedByLink {
    function resolveEvent(
        uint256 _eventId,
        SportsEventStatus _eventStatus,
        uint256 _homeTeamId, // for verifying team stability
        uint256 _awayTeamId, // for verifying team stability
        uint256 _homeScore,
        uint256 _awayScore
    ) public onlyLinkNode {
        SportsEvent storage _event = sportsEvents[_eventId];

        require(_event.status == SportsEventStatus.Scheduled);
        require(uint8(_eventStatus) >= uint8(SportsEventStatus.Final));

        if (eventIsNoContest(_event, _eventStatus, _homeTeamId, _awayTeamId, WhoWonUnknown)) {
            resolveInvalidEvent(_eventId);
        } else {
            resolveValidEvent(_event, _homeScore, _awayScore);
        }

        _event.status = _eventStatus;
        _event.homeScore = _homeScore;
        _event.awayScore = _awayScore;
    }

    function resolveValidEvent(
        SportsEvent memory _event,
        uint256 _homeScore,
        uint256 _awayScore
    ) internal virtual;
}
