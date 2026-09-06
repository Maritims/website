import {GeometryBuilder} from "./geometry-builder.js";
import {Mesh} from "./mesh.js";

export class PlaneMesh extends Mesh {
    constructor(ctx, width = 1.0, depth = 1.0) {
        const hw = width / 2;
        const hd = depth / 2;

        const meshData = new GeometryBuilder()
            .addQuad(
                [-hw, 0, hd],
                [hw, 0, hd],
                [hw, 0, -hd],
                [-hw, 0, -hd],
                [0, 1, 0],                              // Normal pointing straight up.
                [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0]  // UVs
            )
            .build();

        super(ctx, meshData.vertices, meshData.indices);
    }
}