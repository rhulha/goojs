define([
	'goo/entities/systems/System',
	'goo/util/TWEEN',
	'goo/fsmpack/statemachine/actions/Actions'
], function (
	System,
	TWEEN
) {
	'use strict';

	/**
	 * Processes all entities with a FSM component
	 * @private
	 */
	function StateMachineSystem(engine) {
		System.call(this, 'StateMachineSystem', ['StateMachineComponent']);

		this.engine = engine;
		this.passive = false;
		this.paused = false;

		/**
		 * Current time, in seconds.
		 * @type {number}
		 */
		this.time = 0;

		this.evalProxy = {
			// Add things that are useful from user scripts
			test: function () {
				console.log('test');
			}
		};

		// actions triggered by this system typically need to run after all other systems do their job
		this.priority = 1000;

		// Input handling
		var buttonNames = ['Left', 'Middle', 'Right'];
		this._inputStates = new Set();
		this._listeners = {
			keydown: function (event) {
				this._inputStates.add(event.which);
			}.bind(this),
			keyup: function (event) {
				this._inputStates.delete(event.which);
			}.bind(this),
			mousedown: function (event) {
				this._inputStates.add(buttonNames[event.button]);
			}.bind(this),
			mouseup: function (event) {
				this._inputStates.delete(buttonNames[event.button]);
			}.bind(this)
		};
	}

	StateMachineSystem.prototype = Object.create(System.prototype);

	StateMachineSystem.prototype.getInputState = function (key) {
		return this._inputStates.has(key);
	};

	StateMachineSystem.prototype.process = function (entities, tpf) {
		this.time += tpf;

		// Enter unentered components
		for (var i = 0; i < entities.length; i++) {
			var component = entities[i].stateMachineComponent;
			if (!component.entered) {
				// component.init(); // why was this done?
				component.doEnter();
				component.entered = true;
			}
		}

		TWEEN.update(this.engine.world.time * 1000); // this should not stay here

		for (var i = 0; i < entities.length; i++) {
			component = entities[i].stateMachineComponent;
			component.update(tpf);
		}
	};

	StateMachineSystem.prototype.inserted = function (entity) {
		var component = entity.stateMachineComponent;

		component.entity = entity;
		component.system = this;
		component.init();
	};

	/**
	 * Resumes updating the entities
	 */
	StateMachineSystem.prototype.play = function () {
		this.passive = false;
		if (!this.paused) {
			// Un-enter entered components
			var entities = this._activeEntities;
			for (var i = 0; i < entities.length; i++) {
				var component = entities[i].stateMachineComponent;
				component.entered = false;
			}

			for (var key in this._listeners) {
				document.addEventListener(key, this._listeners[key]);
			}
			this._inputStates.clear();
		}
		this.paused = false;
	};

	/**
	 * Stops updating the entities
	 */
	StateMachineSystem.prototype.pause = function () {
		this.passive = true;
		this.paused = true;
	};

	/**
	 * Resumes updating the entities; an alias for `.play`
	 */
	StateMachineSystem.prototype.resume = StateMachineSystem.prototype.play;

	/**
	 * Stop updating entities and resets the state machines to their initial state
	 */
	StateMachineSystem.prototype.stop = function () {
		console.log('stopping system');
		this.passive = true;
		this.paused = false;

		for (var i = 0; i < this._activeEntities.length; i++) {
			var component = this._activeEntities[i].stateMachineComponent;
			component.kill();
			component.cleanup();
		}
		this.time = 0;
		TWEEN.removeAll();

		for (var key in this._listeners) {
			document.removeEventListener(key, this._listeners[key]);
		}
	};

	return StateMachineSystem;
});