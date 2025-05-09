
## 🔧 Project Overview – "3D Car Game with Physics"

This project is a **3D car simulation game** built using **React Three Fiber**, which is a React wrapper over the **Three.js** 3D graphics library. We also use **Cannon.js** for realistic physics — like gravity, movement, collisions.

---

## 🎯 Objective

To allow a user to control a car in a 3D environment with physics like:
- Gravity
- Collisions with obstacles
- Camera following the car
- Smooth movement

---

## ⚙️ Tools & Libraries Used

| Tool/Library           | Purpose |
|------------------------|---------|
| **React Three Fiber**  | Renders 3D scene using JSX in React |
| **Three.js (internal)**| Handles 3D graphics under the hood |
| **Cannon.js**          | Adds real-world physics like gravity, force |
| **@react-three/cannon**| Connects Cannon physics to Three.js objects |
| **Drei**               | Helpful tools for lights, camera, etc. |
| **React**              | Core UI framework |

---

## 🧱 Components & What They Do

### 1. **Canvas**
- The `<Canvas>` component is like a stage or screen.
- Everything in the 3D world is placed inside it.

---

### 2. **Physics**
- `<Physics>` is used to enable gravity and other physics rules.
- Inside this, we place objects that should follow physics, like the car and obstacles.

---

### 3. **Car**
- A custom component created using a **Box shape**.
- Physics are applied using `useBox()` from Cannon.js.
- Movement is handled using `keyboard controls`.
- The car responds to:
  - **Forward/Backward keys**
  - **Left/Right keys**
  - Applies **force or velocity** depending on key press.

---

### 4. **Ground**
- Created using a **Plane shape**.
- Physics `usePlane()` is used to make the car sit on it.
- Ground is static (doesn't move), the car moves on it.

---

### 5. **Obstacles / Boundaries**
- Created using Box shapes.
- Placed at the sides and in the path to act as **walls or obstacles**.
- Have `collision` detection so that car doesn’t pass through.

---

### 6. **Camera**
- The camera automatically follows the car using a method called `lerp()` (linear interpolation).
- Camera stays a little behind and above the car, giving a third-person view.

---

### 7. **useFrame()**
- This is like a `game loop` that runs every frame (like 60 times per second).
- Used to update:
  - Car position
  - Camera following
  - Handling controls

---

## 🧠 Concepts from Computer Graphics Applied

| Concept | How It's Used |
|--------|---------------|
| **3D Objects** | Car, ground, walls, obstacles |
| **Transformations** | Position, rotation of car and camera |
| **Camera & View Matrix** | Used to give third-person view |
| **Lighting** | To make the scene visible and realistic |
| **Collision Detection** | From Cannon.js – detects car hitting walls |
| **Physics Simulation** | Gravity, force, velocity applied to car |
| **Render Loop** | Done using `useFrame()` – like a game refresh cycle |
| **Material & Shading** | `meshStandardMaterial` used for realistic surface look |

---

## 💡 How the Game Works (Step-by-Step)

1. Page loads → `<Canvas>` is created → Scene is set up.
2. Inside `<Physics>`, objects like the car and ground are placed.
3. Car is created using a Box mesh and given physics properties like mass and position.
4. Keyboard input moves the car using velocity or force.
5. Camera follows the car using a smooth animation.
6. `useFrame()` updates the car and camera every frame.
7. When the car collides with boundaries, physics engine handles the stopping.

---
