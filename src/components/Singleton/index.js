export class SingletonClass {
    constructor(name = "") {
        if (!!SingletonClass.instance) {
            return SingletonClass.instance;
        }

        SingletonClass.instance = this;

        this.name = name;

        return this;
    }

    getName() {
        return this.name;
    }
}

export function Singleton(name = '') {
    if (!Singleton._instance) {
        Singleton._instance = this;
    }
    this.name = name
    return Singleton._instance;
}