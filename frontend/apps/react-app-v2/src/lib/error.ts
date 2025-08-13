export class ErrServerNotFound extends Error {
    constructor() {
        super();
        this.message = "Server Not Found";
        this.name = "ErrServerNotFound";
    }
}

export class ErrUnknown extends Error {
    constructor() {
        super();
        this.message = "Unknown Error Occurred";
        this.name = "ErrUnknown";
    }
}

export class ErrChannelNotFound extends Error {
    constructor() {
        super();
        this.message = "Channel Not Found";
        this.name = "ErrChannelNotFound";
    }
}

export class ErrRoleNotFound extends Error {
    constructor() {
        super();
        this.message = "Role Not Found";
        this.name = "ErrRoleNotFound";
    }
}

export class ErrUserNotInitialised extends Error {
    constructor() {
        super();
        this.message = "User Not Initialised";
        this.name = "ErrUserNotInitialised";
    }
}
