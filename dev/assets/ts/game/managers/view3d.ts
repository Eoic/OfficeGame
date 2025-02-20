import * as THREE from 'three';
import { Octree } from 'three/examples/jsm/math/Octree';
import { Capsule } from 'three/examples/jsm/math/Capsule';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Multiplayer from './multiplayer';

export default class View3D {
    container: HTMLElement;
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    clock: THREE.Clock;
    spheres: Array<BulletData> = [];
    sphereIdx: number = 0;
    worldOctree: Octree;
    playerCollider: Capsule;
    playerDirection: THREE.Vector3 = new THREE.Vector3();
    playerVelocity: THREE.Vector3 = new THREE.Vector3();
    playerOnFloor: boolean = false;
    mouseTime: number = 0;
    vector1: THREE.Vector3 = new THREE.Vector3();
    vector2: THREE.Vector3 = new THREE.Vector3();
    vector3: THREE.Vector3 = new THREE.Vector3();
    keyStates: Record<string, boolean> = {};

    static readonly GRAVITY = 30;
    static readonly NUM_SPHERES = 100;
    static readonly SPHERE_RADIUS = 0.2;
    static readonly STEPS_PER_FRAME = 5;
    static readonly SCENE_SCALE = 6;

    constructor (containerID: string) {
        let viewContainer = document.getElementById(containerID);
        this.container = viewContainer ? viewContainer : document.createElement('div');
        
        this.clock = new THREE.Clock();

        this.setupRenderer();
        this.setupLights();
        this.setupSpheres();

        this.worldOctree = new Octree();
        this.playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35);

        this.loadModels();

        document.addEventListener('keydown', event => {
            this.keyStates[event.code] = true;
        });

        document.addEventListener('keyup', event => {
            this.keyStates[event.code] = false;
        })

        this.container.addEventListener('mousedown', () => {
            document.body.requestPointerLock();
            this.mouseTime = performance.now();
        });

        document.addEventListener('mouseup', () => {
            if (document.pointerLockElement !== null) this.throwBall();
        });

        document.addEventListener('mousemove', event => {
            if (document.pointerLockElement === document.body) {
                this.camera.rotation.y -= event.movementX / 500;
                this.camera.rotation.x -= event.movementY / 500;
            }
        });

        window.addEventListener('resize', () => this.on_resize());
    }

    on_resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    throwBall() {
        const sphere = this.spheres[this.sphereIdx];
        this.camera.getWorldDirection(this.playerDirection);
        sphere.collider.center.copy(this.playerCollider.end).addScaledVector(this.playerDirection, this.playerCollider.radius * 1.5);
        const impulse = 15 + 30 * (1 - Math.exp((this.mouseTime - performance.now()) * 0.001));
        sphere.velocity.copy(this.playerDirection).multiplyScalar(impulse);
        sphere.velocity.addScaledVector(this.playerVelocity, 2);
        this.sphereIdx = (this.sphereIdx + 1) % this.spheres.length;
    }

    playerCollisions() {

        const result = this.worldOctree.capsuleIntersect( this.playerCollider );

        this.playerOnFloor = false;

        if ( result ) {

            this.playerOnFloor = result.normal.y > 0;

            if ( ! this.playerOnFloor ) {

                this.playerVelocity.addScaledVector( result.normal, - result.normal.dot( this.playerVelocity ) );

            }

            this.playerCollider.translate( result.normal.multiplyScalar( result.depth ) );

        }

    }

    updatePlayer( deltaTime: number ) {

        let damping = Math.exp( - 4 * deltaTime ) - 1;

        if ( ! this.playerOnFloor ) {

            this.playerVelocity.y -= View3D.GRAVITY * deltaTime;

            // small air resistance
            damping *= 0.1;

        }

        this.playerVelocity.addScaledVector( this.playerVelocity, damping );

        const deltaPosition = this.playerVelocity.clone().multiplyScalar( deltaTime );
        this.playerCollider.translate( deltaPosition );

        this.playerCollisions();

        this.camera.position.copy( this.playerCollider.end );

    }

    playerSphereCollision( sphere: BulletData ) {

        const center = this.vector1.addVectors( this.playerCollider.start, this.playerCollider.end ).multiplyScalar( 0.5 );

        const sphere_center = sphere.collider.center;

        const r = this.playerCollider.radius + sphere.collider.radius;
        const r2 = r * r;

        // approximation: player = 3 spheres

        for ( const point of [ this.playerCollider.start, this.playerCollider.end, center ] ) {

            const d2 = point.distanceToSquared( sphere_center );

            if ( d2 < r2 ) {

                const normal = this.vector1.subVectors( point, sphere_center ).normalize();
                const v1 = this.vector2.copy( normal ).multiplyScalar( normal.dot( this.playerVelocity ) );
                const v2 = this.vector3.copy( normal ).multiplyScalar( normal.dot( sphere.velocity ) );

                this.playerVelocity.add( v2 ).sub( v1 );
                sphere.velocity.add( v1 ).sub( v2 );

                const d = ( r - Math.sqrt( d2 ) ) / 2;
                sphere_center.addScaledVector( normal, - d );

            }

        }

    }

    spheresCollisions() {

        for ( let i = 0, length = this.spheres.length; i < length; i ++ ) {

            const s1 = this.spheres[ i ];

            for ( let j = i + 1; j < length; j ++ ) {

                const s2 = this.spheres[ j ];

                const d2 = s1.collider.center.distanceToSquared( s2.collider.center );
                const r = s1.collider.radius + s2.collider.radius;
                const r2 = r * r;

                if ( d2 < r2 ) {

                    const normal = this.vector1.subVectors( s1.collider.center, s2.collider.center ).normalize();
                    const v1 = this.vector2.copy( normal ).multiplyScalar( normal.dot( s1.velocity ) );
                    const v2 = this.vector3.copy( normal ).multiplyScalar( normal.dot( s2.velocity ) );

                    s1.velocity.add( v2 ).sub( v1 );
                    s2.velocity.add( v1 ).sub( v2 );

                    const d = ( r - Math.sqrt( d2 ) ) / 2;

                    s1.collider.center.addScaledVector( normal, d );
                    s2.collider.center.addScaledVector( normal, - d );

                }

            }

        }

    }

    updateSpheres( deltaTime: number ) {

        this.spheres.forEach( sphere => {

            sphere.collider.center.addScaledVector( sphere.velocity, deltaTime );

            const result = this.worldOctree.sphereIntersect( sphere.collider );

            if ( result ) {

                sphere.velocity.addScaledVector( result.normal, - result.normal.dot( sphere.velocity ) * 1.5 );
                sphere.collider.center.add( result.normal.multiplyScalar( result.depth ) );

            } else {

                sphere.velocity.y -= View3D.GRAVITY * deltaTime;

            }

            const damping = Math.exp( - 1.5 * deltaTime ) - 1;
            sphere.velocity.addScaledVector( sphere.velocity, damping );

            this.playerSphereCollision( sphere );

        } );

        this.spheresCollisions();

        for ( const sphere of this.spheres ) {

            sphere.mesh.position.copy( sphere.collider.center );

        }

    }

    getForwardVector() {

        this.camera.getWorldDirection( this.playerDirection );
        this.playerDirection.y = 0;
        this.playerDirection.normalize();

        return this.playerDirection;

    }

    getSideVector() {

        this.camera.getWorldDirection( this.playerDirection );
        this.playerDirection.y = 0;
        this.playerDirection.normalize();
        this.playerDirection.cross( this.camera.up );

        return this.playerDirection;

    }

    controls( deltaTime: number ) {

        // gives a bit of air control
        const speedDelta = deltaTime * ( this.playerOnFloor ? 25 : 8 );

        if ( this.keyStates[ 'KeyW' ] ) {

            this.playerVelocity.add( this.getForwardVector().multiplyScalar( speedDelta ) );

        }

        if ( this.keyStates[ 'KeyS' ] ) {

            this.playerVelocity.add( this.getForwardVector().multiplyScalar( - speedDelta ) );

        }

        if ( this.keyStates[ 'KeyA' ] ) {

            this.playerVelocity.add( this.getSideVector().multiplyScalar( - speedDelta ) );

        }

        if ( this.keyStates[ 'KeyD' ] ) {

            this.playerVelocity.add( this.getSideVector().multiplyScalar( speedDelta ) );

        }

        if ( this.playerOnFloor ) {

            if ( this.keyStates[ 'Space' ] ) {

                this.playerVelocity.y = 15;

            }

        }

    }






    loadModels() {
        const loader = new GLTFLoader().setPath( '/static/' );

        loader.load( 'petrausko_g-26_remix.glb', ( gltf ) => {
            console.log(gltf);
            gltf.scene.scale.set(View3D.SCENE_SCALE, View3D.SCENE_SCALE, View3D.SCENE_SCALE);
            this.scene.add( gltf.scene );
            console.log("Main visual scene is loaded...")
    
            gltf.scene.traverse( (child: THREE.Mesh) => {
    
                if ( child.isMesh ) {
                    child.castShadow = true;
                    child.receiveShadow = true;
    
                    if (child.material instanceof THREE.MeshPhysicalMaterial) {
                        // child.material.map.anisotropy = 4;
                        child.material.side = THREE.DoubleSide;
                    } else if (child.material instanceof THREE.MeshStandardMaterial) {
                        child.material.side = THREE.DoubleSide;
                    } else {
                        console.warn(`Unhandled: `, child.material);
                    }

                    this.setupObjectMaterials(child);
                }
    
            } );
        } );

        loader.load( 'petrausko_g-26_collisions.glb', ( gltf ) => {
            console.log(gltf);
            gltf.scene.scale.set(View3D.SCENE_SCALE, View3D.SCENE_SCALE, View3D.SCENE_SCALE);
            console.warn("Collisions are loaded...")
    
            this.worldOctree.fromGraphNode( gltf.scene );
    
            gltf.scene.traverse( (child: THREE.Mesh) => {
    
                if ( child.isMesh ) {
    
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    if (child.material instanceof THREE.MeshPhysicalMaterial) {
                        child.material.map.anisotropy = 4;
                        child.material.side = THREE.DoubleSide;
                    } else if (child.material instanceof THREE.MeshStandardMaterial) {
                        child.material.side = THREE.DoubleSide;
                    } else {
                        console.warn(`Unhandled: `, child.material);
                    }
                }
    
            } );
        } );
    }


    setupObjectMaterials(object: THREE.Mesh) {
        switch (object.name) {
            case 'floor':
                if (object.material instanceof THREE.MeshStandardMaterial) {
                    object.material.map.repeat.set(10, 10);
                    object.material.color.set(0.3, 0.3, 0.35);
                }
                break;
            // Seat 1
            case 'Plane087':
                break
            case 'Plane087_1':
                if (object.material instanceof THREE.MeshStandardMaterial) {
                    object.material.color = new THREE.Color(0x57B434);
                }
                break;
            case 'Plane087_2':
                if (object.material instanceof THREE.MeshStandardMaterial) {
                    object.material.metalness = 0.9;
                }
                break;
            case 'Plane087_3':
                break;
            case 'Plane087_4':
                if (object.material instanceof THREE.MeshStandardMaterial) {
                    object.material.color = new THREE.Color(0x252525);
                }
                break;
            // Bottle
            case 'Plane030':
                if (object.material instanceof THREE.MeshStandardMaterial) {
                    object.material.opacity = 0.1;
                }
                break;
            case 'Plane030_1':
            case 'Plane030_2':
                break;
            case 'Suzanne':
                if (object.material instanceof THREE.MeshStandardMaterial) {
                    object.material.opacity = 0.2;
                }
                break;
            case 'radiator001':
            case 'radiator009':
                if (object.material instanceof THREE.MeshStandardMaterial) {
                    object.material.metalness = 0;
                }
                break;
            case 'electrics000':
            case 'electrics001':
            case 'electrics002':
            case 'electrics003':
            case 'electrics006':
            case 'electrics007':
                if (object.material instanceof THREE.MeshStandardMaterial) {
                    object.material.metalness = 0;
                }
                break;
            case 'langas':
                break;
            case 'langas_1':
                if (object.material instanceof THREE.MeshStandardMaterial) {
                    object.material.opacity = 0.2;
                }
                break;
            case 'langas_2':
            case 'langas_3':
            case 'langas_4':
            case 'langas_5':
            case 'langas_6':
            case 'langas_7':
            case 'langas_8':
            case 'langas_9':
            case 'langas_10':
            case 'langas_11':
            case 'langas_12':
            case 'langas_13':
            case 'langas_14':
                break;
            case 'Cube076':
                break;
            case 'Cube076_1':
                if (object.material instanceof THREE.MeshStandardMaterial) {
                    object.material.opacity = 0.2;
                }
            case 'Cube076_2':
            case 'Cube076_3':
                if (object.material instanceof THREE.MeshStandardMaterial) {
                    object.material.metalness = 0.8;
                }
                break;
            default:
                console.log(object.name)
                break;
        }
    }


    teleportPlayerIfOob() {

        if ( this.camera.position.y <= - 25 ) {

            this.playerCollider.start.set( 0, 0.35, 0 );
            this.playerCollider.end.set( 0, 1, 0 );
            this.playerCollider.radius = 0.35;
            this.camera.position.copy( this.playerCollider.end );
            this.camera.rotation.set( 0, 0, 0 );

        }

    }


    animate() {

        const deltaTime = Math.min( 0.05, this.clock.getDelta() ) / View3D.STEPS_PER_FRAME;

        // we look for collisions in substeps to mitigate the risk of
        // an object traversing another too quickly for detection.

        for ( let i = 0; i < View3D.STEPS_PER_FRAME; i ++ ) {

            this.controls( deltaTime );

            this.updatePlayer( deltaTime );

            this.updateSpheres( deltaTime );

            this.teleportPlayerIfOob();

        }

        this.renderer.render( this.scene, this.camera );

        Multiplayer.sendMessage({
            'position': [this.camera.position.x, this.camera.position.y, this.camera.position.z],
            'rotation': [this.camera.rotation.x, this.camera.rotation.y, this.camera.rotation.z],
            'bullets': {
                '0': [0, 0, 0],
                '1': [0, 0, 0],
                '2': [0, 0, 0],
            }
        });
    }


    setupRenderer() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);
        // this.scene.fog = new THREE.Fog(0x88ccee, 0, 50);

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.rotation.order = 'YXZ';

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setAnimationLoop(this.animate.bind(this));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.VSMShadowMap;
        // this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.container.appendChild(this.renderer.domElement);
    }

    setupLights() {
        // const fillLight1 = new THREE.HemisphereLight(0x8dc1de, 0xffffff, 1.5);
        // fillLight1.position.set(2, 1, 1);
        // this.scene.add(fillLight1);
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
        // directionalLight.position.set(2, 4, 2);
        // directionalLight.castShadow = true;
        // directionalLight.shadow.camera.near = 0.01;
        // directionalLight.shadow.camera.far = 500;
        // directionalLight.shadow.camera.right = 30;
        // directionalLight.shadow.camera.left = -30;
        // directionalLight.shadow.camera.top = 30;
        // directionalLight.shadow.camera.bottom = -30;
        // directionalLight.shadow.mapSize.width = 1024;
        // directionalLight.shadow.mapSize.height = 1024;
        // directionalLight.shadow.radius = 4;
        // directionalLight.shadow.bias = -0.00006;
        // this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xFB9200, 2, 100, 1);
        pointLight.position.set(3.2 * View3D.SCENE_SCALE, 1 * View3D.SCENE_SCALE, -1.15 * View3D.SCENE_SCALE);
        pointLight.castShadow = true;
        pointLight.shadow.camera.near = 0.01;
        pointLight.shadow.camera.far = 500;
        pointLight.shadow.mapSize.width = 1024;
        pointLight.shadow.mapSize.height = 1024;
        pointLight.shadow.radius = 4;
        pointLight.shadow.bias = -0.00006;
        this.scene.add(pointLight);


        const pointLight2 = new THREE.PointLight(0xFFFFFF, 10, 100, 1);
        pointLight2.position.set(0, 2 * View3D.SCENE_SCALE, 0);
        pointLight2.castShadow = true;
        pointLight2.shadow.camera.near = 0.01;
        pointLight2.shadow.camera.far = 500;
        pointLight2.shadow.mapSize.width = 1024*4;
        pointLight2.shadow.mapSize.height = 1024*4;
        pointLight2.shadow.radius = 4;
        pointLight2.shadow.bias = -0.00006;
        pointLight2.shadow.blurSamples = 25;
        this.scene.add(pointLight2);
    }

    setupSpheres() {
        const sphereGeometry = new THREE.IcosahedronGeometry(View3D.SPHERE_RADIUS, 5);
        const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xdede8d });

        for (let i = 0; i < View3D.NUM_SPHERES; i++) {
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.castShadow = true;
            sphere.receiveShadow = true;

            this.scene.add(sphere);

            this.spheres.push({
                mesh: sphere,
                collider: new THREE.Sphere(new THREE.Vector3(0, -100, 0), View3D.SPHERE_RADIUS),
                velocity: new THREE.Vector3()
            });
        }
    }
}

interface BulletData {
    mesh: THREE.Mesh,
    collider: THREE.Sphere,
    velocity: THREE.Vector3
};