export class ErrServerNotFound extends Error {
    constructor() {
        super();
        this.message = "Server Not Found";
        this.name = "ErrServerNotFound";
    }
}

export class ErrChannelNotFound extends Error {
    constructor() {
        super();
        this.message = "Channel Not Found";
        this.name = "ErrChannelNotFound";
    }
}

export class ErrUserNotInitialised extends Error {
    constructor() {
        super();
        this.message = "User Not Initialised";
        this.name = "ErrUserNotInitialised";
    }
}
