"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class postController {
    constructor() {
        this.index = (req, res, next) => {
            const startIndex = process.env.IMG_START_INDEX ? parseInt(process.env.IMG_START_INDEX) : 0;
            const endIndex = process.env.IMG_END_INDEX ? parseInt(process.env.IMG_END_INDEX) : 0;
            const startIndexBoy = process.env.IMG_START_INDEX ? parseInt(process.env.IMG_START_INDEX) : 0;
            const endIndexBoy = process.env.IMG_END_INDEX ? parseInt(process.env.IMG_END_INDEX) : 0;
            const startIndexGirl = process.env.IMG_BOY_START_INDEX ? parseInt(process.env.IMG_BOY_START_INDEX) : 0;
            const endIndexGirl = process.env.IMG_BOY_END_INDEX ? parseInt(process.env.IMG_BOY_END_INDEX) : 0;
            res.
                status(200).
                json({
                all: {
                    strat: startIndex,
                    end: endIndex
                },
                boy: {
                    strat: startIndexBoy,
                    end: endIndexBoy
                },
                girl: {
                    strat: startIndexGirl,
                    end: endIndexGirl
                },
            });
        };
    }
}
exports.default = new postController();
