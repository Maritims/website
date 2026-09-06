import {Mat4} from "../math/mat4.js";

export class Camera {
    constructor(x = 0, y = 1.6, z = 3.0, yaw = 0, pitch = 0, roll = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.yaw = yaw;   // Rotation around the Y-axis: Turning left and right.
        this.pitch = pitch; // Rotation around the X-axis: Tilting up and down.
        this.roll = roll;  // Rotation around the Z-axis: Tilt head side-to-side.

        this.moveSpeed = 0.02;
        this.turnSpeed = 0.005;
    }

    update(keys) {
        // Turn left.
        if (keys['a']) {
            this.yaw += this.turnSpeed;
        }
        // Turn right.
        if (keys['d']) {
            this.yaw -= this.turnSpeed;
        }

        if(keys['r'] || keys['arrowup']) {
            this.pitch += this.turnSpeed;
        }
        if (keys['f'] || keys['arrowdown']) {
            this.pitch -= this.turnSpeed;
        }

        // Clamp pitch to prevent flipping over backward/forward (approx. +/- 85 degrees)
        const maxPitch = Math.PI / 2 - 0.05;
        this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

        if (keys['z']) {
            this.roll += this.turnSpeed;
        }
        if(keys['c']) {
            this.roll -= this.turnSpeed;
        }

        const forwardX = -Math.sin(this.yaw);
        const forwardZ = -Math.cos(this.yaw);

        const rightX = Math.cos(this.yaw);
        const rightZ = -Math.sin(this.yaw);

        // Move forwards.
        if (keys['w']) {
            this.x += forwardX * this.moveSpeed;
            this.z += forwardZ * this.moveSpeed;
        }
        // Move backwards.
        if (keys['s']) {
            this.x -= forwardX * this.moveSpeed;
            this.z -= forwardZ * this.moveSpeed;
        }

        // Strafe left.
        if (keys['q']) {
            this.x -= rightX * this.moveSpeed;
            this.z -= rightZ * this.moveSpeed;
        }
        // Strafe right.
        if (keys['e']) {
            this.x += rightX * this.moveSpeed;
            this.z += rightZ * this.moveSpeed;
        }

        // Move downards.
        if (keys['x']) {
            this.y -= this.moveSpeed;
        }
        // Move upwards.
        if (keys[' ']) {
            this.y += this.moveSpeed;
        }
    }

    getViewMatrix() {
        // The view matrix inverses the camera's world transform
        return new Mat4()
            .rotateZ(-this.roll)
            .rotateX(-this.pitch)
            .rotateY(-this.yaw)
            .translate(-this.x, -this.y, -this.z);
    }
}