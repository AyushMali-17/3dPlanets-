const scene = new THREE.Scene();
scene.background = new THREE.CubeTextureLoader()
  .setPath('textures/')
  .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']); // Set up a starry background
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const labelRenderer = new THREE.CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
document.body.appendChild(labelRenderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);

function createOrbit(distance, color) {
    const orbitGeometry = new THREE.RingGeometry(distance - 0.2, distance + 0.2, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);
}

function createPlanet(size, color, distance, name, moons) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: color, flatShading: true });
    const planet = new THREE.Mesh(geometry, material);
    planet.position.x = distance;
    planet.name = name;
    createOrbit(distance, 0x888888);
    if (moons) {
        moons.forEach(moon => {
            const moonGeometry = new THREE.SphereGeometry(moon.size, 16, 16);
            const moonMaterial = new THREE.MeshStandardMaterial({ color: moon.color });
            const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
            moonMesh.position.set(moon.distance, 0, 0);
            planet.add(moonMesh);
        });
    }
    return planet;
}

function createLabel(name, vector) {
    const div = document.createElement('div');
    div.className = 'label';
    div.textContent = name;
    div.style.marginTop = '-1em';
    const label = new THREE.CSS2DObject(div);
    label.position.set(vector.x, vector.y, vector.z);
    return label;
}

const sun = createPlanet(5, 0xFFFF00, 0, 'Sun', []);
scene.add(sun);
const planets = [
    createPlanet(1, 0x0000FF, 10, 'Earth', [{size: 0.1, color: 0xAAAAAA, distance: 2}]),
    createPlanet(0.8, 0xFF5733, 18, 'Mars', []),
    createPlanet(1.2, 0xBADA55, 25, 'Venus', []),
    createPlanet(2, 0x666666, 35, 'Jupiter', [{size: 0.4, color: 0xBBBBBB, distance: 3}, {size: 0.3, color: 0xBBBBBB, distance: 5}])
];
planets.forEach(planet => {
    scene.add(planet);
    const label = createLabel(planet.name, planet.position);
    planet.add(label);
});

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
camera.position.z = 50;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function onClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        const obj = intersects[0].object;
        const info = document.getElementById('info');
        info.style.display = 'block';
        info.innerHTML = 'Clicked on: ' + obj.name + '<br>' + 'Details about the planet or moon will be shown here.';
    }
}

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('click', onClick, false);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}
animate();
