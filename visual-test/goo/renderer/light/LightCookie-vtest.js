require([
	'goo/math/Vector3',
	'goo/math/Quaternion',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight',
	'goo/debugpack/systems/DebugRenderSystem',
	'goo/renderer/TextureCreator',
	'goo/shapes/Quad',
	'goo/entities/components/ScriptComponent',
	'lib/V'
], function (
	Vector3,
	Quaternion,
	DirectionalLight,
	SpotLight,
	DebugRenderSystem,
	TextureCreator,
	Quad,
	ScriptComponent,
	V
	) {
	'use strict';

	var lightRotationAngle = 0;
	var targetPos = new Vector3();
	var rotQuat = new Quaternion();

	V.describe('Test the light cookie functionality of DirectionalLight and SpotLight.');

	function addDirectionalLight() {
		var directionalLight = new DirectionalLight(new Vector3(1, 1, 1));
		directionalLight.intensity = 0.5;
		var directionalEntity = goo.world.createEntity(directionalLight, [0, 0, 5]).addToWorld();
		new TextureCreator().loadTexture2D('../../../resources/goo.png').then(function (texture) {
			directionalLight.lightCookie = texture;
		});
		return directionalEntity;
	}

	function addSpotLight() {
		var spotLight = new SpotLight(new Vector3(1, 1, 1));
		spotLight.angle = 45;
		spotLight.range = 100;
		spotLight.penumbra = 5;
		
		new TextureCreator().loadTexture2D('../../../resources/Pot_Diffuse.dds').then(function (texture) {
			spotLight.lightCookie = texture;
		});

		var spotEntity = goo.world.createEntity('spotLight', spotLight, [0, 0, 7]);
		
		spotEntity.set(new ScriptComponent({
			run: function(entity, tpf) {
				var rot = Math.PI * 0.2 * tpf;
				lightRotationAngle += rot;
				var ypan = Math.sin(entity._world.time) * 0.3;
				var xpan = Math.cos(entity._world.time) * 0.1;
				targetPos.setDirect(xpan, ypan, 1);
				targetPos.normalize();
				rotQuat.fromAngleNormalAxis(lightRotationAngle, targetPos);

				var rotMat = spotEntity.transformComponent.transform.rotation;
				rotQuat.toRotationMatrix(rotMat);
				spotEntity.transformComponent._dirty = true;
			
				if (lightRotationAngle >= Math.PI * 2) {
					lightRotationAngle = Math.PI * 2 - lightRotationAngle;
				}
			}
		}));

		return spotEntity.addToWorld();
	}

	var goo = V.initGoo();
	var world = goo.world;

	var debugRenderSystem = new DebugRenderSystem();
	debugRenderSystem.doRender.LightComponent = true;
	goo.renderSystems.push(debugRenderSystem);
	world.setSystem(debugRenderSystem);

	//addDirectionalLight();
	addSpotLight();

	// Backdrop
	var quadSize = 1000;
	world.createEntity(new Quad(quadSize, quadSize), V.getColoredMaterial(1,1,1,1), [0, 0, -50]).addToWorld();

	var spheres = V.addSpheres(5).toArray();

	// camera
	V.addOrbitCamera([20, Math.PI/2, 0]);

	V.process();
});