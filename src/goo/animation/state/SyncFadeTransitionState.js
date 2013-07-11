define(['goo/animation/state/FadeTransitionState'],
/** @lends */
function (FadeTransitionState) {
	"use strict";

	/**
	 * @class A transition that blends over a given time from one animation state to another, synchronizing the target state to the initial state's
	 *        start time. This is best used with two clips that have similar motions.
	 * @param targetState the name of the steady state we want the Animation Layer to be in at the end of the transition.
	 * @param fadeTime the amount of time we should take to do the transition.
	 * @param blendType {StateBlendType} the way we should interpolate the weighting during the transition.
	 */
	function SyncFadeTransitionState () {
		FadeTransitionState.call(this);
	}

	SyncFadeTransitionState.prototype = Object.create(FadeTransitionState.prototype);

	SyncFadeTransitionState.prototype.resetClips = function(globalTime) {
		FadeTransitionState.prototype.resetClips.call(this, globalTime);
		this._targetState.resetClips(this._sourceState._globalStartTime);
	};

	return SyncFadeTransitionState;
});