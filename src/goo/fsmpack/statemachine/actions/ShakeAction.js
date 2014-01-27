define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/math/Vector3'
],
/** @lends */
function(
	Action,
	Vector3
) {
	"use strict";

	function ShakeAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ShakeAction.prototype = Object.create(Action.prototype);
	ShakeAction.prototype.constructor = ShakeAction;

	ShakeAction.external = {
		name: 'Shake',
		description: 'Shakes the entity',
		canTransition: true,
		parameters: [{
			name: 'Start level',
			key: 'startLevel',
			type: 'number',
			description: 'Shake amount at start',
			'default': 0
		}, {
			name: 'End level',
			key: 'endLevel',
			type: 'number',
			description: 'Shake amount at the end',
			'default': 10
		}, {
			name: 'Time',
			key: 'time',
			type: 'number',
			description: 'Shake time amount',
			'default': 1000
		}, {
			name: 'Speed',
			key: 'speed',
			type: 'dropdown',
			description: 'Speed of shaking',
			'default': 'Fast',
			options: ['Fast', 'Medium', 'Slow']
		}],
		transitions: [{
			key: 'complete',
			name: 'On Completion',
			description: 'State to transition to when the shake completes'
		}]
	};

	ShakeAction.prototype.configure = function(settings) {
		this.startLevel = settings.startLevel;
		this.endLevel = settings.endLevel;
		this.time = settings.time;
		this.speed = { 'Fast': 1, 'Medium': 2, 'Slow': 4 }[settings.speed];
		this.easing = window.TWEEN.Easing.Quadratic.InOut;
		this.eventToEmit = { channel: settings.transitions.complete };
	};

	ShakeAction.prototype._setup = function() {
		this.tween = new window.TWEEN.Tween();
	};

	ShakeAction.prototype.cleanup = function (/*fsm*/) {
		if (this.tween) {
			this.tween.stop();
		}
	};

	ShakeAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;
		var translation = transformComponent.transform.translation;

		var oldVal = new Vector3();
		var target = new Vector3();
		var vel = new Vector3();

		var that = this;
		var iter = 0;
		this.tween.from({ level: +this.startLevel }).to({ level: +this.endLevel }, +this.time).easing(this.easing).onUpdate(function() {
			iter++;
			if (iter > that.speed) {
				iter = 0;

				target.setd(
					- oldVal.data[0] + (Math.random()-0.5) * this.level * 2,
					- oldVal.data[1] + (Math.random()-0.5) * this.level * 2,
					- oldVal.data[2] + (Math.random()-0.5) * this.level * 2
				);
			}

			vel.setd(
				vel.data[0] * 0.98 + (target.data[0]) * 0.1,
				vel.data[1] * 0.98 + (target.data[1]) * 0.1,
				vel.data[2] * 0.98 + (target.data[2]) * 0.1
			);

			translation.add(vel).sub(oldVal);
			oldVal.copy(vel);
			transformComponent.setUpdated();
		}).onComplete(function() {
			translation.sub(oldVal);
			transformComponent.setUpdated();
			fsm.send(this.eventToEmit.channel);
		}.bind(this)).start(fsm.getTime() * 1000);
	};

	return ShakeAction;
});