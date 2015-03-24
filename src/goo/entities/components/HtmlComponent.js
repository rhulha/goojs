define([
	'goo/entities/components/Component',
	'goo/shapes/Quad',
	'goo/entities/components/MeshRendererComponent',
	'goo/entities/components/MeshDataComponent'
],
function (
	Component,
	Quad,
	MeshRendererComponent,
	MeshDataComponent
) {
	'use strict';

	/**
	 * Connects a domElement to an entity and applies the transforms of the entity to the domElement with CSS3 3D transforms.
	 * @param {domElement} domElement
	 * @param {Object} settings
	 * @extends Component
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/entities/components/HTMLComponent/HTMLComponent-vtest.html Working example
	 */
	function HtmlComponent(domElement, settings) {
		Component.apply(this, arguments);

		this.type = 'HtmlComponent';

		settings = settings || {};

		/**
		 * @type {boolean}
		 */
		this.hidden = false;

		this.useTransformComponent = settings.useTransformComponent !== undefined ? settings.useTransformComponent : true;
		this.width = settings.width || 1000;
		this.height = settings.height || 400;
		this.backfaceVisibility = settings.backfaceVisibility || 'hidden'; //'visible'
		// faceCamera should not be here, it should be an entity transform setting
		this.faceCamera = settings.faceCamera !== undefined ? settings.faceCamera : false;

		this.updated = true;
		this.entity = null;
		this.initDom(domElement);

		this.meshData = new Quad(1, 1);
		this.meshDataComponent = new MeshDataComponent(this.meshData);
		this.meshRendererComponent = new MeshRendererComponent();
		// this.meshRendererComponent.isPickable = false;


		var front

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	HtmlComponent.type = 'HtmlComponent';

	HtmlComponent.prototype = Object.create(Component.prototype);
	HtmlComponent.prototype.constructor = HtmlComponent;

	HtmlComponent.prototype.attached = function (entity) {
		entity.setComponent(this.meshDataComponent);
		entity.setComponent(this.meshRendererComponent);
	};

	HtmlComponent.prototype.detached = function (entity) {
		if (this.domElement.parentNode !== null) {
			this.domElement.parentNode.removeChild(this.domElement);
		}
		entity.clearComponent('meshRendererComponent');
		entity.clearComponent('meshDataComponent');
	};

	HtmlComponent.prototype.initDom = function (domElement) {
		if (this.domElement && this.domElement.parentNode !== null) {
			this.domElement.parentNode.removeChild(this.domElement);
		}
		if (!this.useTransformComponent) {
			this.domElement = domElement;
			domElement.style.position = 'absolute';
			return;
		}
		this.domElement = document.createElement('div');
		if (domElement) {
			this.domElement.appendChild(domElement);
		}
		this.domElement.style.position = 'absolute';
		this.domElement.style.margin = '0px';
		this.domElement.style.padding = '0px';
		this.domElement.style.backgroundColor = 'white';
		this.domElement.style.WebkitBackfaceVisibility = this.backfaceVisibility;
		this.domElement.style.backfaceVisibility = this.backfaceVisibility;
		// domElement.style.position = 'absolute';
		// domElement.style.top = '0px';
		// domElement.style.bottom = '0px';
		// domElement.style.left = '0px';
		// domElement.style.right = '0px';
		this.setSize(this.width, this.height);
	};

	HtmlComponent.prototype.setSize = function (width, height) {
		var xdiff = this.width / width;
		var ydiff = this.height / height;
		this.width = width || this.width;
		this.height = height || this.height;
		this.domElement.style.width = this.width + 'px';
		this.domElement.style.height = this.height + 'px';

		// fix quad size
		var entity = this.entity;
		if (entity && entity.meshDataComponent /*&& entity.meshDataComponent.meshData instanceof Quad*/) {
			entity.meshDataComponent.meshData.xExtent = width * 0.5;
			entity.meshDataComponent.meshData.yExtent = height * 0.5;
			entity.meshDataComponent.meshData.rebuild();
			entity.meshDataComponent.meshData.setVertexDataUpdated();
			entity.transformComponent.transform.scale.scale(xdiff, ydiff, 1);
			entity.transformComponent.setUpdated();
		}
		this.updated = true;
	};

	HtmlComponent.prototype.destroy = function (context) {
		this.meshData.destroy(context);
	};

	return HtmlComponent;
});
